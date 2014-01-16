var stage;
var stageWidth, stageHeight;
var cardLayer;
var cardWidth, cardHeight;
var squareLength;
var circleRadius;
var triangleLength;
var rectangleHeight;
var rectangleWidth;
var myCards = [];
var opCards = [];
var tappedCards = [];
var maxCardCount = 5;
var myHealth = 7;
var opHealth = 7;
var shield;
var isControlHidden = false;
var animationCounter = 0;
var animationPeriod = 1000;

var player1, player2;

function initGame() {
    stageWidth = $(document).width();
    stageHeight = $(document).height() - 140;
    
    $('#gameContainer').width(stageWidth);
    $('#gameContainer').height(stageHeight);
    cardWidth = stageWidth / 10;
    if (cardWidth > 80)
        cardWidth = 80;
    cardHeight = stageHeight / 6;
    if (cardHeight > 150)
        cardHeight = 150;
    squareLength = cardWidth - 20;
    circleRadius = squareLength / 2;
    triangleLength = squareLength;
    rectangleWidth = cardWidth / 2;
    rectangleHeight = cardHeight / 3 * 2;
    //Create a stage by getting a reference to the canvas
    stage = new createjs.Stage("gameContainer");
    stage.canvas.width = stageWidth;
    stage.canvas.height = stageHeight;
    stage.enableMouseOver(10);

    player1 = new Player(0, 5, 7);
    player2 = new Player(1, 5, 7);
    
    initConsole();
    initUI();
    initStats();
}

function initUI() {
    
}

function initConsole() {
    if (typeof console === "undefined") {
        this.console = {
            log: function() {
            }
        };
    }
}

function initCards() {
    var i = 0;
    var type = 0;
    for (i; i < maxCardCount; i++) {
        var baseX = stageWidth / 2 + (i - 2.5) * (cardWidth + 20);
        var baseY = stageHeight - cardHeight - 20;
        type = Math.floor((Math.random() * 4));
        var card = new Card(stage, baseX, baseY, type, false);
        myCards.push(card);
        intMouseInOutHandler(card);
    }

    for (i = 0; i < maxCardCount; i++) {
        baseX = stageWidth / 2 + (i - 2.5) * (cardWidth + 20);
        baseY = 10;
        type = Math.floor((Math.random() * 4));
        var card = new Card(stage, baseX, baseY, 0, true);
        opCards.push(card);
    }
}


function drawCard() {
    if (myCards.length >= maxCardCount) {
        alert("Card stack full!");
    }
    else {
        var baseX = 10 + myCards.length * (cardWidth + 20);
        var baseY = 200;
        type = Math.floor((Math.random() * 4));
        var card = new Card(stage, baseX, baseY, type, false);
        myCards.push(card);
        intMouseInOutHandler(card);
        initStats();
        cardLayer.draw();
        toggleControls();
        moveAI();
    }
}

function drawOpCard() {
    var baseX = 10 + opCards.length * (cardWidth + 20);
    var baseY = 10;
    type = Math.floor((Math.random() * 4));
    var card = new Card(type, cardLayer, 1, baseX, baseY);
    opCards.push(card);
    cardLayer.draw();
    toggleControls();
}

function intMouseInOutHandler(card) {
    // Remove all event listeners

    card.shape.addEventListener('mouseover', function(evt) {
        evt.target.shadow = new createjs.Shadow("#CCCCCC", 2, 2, 5);
        stage.update();
    });
    card.shape.addEventListener('mouseout', function(evt) {
        evt.target.shadow = null;
        stage.update();
    });
    card.shape.addEventListener('click', function(evt) {
        toggleSelected(card);
    });
}


function toggleSelected(card) {
    var obj = {shape: card.shape, factor: 0};
    if (card.selected) {
        TweenLite.to(obj, 0.5, {factor: 1, onUpdate: function() {
                obj.shape.regY -= this.target.factor;
                stage.update();
            }});
        card.selected = false;
    }
    else {
        TweenLite.to(obj, 0.5, {factor: 1, onUpdate: function() {
                obj.shape.regY += this.target.factor;
                stage.update();
            }});
        card.selected = true;
    }
    tappedCards.length = 0;
    tappedCards.push(card);
}

