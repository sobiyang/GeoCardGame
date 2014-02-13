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
    this.health = health;
    this.max_card_count = max_card_count;
    this.deck = [];
    this.tappedCards = [];
    this.selectableCards = [];
    
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
    stage.update();

    this.initCards();
}

Player.prototype.initPlace = function() {    
    switch (this.seat) {
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


Player.prototype.chooseCard = function(card) {
    var targetX = this.baseX + this.deck.length * (cardWidth + 20);
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
    moveAI();
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
        var targetX = this.baseX + i * (cardWidth + 20);
        var targetY = (stage.canvas.height - cardHeight) / 2;
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
                stage.removeChild(this.target);
                toggleControls();
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
            toggleControls();
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
    var target_y = (stageHeight - cardHeight) / 2;
    if (this.tappedCards.length === 1) {        
        if (this.seat !== 0) {
            this.tappedCards[0].shape.filters = [];
            this.tappedCards[0].shape.cache(0, 0, cardWidth, cardHeight);
        }
        
        TweenLite.to(this.tappedCards[0].shape, 1, {
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
                                if (target_player.shield.isVisible()) {
                                    target_player.shieldDown();
                                }
                                else {
                                    target_player.health -= 1;
                                }
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
                                my_player.health += 2;
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


