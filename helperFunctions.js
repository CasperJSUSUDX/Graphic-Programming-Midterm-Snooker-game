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

        this.info = function () {
            return ball;
        };
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