function playCard() {
    if (tappedCards.length === 1) {
        var obj = {bg: tappedCards[0].bg, pattern: tappedCards[0].pattern, factor: 1};
        TweenLite.to(obj, 0.5, {factor: 0, onUpdate: function() {
                this.target.bg.setY(this.target.bg.getY() - 10);
                this.target.bg.setOpacity(this.target.factor);
                this.target.pattern.setY(this.target.pattern.getY() - 10);
                this.target.pattern.setOpacity(this.target.factor);
                cardLayer.draw();
            }, onComplete: function() {
                this.target.bg.remove();
                this.target.pattern.remove();
                cardLayer.draw();
                initStats();

                for (var i = 0; i < myCards.length; i++) {
                    if (this.target.pattern === myCards[i].pattern) {
                        switch (myCards[i].type) {
                            case 0:
                                myHealth += 1;
                                moveAI();
                                break;
                            case 1:
                                opHealth -= 2;
                                moveAI();
                                break;
                            case 2:
                                shield.show();
                                moveAI();
                                break;
                            case 3:
                                opHealth -= 1;
                                moveAI();
                                break;
                            case 4:
                                opHealth -= 6;
                                moveAI();
                                break;
                            case 5:
                                myHealth += 2;
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
                        removeCard(i);
                        break;
                    }
                }
            }});

        tappedCards.length = 0;
        toggleControls();
        initStats();
    }
    else {
        alert("Please select ONE card");
    }
}

function discardCard() {
    if (tappedCards.length === 1) {
        var obj = {card: tappedCards[0].card, factor: 1};
        TweenLite.to(obj, 0.5, {factor: 0, onUpdate: function() {
                this.target.x -= 20;
                this.target.alpha = this.target.factor;
            }, onComplete: function() {
                stage.removeChild(card);
                //initStats();

                for (var i = 0; i < myCards.length; i++) {
                    if (this.target.pattern === myCards[i].pattern) {
                        removeCard(i);
                    }
                }
            }
        });
        tappedCards.length = 0;
        toggleControls();
        moveAI();
    }
    else {
        alert("Please select ONE card");
    }
}

function discardOpCard() {
    var obj = {bg: opCards[0].bg, pattern: opCards[0].pattern, factor: 1};
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
        }
    });
    removeOpCard(0);
    toggleControls();
}

function mergeCards() {
    if (tappedCards.length === 2) {
        var newType = canMerge(tappedCards[0].type, tappedCards[1].type);
        if (newType < 4) {
            alert("These two cards can't merge");
            tappedCards[0].bg.tween.reverse();
            tappedCards[0].pattern.tween.reverse();
            tappedCards[0].tapped = false;
            tappedCards[1].bg.tween.reverse();
            tappedCards[1].pattern.tween.reverse();
            tappedCards[1].tapped = false;
        }
        else {
            var i = myCards.indexOf(tappedCards[0]);

            removeCard(i);

            i = myCards.indexOf(tappedCards[1]);
            removeCard(i);

            tappedCards[0].bg.remove();
            tappedCards[0].pattern.remove();
            tappedCards[1].bg.remove();
            tappedCards[1].pattern.remove();
            var mergedX = 10 + myCards.length * (cardWidth + 20);
            var mergedY = 200;
            var card = new Card(newType, cardLayer, 0, mergedX, mergedY);
            myCards.push(card);
            intMouseInOutHandler(card);
            initStats();
            cardLayer.draw();
            toggleControls();
            moveAI();
        }
    }
    else {
        alert("Please select TWO cards");
    }
}

