// Define the card class
function Card(type, layer, owner, cardX, cardY) {
    if (type === null) {
        console.log("Please provide a type.");
        return;
    }
    if (layer === null) {
        console.log("Please provide a layer.");
        return;
    }
    if (owner === null) {
        console.log("Please provide an owner.");
        return;
    }
    // Add object properties
    this.type = type;
    this.layer = layer;
    this.owner = owner;
    this.tapped = false;
    
    switch (type) {
        case 0:
            this.pattern = new Kinetic.Circle({
                x: cardX + cardWidth / 2,
                y: cardY + cardHeight / 2,
                radius: circleRadius,
                stroke: 'blue',
                strokeWidth: 2
            });
            break;
        case 1:
            vertices = [cardX + (cardWidth - triangleLength) / 2, cardY + cardHeight / 2 + triangleLength / 4 * Math.sqrt(3),
                cardX + (cardWidth + triangleLength) / 2, cardY + cardHeight / 2 + triangleLength / 4 * Math.sqrt(3),
                cardX + cardWidth / 2, cardY + cardHeight / 2 - triangleLength / 4 * Math.sqrt(3)];
            this.pattern = new Kinetic.Polygon({
                points: vertices,
                stroke: 'blue',
                strokeWidth: 2
            });
            break;
        case 2:
            this.pattern = new Kinetic.Rect({
                x: cardX + (cardWidth - squareLength) / 2,
                y: cardY + (cardHeight - squareLength) / 2,
                width: squareLength,
                height: squareLength,
                stroke: 'blue',
                strokeWidth: 2
            });
            break;
        case 3:
            this.pattern = new Kinetic.Rect({
                x: cardX + (cardWidth - rectangleWidth) / 2,
                y: cardY + (cardHeight - rectangleHeight) / 2,
                width: rectangleWidth,
                height: rectangleHeight,
                stroke: 'blue',
                strokeWidth: 2
            });
            break;
        case 4:
            vertices = [cardX + (cardWidth - triangleLength) / 2, cardY + cardHeight / 2 + triangleLength / 6 * Math.sqrt(3),
                cardX + (cardWidth + triangleLength) / 2, cardY + cardHeight / 2 + triangleLength / 6 * Math.sqrt(3),
                cardX + cardWidth / 2, cardY + cardHeight / 2 - triangleLength / 3 * Math.sqrt(3)];
            pattern1 = new Kinetic.Polygon({
                points: vertices,
                stroke: 'red',
                strokeWidth: 2
            });

            vertices = [cardX + (cardWidth - triangleLength) / 2, cardY + cardHeight / 2 - triangleLength / 6 * Math.sqrt(3),
                cardX + (cardWidth + triangleLength) / 2, cardY + cardHeight / 2 - triangleLength / 6 * Math.sqrt(3),
                cardX + cardWidth / 2, cardY + cardHeight / 2 + triangleLength / 3 * Math.sqrt(3)];
            pattern2 = new Kinetic.Polygon({
                points: vertices,
                stroke: 'red',
                strokeWidth: 2
            });
            group = new Kinetic.Group({
            });
            group.add(pattern1);
            group.add(pattern2);
            this.pattern = group;
            break;
        case 5:
            pattern1 = new Kinetic.Rect({
                x: cardX + (cardWidth - rectangleWidth / 2) / 2,
                y: cardY + (cardHeight - rectangleWidth) / 2,
                width: rectangleWidth / 2,
                height: rectangleWidth,
                stroke: 'green',
                strokeWidth: 2
            });
            pattern2 = new Kinetic.Rect({
                x: cardX + (cardWidth - rectangleWidth) / 2,
                y: cardY + (cardHeight - rectangleWidth / 2) / 2,
                width: rectangleWidth,
                height: rectangleWidth / 2,
                stroke: 'green',
                strokeWidth: 2
            });
            group = new Kinetic.Group({
            });
            group.add(pattern1);
            group.add(pattern2);
            this.pattern = group;
            break;
        case 6:
            pattern1 = new Kinetic.Circle({
                x: cardX + cardWidth / 2,
                y: cardY + cardHeight / 2,
                radius: circleRadius / 2,
                stroke: 'blue',
                strokeWidth: 2
            });
            pattern2 = new Kinetic.Circle({
                x: cardX + cardWidth / 2,
                y: cardY + cardHeight / 2,
                radius: circleRadius,
                stroke: 'blue',
                strokeWidth: 2
            });
            group = new Kinetic.Group({
            });
            group.add(pattern1);
            group.add(pattern2);
            this.pattern = group;
            break;
        case 7:
            pattern1 = new Kinetic.Circle({
                x: cardX + cardWidth / 2,
                y: cardY + cardHeight / 4,
                radius: circleRadius / 3,
                stroke: 'blue',
                strokeWidth: 2
            });
            pattern2 = new Kinetic.Rect({
                x: cardX + (cardWidth - rectangleWidth / 2) / 2,
                y: cardY + (cardHeight - rectangleHeight / 2) / 2 + 10,
                width: rectangleWidth / 2,
                height: rectangleHeight / 2,
                stroke: 'blue',
                strokeWidth: 2
            });
            group = new Kinetic.Group({
            });
            group.add(pattern1);
            group.add(pattern2);
            this.pattern = group;
            break;
        case 8:
            pattern1 = new Kinetic.Circle({
                x: cardX + cardWidth / 2,
                y: cardY + cardHeight / 2,
                radius: circleRadius,
                stroke: 'blue',
                strokeWidth: 2
            });
            pattern2 = new Kinetic.Rect({
                x: cardX + (cardWidth - squareLength / 2) / 2,
                y: cardY + (cardHeight - squareLength / 2) / 2,
                width: squareLength / 2,
                height: squareLength / 2,
                stroke: 'blue',
                strokeWidth: 2
            });
            group = new Kinetic.Group({
            });
            group.add(pattern1);
            group.add(pattern2);
            this.pattern = group;
            break;
        default:
            console.log("Invalid card type.");
            return;
    }

    this.bg = new Kinetic.Rect({
        x: cardX,
        y: cardY,
        width: cardWidth,
        height: cardHeight,
        fill: 'white',
        stroke: '00FFFF',
        strokeWidth: 2,
        strokeEnabled: false,
        shadowColor: 'white',
        shadowBlur: 5,
        shadowOffset: 1
    });

    this.layer.add(this.bg);
    this.layer.add(this.pattern);


    if (owner === 1) {
        this.pattern.hide();
        this.bg.setFill('grey');
        this.bg.setShadowColor('grey');
    }
}

