class Cue {
    /**
     * @param {p5.Vector} _initPos 
     * @param {Number} _length 
     * @param {Number} _diameter 
     * @param {HEX} _color 
     * @param {Number} _speed 
     * @param {Number} _pushForce 
     */
    constructor (_initPos, _length, _diameter, _color, _speed, _maxPushForce, _hitSupportRange) {
        const bodyOptions = {
            isStatic: true,
            density: 0.06,
            friction: 0.8,
            frictionAir: 0.8,
            label: "cue",
            collisionFilter: {
                category: PLAYER,
                mask: PLAYER,
            }
        };
        const sensorOptions = {
            isSensor: true,
            collisionFilter: {
                category: SCENE,
                mask: SCENE,
            }
        };
        var position = _initPos;
        var deg = 0;
        var length = _length;
        var diameter = _diameter;
        var color = _color;
        var speed = _speed;
        var maxPushForce = _maxPushForce;
        var hitSupportRange = _hitSupportRange;
        var pushing = false;
        var hitWhenPushing = false;
        var positionLock = false;
        var rotationLock = false;
        var originalBodyPos;
        var pushStartPos;

        var body = Bodies.rectangle(
            position.x,
            position.y,
            length,
            diameter,
            bodyOptions
        );
        World.add(world, body);
        var collisionSensor;
        var hitSensor;

        this.draw = function() {
            push();
            translate(window.innerWidth / 2, window.innerHeight / 2);
            translate(position);
            rotate(deg);
            noStroke();
            fill(color);
            rect(0, 0, length, diameter);
            pop();
        }

        this.move = function() {
            if (keyIsPressed && !positionLock) {
                var velocity = createVector(0, 0);

                // W
                if (keyIsDown(87)) velocity.add(0, -speed);
                // A
                if (keyIsDown(65)) velocity.add(-speed, 0);
                // S
                if (keyIsDown(83)) velocity.add(0, speed);
                // D
                if (keyIsDown(68)) velocity.add(speed, 0);

                velocity.normalize().mult(speed);
                position.add(velocity);
                Body.translate(body, {
                    x: velocity.x,
                    y: velocity.y,
                });
            }
        }

        this.rotate = function() {
            if (!rotationLock) {
                const translateMouseX = mouseX - window.innerWidth / 2;
                const translateMouseY = mouseY - window.innerHeight / 2;
                deg = atan2(
                    translateMouseY - position.y,
                    translateMouseX - position.x
                );
            }

            // TODO(Casper): Switch to useing angular speed to spin cue instead of useing "setAngle"
            Body.setAngle(body, deg);
        }

        this.switchMode = function() {
            if (!pushing && !Rule.isAnyBallMoving()) {
                if (positionLock) {
                    body.collisionFilter.category = PLAYER;
                    body.collisionFilter.mask = PLAYER;
                    // rotationLock = false;
                } else {
                    body.collisionFilter.category = SCENE;
                    body.collisionFilter.mask = SCENE;
                    // rotationLock = true;
                }

                positionLock = !positionLock;
            }
        }

        this.switchLayer = function() {
            if (body.collisionFilter.category = SCENE) {
                body.collisionFilter.category = PLAYER;
                body.collisionFilter.mask = PLAYER;
            } else {
                body.collisionFilter.category = SCENE;
                body.collisionFilter.mask = SCENE;
            } 
        }

        this.adjustSpeed = function(num) {
            speed = num;
        }

        this.pushStart = function() {
            if (!pushing && positionLock) {
                pushing = true;
                rotationLock = true;
                pushStartPos = createVector(mouseX, mouseY);
                originalBodyPos = position.copy();

                collisionSensor = Bodies.rectangle(
                    body.position.x,
                    body.position.y,
                    length,
                    diameter,
                    sensorOptions
                );
                hitSensor = Bodies.rectangle(
                    body.position.x + (cos(deg) * (length / 2 + hitSupportRange / 2)),
                    body.position.y + (sin(deg) * (length / 2 + hitSupportRange / 2)),
                    hitSupportRange,
                    hitSupportRange,
                    sensorOptions
                );
                Body.setAngle(collisionSensor, deg);
                Body.setAngle(hitSensor, deg);
                World.add(world, [collisionSensor, hitSensor]);
            }
        }

        this.pushProcess = function() {
            if (pushing && positionLock && !hitWhenPushing) {
                // reset cue position
                position = originalBodyPos.copy();
                Body.setPosition(collisionSensor, {
                    x: window.innerWidth / 2 + position.x,
                    y: window.innerHeight / 2 + position.y
                });

                // calulate cue's moving and store cue position
                originalBodyPos = position.copy();
                const pushEndPos = createVector(mouseX, mouseY);
                const moveLength = min(300, pushEndPos.sub(pushStartPos).mag());
                const moveDirection = createVector(
                    cos(deg),
                    sin(deg)
                ).mult(moveLength);
                UI.convertForceToChargeBarHeight(moveLength, 0, 300);

                position.sub(moveDirection);
                Body.translate(collisionSensor, {
                    x: -moveDirection.x,
                    y: -moveDirection.y
                });

                // hit ball during pushing
                for (let i = 0; i < Ball.balls.length; i++) {
                    if (Collision.collides(Ball.balls[i].body, collisionSensor)) {
                        Rule.missTouching();
                        hitWhenPushing = true;
                        // case 1: Hit white ball
                        if (i === 0) {

                        }
                        // case 2: Hit color balls
                        else {
                            
                        }
                    };
                }
            }
        }

        this.pushEnd = async function() {
            async function cueReposition(direction) {
                return new Promise((resolve) => {
                    const step = () => {
                        if (position.copy().sub(originalBodyPos).mag() <= 50) {
                            resolve();
                            position = originalBodyPos.copy();
                            return;
                        }

                        position.add(direction);
                        setTimeout(step, 20);
                    };

                    step();
                });
            }

            if (pushing && positionLock) {
                var pushEndPos = createVector(mouseX, mouseY);
                var moveLength = min(300, pushEndPos.sub(pushStartPos).mag());
                var hitBall = null;
                var pushForce = map(moveLength, 0, 300, 0, maxPushForce * 10);

                const speed = createVector(
                    originalBodyPos.x - position.x,
                    originalBodyPos.y - position.y
                ).div(5);
                await cueReposition(speed);
                for (let i = 0; i < Ball.balls.length; i++) {
                    if (Collision.collides(Ball.balls[i].body, hitSensor)) {
                        hitBall = Ball.balls[i];
                        Body.applyForce(Ball.balls[i].body, Ball.balls[i].body.position, {
                                x: cos(deg) * pushForce * 0.02,
                                y: sin(deg) * pushForce * 0.02,
                            });
                        break;
                    }
                }
                if (hitBall) {
                    if (hitBall.id !== "#ffffff") Rule.failToHitCueBall(hitBall.score);
                    else if (Rule.stage === 0) Ball.registerCheckList(Ball.balls.filter(e => e.id === "#ff0000"));
                } else {
                    Rule.failToHitCueBall();
                }
                World.remove(world, collisionSensor);
                Rule.turnProcessing = true;
            }
        }

        this.unlock = function() {
            pushing = false;
            positionLock = false;
            hitWhenPushing = false;
            rotationLock = false;
        }

        this.interruptPush  = function() {
            if (pushing) {
                pushing = false;
                cue.unlock();
                UI.resetChargeBar();
                position = originalBodyPos.copy();
                Body.setPosition(collisionSensor, {
                    x: window.innerWidth / 2 + position.x,
                    y: window.innerHeight / 2 + position.y
                });
                this.switchLayer();
            }
        }

        // debug use
        this.drawHitArea = function() {
            push();
            translate(
                body.position.x + (cos(deg) * (length / 2 + hitSupportRange / 2)),
                body.position.y + (sin(deg) * (length / 2 + hitSupportRange / 2)),
            );
            noStroke();
            fill(255, 0, 0, 75);
            rotate(deg);
            rect(0, 0, hitSupportRange);
            pop();
        }
    }
}