// Define the Card class
function Card(stageIn, cardX, cardY, typeIn, flippedIn) {
    if (stageIn === null) {
        console.log("The render stage is not ready.");
        return;
    }
    if (typeIn === null) {
        console.log("The type of the card is not provided.");
        return;
    }
    // Add object properties
    this.type = typeIn;
    this.stage = stageIn;
    this.selected = false;
    this.flipped = flippedIn;
    this.graphics = new createjs.Graphics();
    var shadowColor, fillColor, patternColor;

    shadowColor = createjs.Graphics.getRGB(127, 127, 127);
    fillColor = 'white';
    patternColor = 'blue';

    this.graphics.setStrokeStyle(2, 'square');
    this.graphics.beginStroke(shadowColor);
    this.graphics.beginFill(fillColor);
    this.graphics.drawRect(0, 0, cardWidth, cardHeight);
    this.graphics.setStrokeStyle(1);
    this.graphics.beginStroke(patternColor);

    switch (this.type) {
        case 0:
            this.graphics.drawCircle(cardWidth / 2, cardHeight / 2, circleRadius);
            break;
        case 1:
            vertices = [(cardWidth - triangleLength) / 2, cardHeight / 2 + triangleLength / 4 * Math.sqrt(3),
                (cardWidth + triangleLength) / 2, cardHeight / 2 + triangleLength / 4 * Math.sqrt(3),
                cardWidth / 2, cardHeight / 2 - triangleLength / 4 * Math.sqrt(3)];
            this.graphics.moveTo(vertices[0], vertices[1]);
            this.graphics.lineTo(vertices[2], vertices[3]);
            this.graphics.lineTo(vertices[4], vertices[5]);
            this.graphics.lineTo(vertices[0], vertices[1]);
            break;
        case 2:
            this.graphics.drawRect(
                    (cardWidth - squareLength) / 2,
                    (cardHeight - squareLength) / 2,
                    squareLength,
                    squareLength);
            break;
        case 3:
            this.graphics.drawRect((cardWidth - rectangleWidth) / 2,
                    (cardHeight - rectangleHeight) / 2,
                    rectangleWidth,
                    rectangleHeight);

            break;
        case 4:
            this.graphics.beginStroke('red');
            vertices = [(cardWidth - triangleLength) / 2, cardHeight / 2 + triangleLength / 6 * Math.sqrt(3),
                (cardWidth + triangleLength) / 2, cardHeight / 2 + triangleLength / 6 * Math.sqrt(3),
                cardWidth / 2, cardHeight / 2 - triangleLength / 3 * Math.sqrt(3)];
            this.graphics.moveTo(vertices[0], vertices[1]);
            this.graphics.lineTo(vertices[2], vertices[3]);
            this.graphics.lineTo(vertices[4], vertices[5]);
            this.graphics.lineTo(vertices[0], vertices[1]);

            vertices = [(cardWidth - triangleLength) / 2, cardHeight / 2 - triangleLength / 6 * Math.sqrt(3),
                (cardWidth + triangleLength) / 2, cardHeight / 2 - triangleLength / 6 * Math.sqrt(3),
                cardWidth / 2, cardHeight / 2 + triangleLength / 3 * Math.sqrt(3)];
            this.graphics.moveTo(vertices[0], vertices[1]);
            this.graphics.lineTo(vertices[2], vertices[3]);
            this.graphics.lineTo(vertices[4], vertices[5]);
            this.graphics.lineTo(vertices[0], vertices[1]);

            break;
        case 5:
            this.graphics.beginStroke('green');
            this.graphics.drawRect((cardWidth - rectangleWidth / 2) / 2, (cardHeight - rectangleWidth) / 2,
                    rectangleWidth / 2, rectangleWidth);
            this.graphics.drawRect((cardWidth - rectangleWidth) / 2, (cardHeight - rectangleWidth / 2) / 2,
                    rectangleWidth, rectangleWidth / 2);
            break;
        case 6:
            this.graphics.drawCircle(cardWidth / 2, cardHeight / 2, circleRadius / 2);
            this.graphics.moveTo(cardWidth / 2 + circleRadius, cardHeight / 2);
            this.graphics.drawCircle(cardWidth / 2, cardHeight / 2, circleRadius);
            break;
        case 7:
            this.graphics.beginStroke('#B8860B');
            this.graphics.drawRect((cardWidth - rectangleWidth / 2) / 2, cardHeight / 4  + cardHeight / 8,
                    rectangleWidth / 2, rectangleHeight / 2 + cardHeight / 8);
            this.graphics.moveTo(cardWidth / 2 + circleRadius / 3, cardHeight / 4);
            this.graphics.drawCircle(cardWidth / 2, cardHeight / 4, circleRadius / 3);
            break;
        case 8:
            this.graphics.beginStroke('#B8860B');
            this.graphics.drawRect((cardWidth - squareLength / 2) / 2, (cardHeight - squareLength / 2) / 2,
                    squareLength / 2, squareLength / 2);
            this.graphics.moveTo(cardWidth / 2 + circleRadius, cardHeight / 2);
            this.graphics.drawCircle(cardWidth / 2, cardHeight / 2, circleRadius);
            break;
        default:
            console.log("Invalid card type.");
            return;
    }

    this.shape = new createjs.Shape(this.graphics);
    this.shape.x = cardX;
    this.shape.y = cardY;

    this.hideFilter = new createjs.ColorFilter(0, 0, 0, 1, -255, -255, -255, 0);
    this.shape.filters = [this.hideFilter];
    if (this.flipped)
        this.shape.cache(0, 0, cardWidth, cardHeight);
    this.stage.addChild(this.shape);
    this.stage.update();
}

