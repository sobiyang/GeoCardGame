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
            this.baseX = stageWidth / 2 - 2.5 * (cardWidth + 20);
            this.baseY = stageHeight - cardHeight - 20;
            this.isCardFold = false;
            break;
        case 1:
            this.baseX = stageWidth / 2 - 2.5 * (cardWidth + 20);
            this.baseY = 10;
            this.isCardFold = true;
            break;
        default:
            break;
    }
    var shield = new createjs.Graphics();
    shield.setStrokeStyle(1, 'square');
    shield.beginStroke(createjs.Graphics.getRGB(198, 147, 10));
    shield.drawRect(0, 0, (cardWidth + 20) * 5, cardHeight + 20);
    shield.endStroke();
    this.shield = new createjs.Shape(shield);
    this.shield.x = this.baseX - 10;
    this.shield.y = this.baseY - 10;
    this.shield.visible = false;
    stage.addChild(this.shield);
    stage.update();

    this.initCards();

}

Player.prototype.initCards = function() {
    var i = 0;
    var type = 0;
    for (i; i < this.max_card_count; i++) {
        type = Math.floor((Math.random() * 4));
        var card = new Card(stage, this.baseX + i * (cardWidth + 20), this.baseY, type, this.isCardFold);
        this.deck.push(card);
        if (this.seat === 0) {
            this.initMouseInOutHandler(card);
        }
    }
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

Player.prototype.initMouseInOutHandler = function(card) {
    card.shape.addEventListener('mouseover', function(evt) {
        evt.target.shadow = new createjs.Shadow("#333333", 2, 2, 5);
        stage.update();
    });
    card.shape.addEventListener('mouseout', function(evt) {
        evt.target.shadow = null;
        stage.update();
    });
    card.shape.addEventListener('click', function(evt) {
        player1.toggleSelected(card);
    });
};

Player.prototype.toggleSelected = function(card) {
    var obj = {shape: card.shape, factor: 0};
    if (card.selected) {
        TweenLite.to(obj, 0.5, {factor: 1, onUpdate: function() {
                obj.shape.regY -= this.target.factor;
                stage.update();
            }});
        card.selected = false;
        this.tappedCards.length = 0;
        for (var i = 0; i < this.tappedCards.length; i++) {
            if (this.tappedCards[i] === card)
                this.tappedCards.splice(i, 1);
        }
    }
    else {
        TweenLite.to(obj, 0.5, {factor: 1, onUpdate: function() {
                obj.shape.regY += this.target.factor;
                stage.update();
            }});
        card.selected = true;
        this.tappedCards.push(card);
    }
    console.log(this.tappedCards);
};

Player.prototype.drawCard = function() {
    if (this.deck.length >= this.max_card_count) {
        alert("Card stack full!");
    }
    else {
        var type = Math.floor((Math.random() * 4));
        var card = new Card(stage, this.baseX + this.deck.length * (cardWidth + 20), this.baseY, type, this.isCardFold);
        this.deck.push(card);
        if (this.seat === 0)
            this.initMouseInOutHandler(card);
        initStats();
        toggleControls();
        if (this.seat === 0)
            moveAI();
    }
};

Player.prototype.discardCard = function() {
    if (this.tappedCards.length === 1) {
        var obj = {player: this, card: this.tappedCards[0], deck: this.deck, factor: 1};
        TweenLite.to(obj, 0.5, {factor: 0, onUpdate: function() {
                this.target.card.shape.x -= 20;
                this.target.card.shape.alpha = this.target.factor;
                stage.update();
            }, onComplete: function() {
                stage.removeChild(this.target.card);
                initStats();

                for (var i = 0; i < this.target.deck.length; i++) {
                    if (this.target.card === this.target.deck[i]) {
                        this.target.player.removeCard(i);
                    }
                }
                toggleControls();
                if (this.seat === 0)
                    moveAI();

            }
        });
    }
    else {
        alert("Please select ONE card");
    }
};

Player.prototype.removeCard = function(i) {
    this.deck.splice(i, 1);
    for (i; i < this.deck.length; i++) {
        this.deck[i].shape.x -= (cardWidth + 20);
    }
    stage.update();
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

            stage.removeChild(this.tappedCards[0].shape);
            stage.removeChild(this.tappedCards[1].shape);
            var card = new Card(stage, this.baseX + this.deck.length * (cardWidth + 20), this.baseY, newType, this.isCardFold);
            if (this.seat === 0) {
                this.initMouseInOutHandler(card);
            }

            this.deck.push(card);
            initStats();
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
            card: this.tappedCards[0],
            factor: 1
        };
        if (this.seat !== 0) {
            this.tappedCards[0].shape.filters = [];
            this.tappedCards[0].shape.cache(0, 0, cardWidth, cardHeight);
        }
        TweenLite.to(obj, 1, {factor: 0, onUpdate: function() {
                if (this.target.player.seat === 0) {
                    this.target.card.shape.regY -= -10;
                    this.target.card.shape.alpha = this.target.factor;
                    stage.update();
                }
                else {
                    this.target.card.shape.regY += -10;
                }
                stage.update();
            }, onComplete: function() {
                stage.removeChild(this.target.card.shape);

                for (var i = 0; i < this.target.player.deck.length; i++) {
                    if (this.target.card === this.target.player.deck[i]) {
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
    this.shield.visible = true;
};

Player.prototype.shieldDown = function() {
    this.shield.visible = false;
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


