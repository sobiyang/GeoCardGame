// Define the Player class
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
    this.max_health = this.health = health;
    this.max_card_count = max_card_count;
    this.deck = [];
    this.tappedCards = [];
    this.selectableCards = [];

    this.isFrozen = 0;

    this.initPlace();

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

    var frozen = new createjs.Graphics();
    frozen.setStrokeStyle(1, 'square');
    frozen.beginFill(createjs.Graphics.getRGB(153, 255, 255));
    frozen.drawRect(0, 0, (cardWidth + 20) * 5, cardHeight + 20);
    frozen.endFill();
    this.frozen = new createjs.Shape(frozen);
    this.frozen.x = this.baseX - 10;
    this.frozen.y = this.baseY - 10;
    this.frozen.visible = false;
    stage.addChild(this.frozen);

    stage.update();
    this.initCards();
}
;

Player.prototype.initPlace = function() {
    switch (this.seat) {
        case 0:
            this.baseX = stageWidth / 2 - 2.5 * (cardWidth + cardWidth / 4);
            this.baseY = stageHeight - cardHeight - 20;
            this.isCardFold = false;
            break;
        case 1:
            this.baseX = stageWidth / 2 - 2.5 * (cardWidth + cardWidth / 4);
            this.baseY = 10;
            this.isCardFold = true;
            break;
        default:
            break;
    }
};

Player.prototype.initCards = function() {
    for (var i = 0; i < this.max_card_count; i++) {
        this.drawCard();
    }
};


Player.prototype.chooseCard = function(card) {
    var targetX = this.baseX + this.deck.length * (cardWidth + cardWidth / 4);
    var targetY = this.baseY;
    this.deck.push(card);
    card.setPosition(targetX, targetY);
    this.initMouseInOutHandler(card);

    for (var i = 0; i < 4; i++) {
        var tmpCard = this.selectableCards[i];
        if (card !== tmpCard) {
            stage.removeChild(tmpCard.shape);
        }
    }
    stage.update();
    this.selectableCards.length = 0;
};

Player.prototype.initCardSelectionHandler = function(card) {
    card.shape.removeAllEventListeners('mouseover');
    card.shape.removeAllEventListeners('mouseout');
    card.shape.removeAllEventListeners('click');

    card.shape.addEventListener('mouseover', function(evt) {
        evt.target.shadow = new createjs.Shadow("gold", 0, 0, 20);
        stage.update();
    });
    card.shape.addEventListener('mouseout', function(evt) {
        evt.target.shadow = null;
        stage.update();
    });
    card.shape.addEventListener('click', function(evt) {
        player1.chooseCard(card);
    });
};

Player.prototype.showCardSelection = function() {
    this.selectableCards.length = 0;
    for (var i = 0; i < 4; i++) {
        var targetX = this.baseX + (i + 1) * (cardWidth + cardWidth / 4);
        var targetY = (stage.canvas.height + cardHeight) / 2;
        var card = new Card(stage, targetX, targetY, i, this.isCardFold);
        this.selectableCards.push(card);
        this.initCardSelectionHandler(card);
    }
    stage.update();
};

Player.prototype.initMouseInOutHandler = function(card) {
    card.shape.removeAllEventListeners('mouseover');
    card.shape.removeAllEventListeners('mouseout');
    card.shape.removeAllEventListeners('click');

    card.shape.addEventListener('mouseover', function(evt) {
        evt.target.shadow = new createjs.Shadow("#333333", 2, 2, 5);
        stage.update();
    });
    card.shape.addEventListener('mouseout', function(evt) {
        evt.target.shadow = null;
        stage.update();
    });
    card.shape.addEventListener('click', function() {
        player1.toggleSelected(card);
    });
};