function playOpCard(i) {
    var obj = {bg: opCards[i].bg, pattern: opCards[i].pattern, factor: 1};
    var timeline = new TimelineLite();
    var t1 = new TweenLite(obj, 0.5, {factor: 0, onUpdate: function() {
            this.target.bg.setScaleX(this.target.factor);
            cardLayer.draw();
        }, onComplete: function() {
            this.target.bg.setFill('white');
            this.target.bg.setShadowColor('white');
            cardLayer.draw();
        }});
    var t2 = new TweenLite(obj, 0.5, {factor: 1, onUpdate: function() {
            this.target.bg.setScaleX(this.target.factor);
            cardLayer.draw();
        }, onComplete: function() {
            this.target.pattern.setVisible(true);
            cardLayer.draw();
        }});

    var t3 = new TweenLite(obj, 1, {factor: 1000, onUpdate: function() {
            this.target.bg.setY(this.target.factor);
            this.target.pattern.setY(this.target.factor);
            cardLayer.draw();
        }, onComplete: function() {
            switch (opCards[i].type) {
                case 1:
                    if (shield.isVisible())
                        shield.hide();
                    else
                        myHealth -= 2;
                    break;
                case 3:
                    if (shield.isVisible())
                        shield.hide();
                    else
                        myHealth -= 1;
                    break;
                case 4:
                    if (shield.isVisible())
                        shield.hide();
                    else
                        myHealth -= 6;
                    break;
                case 5:
                    opHealth += 2;
                    break;
                default:
                    break;
            }

            opCards[i].remove();
            removeOpCard(i);
            initStats();
            toggleControls();
        }, delay: 0.5});

    timeline.add(t1);
    timeline.add(t2);
    timeline.add(t3);
}

function mergeOpCards() {
    var i = opCards.indexOf(tappedCards[0]);
    removeOpCard(i);
    i = opCards.indexOf(tappedCards[1]);
    removeOpCard(i);

    var mergedX = 10 + (opCards.length + 1) * (cardWidth + 20);
    var mergedY = 10;

    if (tappedCards[0].type === 1 && tappedCards[1].type === 1) {
        tappedCards[0].bg.remove();
        tappedCards[0].pattern.remove();
        tappedCards[1].bg.remove();
        tappedCards[1].pattern.remove();
        var card = new Card(4, cardLayer, 1, mergedX, mergedY);
        opCards.push(card);
    }
    else if (tappedCards[0].type === 3 && tappedCards[1].type === 3) {
        tappedCards[0].bg.remove();
        tappedCards[0].pattern.remove();
        tappedCards[1].bg.remove();
        tappedCards[1].pattern.remove();
        var card = new Card(5, cardLayer, 1, mergedX, mergedY);
        opCards.push(card);
    }
    initStats();
    cardLayer.draw();
    toggleControls();
}

function move(order) {

    switch (order) {
        case 0:
            player1.drawCard();
            break;
        case 1:
            player1.mergeCards();
            break;
        case 2:
            player1.playCard(player2);
            break;
        case 3:
            player1.discardCard();
            break;
        default:
            console.log("Invalid order: " + order);
            break;
    }
}

/* Enumerate all combinations
 * And assign priority value (low to high)
 * 1. One Circle
 * 2. One Square
 * 3. One Rectangle
 * 4. One Triangle
 * 5. One Circle and One Square
 * 6. One Circle and One Rectangle
 * 6. Two Rectangles
 * 7. Two Triangles
 * */
function moveAI() {
    player1.tappedCards.length = 0;
    player2.tappedCards.length = 0;
    var merge = false;
    var heal = false;
    var attack = false;
    for (var m = 0; m < player2.deck.length; m++) {
        for (var n = m + 1; n < player2.deck.length; n++) {
            if (player2.deck[m].type === 1 && player2.deck[n].type === 1) {
                merge = true;
                player2.tappedCards.push(player2.deck[m]);
                player2.tappedCards.push(player2.deck[n]);
                break;
            }
            if (player2.deck[m].type === 3 && player2.deck[n].type === 3) {
                merge = true;
                player2.tappedCards.push(player2.deck[m]);
                player2.tappedCards.push(player2.deck[n]);
                break;
            }
        }

        if (merge)
            break;

        if (player2.deck[m].type >= 1 && player2.deck[m].type <= 4)
        {
            player2.tappedCards[0] = player2.deck[m];
            attack = true;
            break;
        }

        if (player2.deck[m].type === 5) {
            player2.tappedCards[0] = player2.deck[m];
            heal = true;
            break;
        }

    }

    if (merge) {
        player2.mergeCards();
    }
    else if (attack || heal) {
        player2.playCard(player1);
    }
    else if (player2.deck.length < player2.max_card_count) {
        player2.drawCard();
    }
    else {
        player2.tappedCards[0] = player2.deck[0];
        player2.discardCard();
    }
}

function removeCard(i) {
    myCards.splice(i, 1);
    for (i; i < myCards.length; i++) {
        myCards[i].x -= (cardWidth + 20);
    }
}

