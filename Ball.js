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
        World.add(world, this.body);

        this.draw = function () {
            push();
            translate(this.body.position.x, this.body.position.y);
            rotate(this.body.angle);
            stroke(0);
            strokeWeight(0.5);
            fill(color);
            ellipse(0, 0, size);
            pop();
        };
    }
}