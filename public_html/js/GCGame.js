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
    stageWidth = $(window).width();
    stageHeight = $(window).height() - 140;

    $('#gameContainer').width(stageWidth);
    $('#gameContainer').height(stageHeight);
    cardWidth = stageWidth / 8;
    if (cardWidth > 80)
        cardWidth = 80;
    cardHeight = stageHeight / 6;
    if (cardHeight > 150)
        cardHeight = 150;
    squareLength = cardWidth * 3 / 4;
    circleRadius = squareLength / 2;
    triangleLength = squareLength;
    rectangleWidth = cardWidth / 2;
    rectangleHeight = cardHeight / 3 * 2;
    //Create a stage by getting a reference to the canvas
    stage = new createjs.Stage("gameContainer");
    stage.canvas.width = stageWidth;
    stage.canvas.height = stageHeight;
    stage.enableMouseOver(20);
    createjs.Touch.enable(stage, true, false);

    player1 = new Player(0, 5, 7);
    player2 = new Player(1, 5, 7);

    $(window).resize(onWindowResize);

    initConsole();
    initUI();
    initStats();
}

function onWindowResize() {
    stageWidth = $(window).width();
    stageHeight = $(window).height() - 140;

    $('#gameContainer').width(stageWidth);
    $('#gameContainer').height(stageHeight);

    console.log(stageWidth, stageHeight);

    stage.setBounds(0, 0, stageWidth, stageHeight);

    $("#btnEndTurn").css({top: $(window).height() / 2 - 20, left: $(window).width() / 2 - cardWidth * 2.5 - cardWidth / 2, position: 'absolute'});

    stage.update();
}

function initUI() {
    $('#popupEndGame').popup();
    $("#btnEndTurn").css({height: cardHeight / 2, top: $(window).height() / 2 - 20, left: $(window).width() / 2 - cardWidth * 2.5 - cardWidth / 2, position: 'absolute'});

}

function initConsole() {
    if (typeof console === "undefined") {
        this.console = {
            log: function() {
            }
        };
    }
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
    toggleControls();

    player1.tappedCards.length = 0;
    player2.tappedCards.length = 0;

    if (player2.isFrozen > 0) {
        player2.isFrozen -= 1;
        toggleControls();
        return;
    }
    else {
        player2.frozen.visible = false;
        stage.update();
    }

    player2.drawCard();
    setTimeout(thinkAI, 2000);
}

function thinkAI() {
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

        if (player2.deck[m].type === 4 || player2.deck[m].type === 1) {
            player2.tappedCards[0] = player2.deck[m];
            attack = true;
            break;
        }

        // If computer player's HP is 3 points lower than max, use big heal
        if (player2.deck[m].type === 5 && player2.health <= player2.max_health - 3) {
            player2.tappedCards[0] = player2.deck[m];
            heal = true;
            break;
        }

        // If computer player's HP is 1 point lower than max, use small heal
        if (player2.deck[m].type === 0 && player2.health <= player2.max_health - 1) {
            player2.tappedCards[0] = player2.deck[m];
            heal = true;
            break;
        }

        // If human player is not frozen, freeze him/her
        if (player2.deck[m].type === 3 && player1.isFrozen === 0) {
            player2.tappedCards[0] = player2.deck[m];
            attack = true;
            break;
        }

        // If computer player's shield is down, shield up
        if (player2.deck[m].type === 2 && !player2.shield.isVisible())
        {
            player2.tappedCards[0] = player2.deck[m];
            heal = true;
            break;
        }
    }

    if (merge) {
        player2.mergeCards();
        player1.tappedCards.length = 0;
        setTimeout(thinkAI, 2000);
    }
    else if (attack || heal) {
        player2.playCard(player1);
        player1.tappedCards.length = 0;
        setTimeout(thinkAI, 2000);
    }
    else {
        if (player2.deck.length === player2.max_card_count) {
            player2.tappedCards[0] = player2.deck[0];
            player2.discardCard();
        }
        if (player1.isFrozen === 0)
            toggleControls();
        else
            setTimeout(moveAI, 2000);
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
    var tempHtml = "<p>Your HP: " + player1.health.toString() + "</p>";
    $('#myStats').html(tempHtml);
    tempHtml = "Player2's HP:" + player2.health.toString() + "</p>";
    $('#opStats').html(tempHtml);
    if (player1.health <= 0) {
        createjs.Touch.disable(stage);
        $('#mainContent').empty();
        $('#controlBottom').empty();
    }
    else if (player2.health <= 0) {
        //      createjs.Touch.disable(stage);
        $('#mainContent').empty();
        $('#controlBottom').empty();
        $('#endGameMsg').text('You win!');
        setTimeout(function() {
            $('#popupEndGame').popup('open', {
                transition: 'pop',
                positionTo: 'window'
            });
        }, 100);
    }
}

function toggleControls() {
    if (player1.isFrozen > 0) {
        player1.isFrozen -= 1;
        return;
    }
    else {
        player1.frozen.visible = false;
        stage.update();
    }

    $("button").each(function(index) {
        if (isControlHidden) {
            stage.enableDOMEvents(true);
            $(this).fadeIn();
        }
        else {
            stage.enableDOMEvents(false);
            $(this).fadeOut();
        }
    });
    if(isControlHidden)        
        player1.drawCard();
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
