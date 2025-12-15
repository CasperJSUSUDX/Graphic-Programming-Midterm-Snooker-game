class Ball {
    constructor(defaultPosition, color, score = 1, size = ballSize) {
        const ballOptions = {
            ccd: true,
            density: 0.04,
            restitution: 0.8,
            friction: 0.1,
            frictionAir: 0.01,
            label: "Ball",
            collisionFilter: {
                category: SCENE,
                mask: SCENE,
            },
        };
        this.visiable = true;
        this.id = color;
        this.score = score;
        this.body = Bodies.circle(
            defaultPosition.x,
            defaultPosition.y,
            size / 2,
            ballOptions
        );
        this.initPosition = {...defaultPosition};
        World.add(world, this.body);

        this.draw = function() {
            if (this.visiable) {
                push();
                translate(this.body.position.x, this.body.position.y);
                rotate(this.body.angle);
                stroke(0);
                strokeWeight(0.5);
                fill(color);
                ellipse(0, 0, size);
                pop();
            }
            
        };

        this.reposition = function() {
            this.visiable = true;
            Body.setPosition(this.body, this.initPosition);
            Body.translate(this.body, {x: window.innerWidth / 2, y: window.innerHeight / 2});
            Body.set(this.body, "isSensor", false);
        }
    }

    static balls = [];
    static cueBallCollisionCheck() {
        if (this.balls[0].body.speed > 0.01) {
            for (let i = 1; i < this.balls.length; i++) {
                var collided = Collision.collides(this.balls[0].body, this.balls[i].body);
                if (collided) return this.balls[i];
            }
        }

        return {
            id: "undefined",
            score: -4
        };
    }
    static resetBalls() {
        World.remove(world, this.balls.map((e) => e.body));
        Ball.balls = [];
        this.initBalls(mode);
        UI.resetScore();
        for (const ball of this.balls) {
            Body.translate(ball.body, {x: window.innerWidth / 2, y: window.innerHeight / 2});
        }
    }

    static #checkList = [];
    static #startLength;
    static ballCollisionWithWallCheck() {
        for (let i = 0; i < this.#checkList.length; i++) {
            var collided = null;
            for (let j = 1; j < scene.body.parts.length; j++) {
                collided = Collision.collides(this.#checkList[i].body, scene.body.parts[j]);
                if (collided) break;
            }
            
            if (collided) {
                this.#checkList.splice(i, 1);
                i--;
            }
        }
    }
    static registerCheckList(arr) {
        this.#checkList = [...arr];
        this.#startLength = this.#checkList.length;
    }
    static checkListWasDecreaseAndClear() {
        const l = this.#checkList.length;
        this.#checkList = [];
        if (l !== this.#startLength) return true;
        return false;
    }

    static selectPosInDZone(cueBall) {
        const vector = {
            x: 0,
            y: 0
        }
        const rightLimit = window.innerWidth / 2 - tableLength * 0.3;
        const leftLimit = window.innerWidth / 2 - tableLength * 0.3 - tableWidth / 6;
        vector.x = -tableLength * 0.35;
        if (mouseX >= rightLimit) {
            vector.x = rightLimit;
        } else if (mouseX <= leftLimit) {
            vector.x = leftLimit;
        } else {
            vector.x = mouseX;
        }

        const l_square = (tableWidth / 6) ** 2 - (rightLimit - vector.x) ** 2;
        var l;
        if (l_square <= 0.001) l = tableWidth / 6;
        else l = Math.sqrt((tableWidth / 6) ** 2 - (rightLimit - vector.x) ** 2);
        const topLimit = window.innerHeight / 2 - l;
        const bottomLimit = window.innerHeight / 2 + l;
        vector.y = 0;
        if (mouseY <= topLimit) {
            vector.y = topLimit;
        } else if (mouseY >= bottomLimit) {
            vector.y = bottomLimit;
        } else {
            vector.y = mouseY;
        }

        Body.set(cueBall.body, "isSensor", true);
        Body.setPosition(cueBall.body, vector);
        for (let i = 1; i < this.balls.length; i++) {
            if (Collision.collides(cueBall.body, this.balls[i].body)) {
                UI.updateProgressSpan("Cannot put cue ball at there.", 2000);
                cueBall.reposition();
                return false;
            }
        }
        Body.set(cueBall.body, "isSensor", false);

        return true;
    }

    static initBalls(mode = 1) {
        switch (mode) {
            case 1:
                // cue ball
                this.balls.push(new Ball({ x: -tableLength * 0.35, y: 0 }, "#ffffff"));
                // yellow ball
                this.balls.push(
                    new Ball({ x: -tableLength * 0.3, y: tableWidth / 6 }, "#ffff00", 2)
                );
                // browen ball
                this.balls.push(new Ball({ x: -tableLength * 0.3, y: 0 }, "#784315", 4));
                // green ball
                this.balls.push(
                    new Ball({ x: -tableLength * 0.3, y: -tableWidth / 6 }, "#00ff00", 3)
                );
                // blue ball
                this.balls.push(new Ball({ x: 0, y: 0 }, "#0000ff", 5));
                // pink
                this.balls.push(new Ball({ x: tableLength / 4, y: 0 }, "#EF88BE", 6));
                // black ball
                this.balls.push(new Ball({ x: (tableLength * 9) / 22, y: 0 }, "#000000", 7));
                // red balls
                for (let i = 0; i < 5; i++) {
                    var basicPosY = (ballSize / 2) * i;
                    for (let j = 0; j <= i; j++) {
                        this.balls.push(new Ball(
                            { x: tableLength / 4 + ballSize * (i + 1), y: basicPosY - ballSize * j },
                            "#ff0000"
                        ));
                    }
                }
                break;
            case 2:
                // cue ball
                this.balls.push(new Ball({ x: -tableLength * 0.35, y: 0 }, "#ffffff"));
                // yellow ball
                this.balls.push(
                    new Ball({ x: -tableLength * 0.3, y: tableWidth / 6 }, "#ffff00", 2)
                );
                // browen ball
                this.balls.push(new Ball({ x: -tableLength * 0.3, y: 0 }, "#784315", 4));
                // green ball
                this.balls.push(
                    new Ball({ x: -tableLength * 0.3, y: -tableWidth / 6 }, "#00ff00", 3)
                );
                // blue ball
                this.balls.push(new Ball({ x: 0, y: 0 }, "#0000ff", 5));
                // pink
                this.balls.push(new Ball({ x: tableLength / 4, y: 0 }, "#EF88BE", 6));
                // black ball
                this.balls.push(new Ball({ x: (tableLength * 9) / 22, y: 0 }, "#000000", 7));
                // red balls
                for (let i = 0; i < 15; i++) {
                    this.balls.push(new Ball(
                        this.#generatePosition(),
                        "#ff0000",
                    ));
                } 
                break;
            case 3:
                // cue ball
                this.balls.push(new Ball({ x: -tableLength * 0.35, y: 0 }, "#ffffff"));
                // yellow ball
                this.balls.push(
                    new Ball({ x: -tableLength * 0.3, y: tableWidth / 6 }, "#ffff00", 2)
                );
                // browen ball
                this.balls.push(new Ball({ x: -tableLength * 0.3, y: 0 }, "#784315", 4));
                // green ball
                this.balls.push(
                    new Ball({ x: -tableLength * 0.3, y: -tableWidth / 6 }, "#00ff00", 3)
                );
                // blue ball
                this.balls.push(new Ball({ x: 0, y: 0 }, "#0000ff", 5));
                // pink
                this.balls.push(new Ball({ x: tableLength / 4, y: 0 }, "#EF88BE", 6));
                // black ball
                this.balls.push(new Ball({ x: (tableLength * 9) / 22, y: 0 }, "#000000", 7));
                // red balls
                const xInterval = (tableLength * 7) / 264;
                const yInterval = tableWidth / 12;
                for (let i = 0; i < 5; i++) {
                    // top
                    this.balls.push(new Ball(
                        { x: tableLength / 4, y: -yInterval * (i + 1) },
                        "#ff0000"
                    ));
                    // bottom
                    this.balls.push(new Ball(
                        { x: tableLength / 4, y: yInterval * (i + 1) },
                        "#ff0000"
                    ));
                    // right
                    this.balls.push(new Ball(
                        { x: tableLength / 4 + xInterval * (i + 1), y: 0 },
                        "#ff0000"
                    ));
                }
                break;
            case "debug":
                this.balls.push(new Ball({ x: 0, y: 0 }, "#ffffff"));
                this.balls.push(new Ball({ x: 0, y: tableWidth / 2 - 50 }, "#ff0000"));
                this.balls.push(new Ball({ x: tableLength / 2 - 50, y: -tableWidth / 2 + 50 }, "#0000ff",5));
                this.balls.push(new Ball({ x: tableLength / 2 - 50, y: tableWidth / 2 - 50 }, "#000000", 7));
                break;
        }

    }

    static #generatePosition() {
        const position = {
            x: -tableLength / 2 + ballSize + Math.random() * (tableLength - ballSize),
            y: -tableWidth / 2 + ballSize + Math.random() * (tableWidth - ballSize)
        };

        for (const ball of this.balls) {
            const deltaX = ball.initPosition.x - position.x;
            const deltaY = ball.initPosition.y - position.y;
            if (Math.sqrt(deltaX ** 2 + deltaY ** 2) <= ballSize / 2) {
                return this.#generatePosition();
            }
        }

        return position;
    }
}