Player.prototype.toggleSelected = function(card) {
    var obj = {shape: card.shape, factor: card.shape.regY};
    if (card.selected) {
        TweenLite.to(obj, 0.5, {factor: card.shape.regY - 10, onUpdate: function() {
                obj.shape.regY = this.target.factor;
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
        TweenLite.to(obj, 0.5, {factor: card.shape.regY + 10, onUpdate: function() {
                obj.shape.regY = this.target.factor;
                stage.update();
            }});
        card.selected = true;
        this.tappedCards.push(card);
    }
};

Player.prototype.drawCard = function() {
    if (this.deck.length >= this.max_card_count) {
        console.log("Card stack full!");
        return;
    }
    else {
        var dice = Math.floor((Math.random() * 10));
        var type = 0;
        if(dice >= 6 && dice <= 9)      // triangle card has weight of 4/10
            type = 1;        
        else if(dice >= 3 && dice <= 5) // square card has weight of 3/10
            type = 2;
        else if(dice >= 1 && dice <= 2) // circle card has weight of 2/10
            type = 0;
        else                            // rectangle card has weight of 4/10
            type = 3;
        var card = new Card(stage, this.baseX + this.deck.length * (cardWidth + cardWidth / 4), this.baseY, type, this.isCardFold);
        this.deck.push(card);
        if (this.seat === 0)
            this.initMouseInOutHandler(card);
    }
};

Player.prototype.discardCard = function() {
    var my_player = this;
    if (this.tappedCards.length === 1) {
        TweenLite.to(this.tappedCards[0].shape, 0.5, {x: -20, onUpdate: function() {
                stage.update();
            }, onComplete: function() {
                for (var i = 0; i < my_player.deck.length; i++) {
                    if (this.target === my_player.deck[i].shape) {
                        my_player.removeCard(i);
                    }
                }
                my_player.tappedCards.length = 0;
                stage.removeChild(this.target);
                stage.update();
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
        this.deck[i].shape.x -= (cardWidth + cardWidth / 4);
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
            var card = new Card(stage, this.baseX + this.deck.length * (cardWidth + cardWidth / 4), this.baseY, newType, this.isCardFold);
            if (this.seat === 0) {
                this.initMouseInOutHandler(card);
            }

            this.deck.push(card);
            this.tappedCards.length = 0;
        }
    }
    else {
        alert("Please select TWO cards");
    }
};

Player.prototype.turnOpCards = function(target_player) {
    for (var i = 0; i < target_player.deck.length; i++) {
        target_player.deck[i].turn();
    }
};

Player.prototype.playCard = function(target_player) {
    var my_player = this;
    var target_x = (stageWidth - cardWidth) / 2;
    var target_y = (stageHeight - cardHeight) / 2;
    if (this.tappedCards.length === 1) {
        if (this.seat !== 0) {
            this.tappedCards[0].shape.filters = [];
            this.tappedCards[0].shape.cache(0, 0, cardWidth, cardHeight);
        }

        TweenLite.to(this.tappedCards[0].shape, 1, {
            x: target_x,
            y: target_y,
            ease: Elastic.easeOut,
            onUpdate: function() {
                stage.update();
            }, onComplete: function() {
                for (var i = 0; i < my_player.deck.length; i++) {
                    if (this.target === my_player.deck[i].shape) {
                        stage.removeChild(this.target);
                        switch (my_player.deck[i].type) {
                            case 0:
                                my_player.health += 1;
                                if (my_player.health > my_player.max_health)
                                    my_player.health = my_player.max_health;
                                break;
                            case 1:
                                if (target_player.shield.isVisible()) {
                                    target_player.shieldDown();
                                }
                                else {
                                    target_player.health -= 1;
                                }
                                break;
                            case 2:
                                my_player.shieldUp();
                                break;
                            case 3:
                                target_player.isFrozen = 2;
                                target_player.frozen.visible = true;
                                stage.update();
                                break;
                            case 4:
                                if (target_player.shield.isVisible()) {
                                    target_player.shieldDown();
                                }
                                else {
                                    target_player.health -= 4;
                                }
                                break;
                            case 5:
                                my_player.health += 4;
                                if (my_player.health > my_player.max_health)
                                    my_player.health = my_player.max_health;
                                break;
                            case 7:
                                my_player.turnOpCards(target_player);
                                break;
                            case 8:
                                my_player.showCardSelection();
                            default:
                                break;
                        }
                        my_player.removeCard(i);
                        initStats();
                        break;
                    }
                }
                my_player.tappedCards.length = 0;
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