Card.prototype.turn = function() {
    var obj = {bg: this.bg, pattern: this.pattern, factor: 1};
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

    var t3 = new TweenLite(obj, 0.5, {factor: 0, onUpdate: function() {
            this.target.bg.setScaleX(this.target.factor);
            cardLayer.draw();
        }, onStart: function() {
            this.target.pattern.setVisible(false);
            cardLayer.draw();
        }, delay: 1});

    var t4 = new TweenLite(obj, 0.5, {factor: 1, onUpdate: function() {
            this.target.bg.setScaleX(this.target.factor);
            cardLayer.draw();
        }, onStart: function() {
            this.target.bg.setFill('grey');
            this.target.bg.setShadowColor('grey');
            cardLayer.draw();
        }, onComplete: function() {
            toggleControls();
        }});
    timeline.add(t1);
    timeline.add(t2);
    timeline.add(t3);
    timeline.add(t4);
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
    this.bg.setPosition(newX, newY);
    switch (this.type) {
        case 0:
            this.pattern.setPosition(newX + cardWidth / 2, newY + cardHeight / 2);
            break;
        case 1:
            vertices = [newX + (cardWidth - triangleLength) / 2, newY + cardHeight / 2 + triangleLength / 6 * Math.sqrt(3),
                newX + (cardWidth + triangleLength) / 2, newY + cardHeight / 2 + triangleLength / 6 * Math.sqrt(3),
                newX + cardWidth / 2, newY + cardHeight / 2 - triangleLength / 3 * Math.sqrt(3)];
            this.pattern.setAttr("points", vertices);
            console.log(this);
            console.log(this.pattern.getPosition());
            this.pattern.setPosition(0, 0);
            console.log(this.pattern.getPosition());
            break;
        case 2:
            this.pattern.setPosition(newX + (cardWidth - squareLength) / 2,
                    newY + (cardHeight - squareLength) / 2);
            break;
        case 3:
            this.pattern.setPosition(newX + (cardWidth - rectangleWidth) / 2,
                    newY + (cardHeight - rectangleHeight) / 2);
            break;
        default:
            console.log("Invalid card type.");
            return;
    }
    this.layer.draw();
};