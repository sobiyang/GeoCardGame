function Player(seat, max_card_count, health) {
    if (seat === null) {
        console.log("Please provide a seat.");
        return;
    }
    if (max_card_count === null) {
        console.log("Please determine player's maximum card size.");
        return;
    }
    if (health === null) {
        console.log("Please determine player's health.");
        return;
    }
    this.seat = seat;
    this.health = health;
    this.max_card_count = max_card_count;
    this.deck = [];
    this.tappedCards = [];

    switch (seat) {
        case 0:
            this.baseX = 10;
            this.baseY = 410;
            break;
        case 1:
            this.baseX = 60;
            this.baseY = 10;
            break;
        default:
            break;
    }

    this.shield = new Kinetic.Rect({
        x: this.baseX - 10,
        y: this.baseY - 10,
        width: 500,
        height: 180,
        stroke: 'gold',
        strokeWidth: 5,
        visible: false,
        shadowColor: 'white',
        shadowBlur: 10
    });
    cardLayer.add(this.shield);
    this.shield.setZIndex(-10);
    this.initCards();

}

Player.prototype.initCards = function() {
    var i = 0;
    var type = 0;
    for (i; i < this.max_card_count; i++) {
        type = Math.floor((Math.random() * 4));
        var card = new Card(type, cardLayer, this.seat, this.baseX + i * (cardWidth + 20), this.baseY);
        this.deck.push(card);
        if (this.seat === 0)
            this.intMouseInOutHandler(card);
    }
    cardLayer.draw();
};

// Remove all event listeners
Player.prototype.removeCardMouseHandler = function(card) {
    card.bg.off('click');
    card.bg.off('mouseover');
    card.bg.off('mouseout');
    card.pattern.off('click');
    card.pattern.off('mouseover');
    card.pattern.off('mouseout');
};

Player.prototype.clickHander = function(evt) {
    for (var i = 0; i < this.deck.length; i++) {
        if (this.deck[i].pattern === evt.targetNode ||
                this.deck[i].pattern === evt.targetNode.parent ||
                this.deck[i].bg === evt.targetNode)
            break;
    }
    this.toggleTapped(i);
};

Player.prototype.intMouseInOutHandler = function(card) {

    card.bg.on('mouseover', function() {
        card.bg.enableStroke();
        cardLayer.draw();
    });
    card.bg.on('mouseout', function() {
        card.bg.disableStroke();
        cardLayer.draw();
    });
    card.pattern.on('mouseover', function() {
        card.bg.enableStroke();
        cardLayer.draw();
    });

    card.bg.on('click', this.clickHander.bind(this));
    card.pattern.on('click', this.clickHander.bind(this));
};

Player.prototype.toggleTapped = function(i) {
    if (this.deck[i].tapped) {
        var obj = {bg: this.deck[i].bg, pattern: this.deck[i].pattern, factor: 0};
        TweenLite.to(obj, 0.5, {factor: 1, onUpdate: function() {
                this.target.bg.setY(this.target.bg.getY() + this.target.factor);
                this.target.pattern.setY(this.target.pattern.getY() + this.target.factor);
                cardLayer.draw();
            }});
        this.deck[i].tapped = false;
    }
    else {
        var obj = {bg: this.deck[i].bg, pattern: this.deck[i].pattern, factor: 0};
        TweenLite.to(obj, 0.5, {factor: 1, onUpdate: function() {
                this.target.bg.setY(this.target.bg.getY() - this.target.factor);
                this.target.pattern.setY(this.target.pattern.getY() - this.target.factor);
                cardLayer.draw();
            }});
        this.deck[i].tapped = true;
    }
    this.tappedCards.length = 0;
    for (i = 0; i < this.deck.length; i++) {
        if (this.deck[i].tapped) {
            this.tappedCards.push(this.deck[i]);
        }
    }
};

Player.prototype.drawCard = function() {
    if (this.deck.length >= this.max_card_count) {
        alert("Card stack full!");
    }
    else {
        type = Math.floor((Math.random() * 4));
        var card = new Card(type, cardLayer, this.seat, this.baseX + this.deck.length * (cardWidth + 20), this.baseY);
        this.deck.push(card);
        if (this.seat === 0)
            this.intMouseInOutHandler(card);
        initStats();
        cardLayer.draw();

        toggleControls();
        if (this.seat === 0)
            moveAI();
    }
};

Player.prototype.discardCard = function() {
    if (this.tappedCards.length === 1) {
        var obj = {player: this, deck: this.deck, bg: this.tappedCards[0].bg, pattern: this.tappedCards[0].pattern, factor: 1};
        TweenLite.to(obj, 0.5, {factor: 0, onUpdate: function() {
                this.target.bg.setX(this.target.bg.getX() - 20);
                this.target.bg.setOpacity(this.target.factor);
                this.target.pattern.setX(this.target.pattern.getX() - 20);
                this.target.pattern.setOpacity(this.target.factor);
                cardLayer.draw();
            }, onComplete: function() {
                this.target.bg.remove();
                this.target.pattern.remove();
                cardLayer.draw();
                initStats();

                for (var i = 0; i < this.target.deck.length; i++) {
                    if (this.target.pattern === this.target.deck[i].pattern) {
                        this.target.player.removeCard(i);
                    }
                }

                if (this.seat === 0)
                    moveAI();
            }
        });
        toggleControls();
        if (this.seat === 0)
            moveAI();
    }
    else {
        alert("Please select ONE card");
    }
};