function removeOpCard(i) {
    opCards.splice(i, 1);
    for (i; i < opCards.length; i++) {
        opCards[i].bg.setX(opCards[i].bg.getX() - cardWidth - 20);
        opCards[i].pattern.setX(opCards[i].pattern.getX() - cardWidth - 20);
    }
}

function initStats() {
    if (player1.health <= 0) {
        alert("You lost!");
        location.reload(true);
    }
    else if (player2.health <= 0) {
        alert("You win!");
        location.reload(true);
    }
    else {
        var tempHtml = "<p>Your HP: " + player1.health.toString() + "</p>"
        $('#myStats').html(tempHtml);
        tempHtml = "Player2's HP:" + player2.health.toString() + "</p>";
        $('#opStats').html(tempHtml);
    }
}

function toggleControls() {
    $("button").each(function(index) {
        if (isControlHidden)
            $(this).fadeIn();
        else
            $(this).fadeOut();
    });
    isControlHidden = !isControlHidden;
}

function turnOpCards() {
    var obj = {cards: player2.deck, factor: 1};
    var i = 0;
    var timeline = new TimelineLite();
    var t1 = new TweenLite(obj, 0.5, {factor: 0, onUpdate: function() {
            for (i = 0; i < this.target.cards.length; i++) {
                this.target.cards[i].bg.setScaleX(this.target.factor);
            }
            cardLayer.draw();
        }, onComplete: function() {
            for (i = 0; i < this.target.cards.length; i++) {
                this.target.cards[i].bg.setFill('white');
                this.target.cards[i].bg.setShadowColor('white');
            }
            cardLayer.draw();
        }});
    var t2 = new TweenLite(obj, 0.5, {factor: 1, onUpdate: function() {
            for (i = 0; i < this.target.cards.length; i++) {
                this.target.cards[i].bg.setScaleX(this.target.factor);
            }
            cardLayer.draw();
        }, onComplete: function() {
            for (i = 0; i < this.target.cards.length; i++) {
                this.target.cards[i].pattern.setVisible(true);
            }
            cardLayer.draw();
        }});

    var t3 = new TweenLite(obj, 0.5, {factor: 0, onUpdate: function() {
            for (i = 0; i < this.target.cards.length; i++) {
                this.target.cards[i].bg.setScaleX(this.target.factor);
            }
            cardLayer.draw();
        }, onStart: function() {
            for (i = 0; i < this.target.cards.length; i++) {
                this.target.cards[i].pattern.setVisible(false);
            }
            cardLayer.draw();
        }, delay: 1});

    var t4 = new TweenLite(obj, 0.5, {factor: 1, onUpdate: function() {
            for (i = 0; i < this.target.cards.length; i++) {
                this.target.cards[i].bg.setScaleX(this.target.factor);
            }
            cardLayer.draw();
        }, onStart: function() {
            for (i = 0; i < this.target.cards.length; i++) {
                this.target.cards[i].bg.setFill('grey');
                this.target.cards[i].bg.setShadowColor('grey');
            }
            cardLayer.draw();
        }, onComplete: function() {
            moveAI();
        }});
    timeline.add(t1);
    timeline.add(t2);
    timeline.add(t3);
    timeline.add(t4);
}

function selectCardHandler(evt) {
    var targetX = 10 + player1.deck.length * (cardWidth + 20);
    var targetY = 410;
    for (var i = 0; i < 4; i++) {
        var card = player1.tappedCards[i];
        if (card.pattern === evt.targetNode ||
                card.bg === evt.targetNode) {
            player1.deck.push(card);
            card.setPosition(targetX, targetY);
            intMouseInOutHandler(card);
        }
        else {
            card.remove();
        }
    }
    moveAI();
}

function intMouseSelectHandler(card) {

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
    card.pattern.on('mouseout', function() {
        card.bg.disableStroke();
        cardLayer.draw();
    });
    card.bg.on('click', selectCardHandler);
    card.pattern.on('click', selectCardHandler);
}

function showCardSelection() {
    player1.tappedCards.length = 0;
    var baseX, baseY;
    for (var i = 0; i < 4; i++) {
        baseX = 110 + i * (cardWidth + 20);
        baseY = 210;
        var card = new Card(i, cardLayer, 0, baseX, baseY);
        player1.tappedCards.push(card);
        intMouseSelectHandler(card);
    }
    cardLayer.draw();
}