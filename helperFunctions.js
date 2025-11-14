class Ball {
    constructor(defaultPosition, color, score = 1, size = ballSize) {
        this.id = color;
        this.score = score;
        let ball = Bodies.circle(
            defaultPosition.x,
            defaultPosition.y,
            size / 2,
            ballOptions
        );
        this.position = ball.position;
        World.add(world, ball);

        this.draw = function () {
            push();
            translate(ball.position.x, ball.position.y);
            rotate(ball.angle);
            stroke(0);
            strokeWeight(0.5);
            fill(color);
            ellipse(0, 0, size);
            pop();
        };

        // return the ball's object
        this.info = function () {
            return ball;
        };

        /**
         * apply
         * @param {*} cue 
         * @param {*} power 
         */
        this.collision = function (cue, power) {
            let force = {
                x: cos(cue.angle) * power,
                y: sin(cue.angle) * power
            }

            Body.applyForce(ball, this.position, force);
        }
    }
}

function drawMousePos() {
    push();
    strokeWeight(0.4);
    stroke(255);
    fill(255);
    text(`${mouseX}, ${mouseY}`, mouseX, mouseY);
    pop();
}