Player.prototype.removeCard = function(i) {
    this.deck.splice(i, 1);
    for (i; i < this.deck.length; i++) {
        this.deck[i].bg.setX(this.deck[i].bg.getX() - cardWidth - 20);
        this.deck[i].pattern.setX(this.deck[i].pattern.getX() - cardWidth - 20);
    }
    cardLayer.draw();
};

Player.prototype.mergeCards = function() {
    if (this.tappedCards.length === 2) {
        var newType = this.canMerge(this.tappedCards[0].type, this.tappedCards[1].type);
        if (newType < 4) {
            alert("These two cards can't merge");
        }
        else {
            var i = this.deck.indexOf(this.tappedCards[0]);
            this.removeCard(i);

            i = this.deck.indexOf(this.tappedCards[1]);
            this.removeCard(i);

            this.tappedCards[0].bg.remove();
            this.tappedCards[0].pattern.remove();
            this.tappedCards[1].bg.remove();
            this.tappedCards[1].pattern.remove();
            var card = new Card(newType, cardLayer, this.seat, this.baseX + this.deck.length * (cardWidth + 20), this.baseY);
            this.deck.push(card);
            this.intMouseInOutHandler(card);
            initStats();
            cardLayer.draw();
            toggleControls();
            if (this.seat === 0)
                moveAI();
        }
    }
    else {
        alert("Please select TWO cards");
    }
};

Player.prototype.playCard = function(target_player) {
    if (this.tappedCards.length === 1) {
        var obj = {
            player: this,
            target_player: target_player,
            bg: this.tappedCards[0].bg,
            pattern: this.tappedCards[0].pattern,
            factor: 1
        };
        TweenLite.to(obj, 1, {factor: 0, onUpdate: function() {
                if (this.target.player.seat === 0) {
                    this.target.bg.setY(this.target.bg.getY() - 10);
                    this.target.bg.setOpacity(this.target.factor);
                    this.target.pattern.setY(this.target.pattern.getY() - 10);
                    this.target.pattern.setOpacity(this.target.factor);
                }
                else {
                    this.target.bg.setY(this.target.bg.getY() + 10);
                    this.target.pattern.setY(this.target.pattern.getY() + 10);
                    if (!this.target.pattern.isVisible()) {
                        this.target.bg.setFill('white');
                        this.target.bg.setShadowColor('white');
                        this.target.pattern.setVisible(true);
                    }
                }
                cardLayer.draw();
            }, onComplete: function() {
                this.target.bg.remove();
                this.target.pattern.remove();
                cardLayer.draw();

                for (var i = 0; i < this.target.player.deck.length; i++) {
                    if (this.target.pattern === this.target.player.deck[i].pattern) {
                        switch (this.target.player.deck[i].type) {
                            case 0:
                                this.target.player.health += 1;
                                if (this.target.player.seat === 0)
                                    moveAI();
                                break;
                            case 1:
                                if (this.target.target_player.shield.isVisible()) {
                                    this.target.target_player.shieldDown();
                                }
                                else {
                                    this.target.target_player.health -= 1;
                                }
                                if (this.target.player.seat === 0)
                                    moveAI();
                                break;
                            case 2:
                                this.target.player.shieldUp();
                                if (this.target.player.seat === 0)
                                    moveAI();
                                break;
                            case 3:
                                if (this.target.target_player.shield.isVisible()) {
                                    this.target.target_player.shieldDown();
                                }
                                else {
                                    this.target.target_player.health -= 1;
                                }
                                if (this.target.player.seat === 0)
                                    moveAI();
                                break;
                            case 4:
                                if (this.target.target_player.shield.isVisible()) {
                                    this.target.target_player.shieldDown();
                                }
                                else {
                                    this.target.target_player.health -= 4;
                                }
                                if (this.target.player.seat === 0)
                                    moveAI();
                                break;
                            case 5:
                                this.target.player.health += 2;
                                if (this.target.player.seat === 0)
                                    moveAI();
                                break;
                            case 7:
                                turnOpCards();
                                break;
                            case 8:
                                showCardSelection();
                            default:
                                break;
                        }
                        this.target.player.removeCard(i);
                        initStats();
                        break;
                    }
                }
                toggleControls();
            }});
    }
    else {
        alert("Please select ONE card");
    }
};

Player.prototype.shieldUp = function() {
    this.shield.show();
};

Player.prototype.shieldDown = function() {
    this.shield.hide();
};

Player.prototype.canMerge = function(type1, type2) {
    if (type1 === 1 && type2 === 1)
        return 4;
    else if (type1 === 3 && type2 === 3)
        return 5;
    else if (type1 === 0 && type2 === 0)
        return 6;
    else if ((type1 === 0 && type2 === 3) ||
            (type1 === 3 && type2 === 0))
        return 7;
    else if ((type1 === 0 && type2 === 2) ||
            (type1 === 2 && type2 === 0))
        return 8;
    else
        return -1;
};