Card.prototype.turn = function() {    
    var timeline = new TimelineLite();
    var t1 = new TweenLite(this.shape, 0.5, {scaleX: 0, ease: Linear.easeOut,
        onUpdate: function() {
            stage.update();
        }, onComplete: function() {
            this.target.filters = [];
            this.target.cache(0, 0, cardWidth, cardHeight);
            stage.update();
        }});
    var t2 = new TweenLite(this.shape, 0.5, {scaleX: 1, ease: Linear.easeIn,delay: 0.2, 
        onUpdate: function() {
            stage.update();
        }});    
    timeline.add(t1);
    timeline.add(t2);
};


Card.prototype.remove = function() {
    this.bg.remove();
    this.pattern.remove();
    this.layer.draw();
};

// tap/untap the card
Card.prototype.toggleTap = function() {
    if (this.tapped) {
        this.bg.tween = new Kinetic.Tween({
            node: this.bg,
            duration: 0.5,
            y: this.bg.getY() + 20,
            easing: Kinetic.Easings.EaseOut
        });
        this.pattern.tween = new Kinetic.Tween({
            node: this.pattern,
            duration: 0.5,
            y: this.pattern.getY() + 20,
            easing: Kinetic.Easings.EaseOut
        });
        this.bg.tween.play();
        this.pattern.tween.play();
        this.tapped = false;
    }
    else {
        this.bg.tween = new Kinetic.Tween({
            node: this.bg,
            duration: 0.5,
            y: this.bg.getY() - 20,
            easing: Kinetic.Easings.EaseOut
        });

        this.pattern.tween = new Kinetic.Tween({
            node: this.pattern,
            duration: 0.5,
            y: this.pattern.getY() - 20,
            easing: Kinetic.Easings.EaseOut
        });

        this.bg.tween.play();
        this.pattern.tween.play();
        this.tapped = true;
    }
};

Card.prototype.play = function() {
    this.bg.tween = new Kinetic.Tween({
        node: this.bg,
        duration: 0.5,
        y: 0,
        opacity: 0,
        easing: Kinetic.Easings.EaseOut,
        onFinish: function() {
            this.bg.remove();
        }
    });
    this.pattern.tween = new Kinetic.Tween({
        node: this.pattern,
        duration: 0.5,
        y: this.pattern.getY() - 1000,
        opacity: 0,
        easing: Kinetic.Easings.EaseOut,
        onFinish: function() {
            for (var i = 0; i < myCards.length; i++) {
                if (this.pattern === myCards[i].pattern) {
                    switch (myCards[i].type) {
                        case 1:
                            opHealth -= 2;
                            console.log(opHealth);
                            break;
                        case 3:
                            opHealth -= 1;
                            break;
                        case 4:
                            opHealth -= 6;
                            break;
                        case 5:
                            myHealth += 2;
                            break;
                        default:
                            break;
                    }
                    myCards.splice(i, 1);
                }
            }
            this.pattern.remove();
            initStats();
        }
    });
    this.bg.tween.play();
    this.pattern.tween.play();
};

Card.prototype.getX = function() {
    return this.bg.getX();
};

Card.prototype.setX = function(newX) {
    this.bg.setX(newX);
    this.pattern.setX(newX);
    this.layer.draw();
};

Card.prototype.getY = function() {
    return this.bg.getY();
};

Card.prototype.setY = function(newY) {
    this.bg.setY(newY);
    this.pattern.setY(newY);
    this.layer.draw();
};


Card.prototype.setPosition = function(newX, newY) {
    this.shape.setTransform(newX, newY);
    this.stage.update();
};