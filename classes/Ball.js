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
            push();
            translate(this.body.position.x, this.body.position.y);
            rotate(this.body.angle);
            stroke(0);
            strokeWeight(0.5);
            fill(color);
            ellipse(0, 0, size);
            pop();
        };

        this.reposition = function() {
            Body.setPosition(this.body, this.initPosition);
            Body.translate(this.body, {x: window.innerWidth / 2, y: window.innerHeight / 2});
        }
    }

    static #startDetect = false;
    static #endDetect = false;
    static #hadCollision = false;
    static cueBallCollisionCheck() {
        if (balls[0].body.speed > 0.001) {
            this.#startDetect = true;
            for (let i = 1; i < balls.length; i++) {
                var collided = Collision.collides(balls[0].body, balls[i].body);
                if (collided) {
                    Rule.firstCollisionColor(balls[i]);
                    this.#hadCollision = true;
                    console.log(`${balls[0].id} collided with cue ball\n${collided}`);
                }
            }
        } else if (this.#startDetect && !this.#endDetect) {
            this.#startDetect = false;
            this.#endDetect = true;
        }

        if (!this.#startDetect && this.#endDetect && !this.#hadCollision) {
            Rule.hitOrPottedWrongBall(balls[0]);
            this.#endDetect = false;
        }
    }

    static checkList = [];
    static ballCollisionWithWallCheck() {
        for (let i = 0; i < this.checkList.length; i++) {
            var collided = null;
            for (let j = 1; j < tableSides.parts.length; j++) {
                collided = Collision.collides(this.checkList[i].body, tableSides.parts[j]);
                break;
            }
            
            if (collided) {
                console.log(`${this.checkList[i].id} collided with wall`);
                console.log(collided);
                this.checkList.splice(i, 1);
                i--;
            }
        }
    }
}