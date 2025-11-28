class Cue {
    /**
     * @param {p5.Vector} _initPos 
     * @param {Number} _length 
     * @param {Number} _diameter 
     * @param {HEX} _color 
     * @param {Number} _speed 
     * @param {Number} _pushForce 
     */
    constructor (_initPos, _length, _diameter, _color, _speed, _pushForce) {
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
        var pushForce = _pushForce;
        var pushing = false;
        var positionLock = false;
        var rotationLock = false;
        var originalBodyPos;
        var pushStartPos;

        this.body = Bodies.rectangle(
            position.x,
            position.y,
            length,
            diameter,
            bodyOptions
        );
        World.add(world, this.body);
        this.sensor;

        // debug var
        this.de_position = position;

        this.draw = function () {
            push();
            translate(window.innerWidth / 2, window.innerHeight / 2);
            translate(position);
            rotate(deg);
            noStroke();
            fill(color);
            rect(0, 0, length, diameter);
            pop();
        }

        this.move = function () {
            if (keyIsPressed && !positionLock) {
                let velocity = createVector(0, 0);

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
                Body.translate(this.body, {
                    x: velocity.x,
                    y: velocity.y,
                });
            }
        }

        this.rotate = function () {
            if (!rotationLock) {
                const translateMouseX = mouseX - window.innerWidth / 2;
                const translateMouseY = mouseY - window.innerHeight / 2;
                deg = atan2(
                    translateMouseY - position.y,
                    translateMouseX - position.x
                );
            }

            // TODO(Casper): Switch to useing angular speed to spin cue instead of useing "setAngle"
            Body.setAngle(this.body, deg);
        }

        this.switchMode = function () {
            if (!pushing) {
                if (positionLock) {
                    this.body.collisionFilter.category = PLAYER;
                    this.body.collisionFilter.mask = PLAYER;
                    // rotationLock = false;
                } else {
                    this.body.collisionFilter.category = SCENE;
                    this.body.collisionFilter.mask = SCENE;
                    // rotationLock = true;
                }

                positionLock = !positionLock;
            }
        }

        this.pushStart = function () {
            if (!pushing && positionLock) {
                pushing = true;
                rotationLock = true;
                pushStartPos = createVector(mouseX, mouseY);
                originalBodyPos = position.copy();

                this.sensor = Bodies.rectangle(
                    this.body.position.x,
                    this.body.position.y,
                    length,
                    diameter,
                    sensorOptions
                );
                Body.setAngle(this.sensor, deg);
                World.add(world, this.sensor);
            }
        }

        this.pushProcess = function () {
            if (pushing && positionLock) {
                // reset cue position
                position = originalBodyPos.copy();
                Body.setPosition(this.sensor, {
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

                position.sub(moveDirection);
                Body.translate(this.sensor, {
                    x: -moveDirection.x,
                    y: -moveDirection.y
                });

                // check if cue collision with any ball
                for (let i = 0; i < balls.length; i++) {
                    const outcome = Collision.collides(balls[i].info(), this.sensor);
                    if (outcome) {
                        console.log("Detected collision with ball:", i);
                    };
                }
            }
        }

        this.pushEnd = async function () {
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
                let pushEndPos = createVector(mouseX, mouseY);
                let moveLength = min(300, pushEndPos.sub(pushStartPos).mag());

                pushForce = map(moveLength, 0, 300, 0, 10);

                // apply pushing animation
                console.log("Cue released: Apply push animation");
                const speed = createVector(
                    originalBodyPos.x - position.x,
                    originalBodyPos.y - position.y
                ).div(pushForce);
                await cueReposition(speed);
                // Body.applyForce(this.body, this.body.position, {
                //     x: cos(cueRotateDeg) * pushForce * 0.1,
                //     y: sin(cueRotateDeg) * pushForce * 0.1,
                // });
                console.log(`Cue released: Apply velocity: ${pushForce}`);
                World.remove(world, this.sensor);
                Events.off(engine, "collisionStart");

                // back to default state
                pushing = false;
                positionLock = false;
                this.body.collisionFilter.category = PLAYER;
                this.body.collisionFilter.mask = PLAYER;
                setTimeout(() => {rotationLock = false;}, 100);
            }
        }
    }
}