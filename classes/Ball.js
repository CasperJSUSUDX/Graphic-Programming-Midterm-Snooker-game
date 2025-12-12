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

        return undefined;
    }

    static checkList = [];
    static ballCollisionWithWallCheck() {
        for (let i = 0; i < this.checkList.length; i++) {
            var collided = null;
            for (let j = 1; j < scene.body.parts.length; j++) {
                collided = Collision.collides(this.checkList[i].body, scene.body.parts[j]);
                if (collided) break;
            }
            
            if (collided) {
                // console.log(`${this.checkList[i].id} collided with wall`);
                // console.log(collided);
                this.checkList.splice(i, 1);
                i--;
            }
        }
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
}