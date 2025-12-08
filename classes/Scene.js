class Scene {
    constructor (length, width, railWidth, pocketSize, color, railColor, restitution = 0.7, friction = 0.1) {
        const option = {
            ccd: true,
            restitution: restitution,
            friction: friction,
            label: "Wall",
            collisionFilter: {
                category: SCENE,
                mask: SCENE,
            },
        };

        this.pocketsPos = [
            {
                x: window.innerWidth / 2 - length / 2,
                y: window.innerHeight / 2 - width / 2,
            },
            {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2 - width / 2,
            },
            {
                x: window.innerWidth / 2 + length / 2,
                y: window.innerHeight / 2 - width / 2,
            },
            {
                x: window.innerWidth / 2 - length / 2,
                y: window.innerHeight / 2 + width / 2,
            },
            {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2 + width / 2,
            },
            {
                x: window.innerWidth / 2 + length / 2,
                y: window.innerHeight / 2 + width / 2,
            },
        ];

        this.body = Body.create({
            parts: [
                // top
                Bodies.rectangle(
                    0,
                    -width / 2 - railWidth / 2,
                    length,
                    railWidth,
                    option
                ),
                // left
                Bodies.rectangle(
                    -length / 2 - railWidth / 2,
                    0,
                    railWidth,
                    width,
                    option
                ),
                // bottom
                Bodies.rectangle(
                    0,
                    width / 2 + railWidth / 2,
                    length,
                    railWidth,
                    option
                ),
                // right
                Bodies.rectangle(
                    length / 2 + railWidth / 2,
                    0,
                    railWidth,
                    width,
                    option
                ),
            ],
            isStatic: true,
            label: "TableCompound",
        });
        World.add(world, this.body);

        this.draw = function() {
            // draw table
            push();
            translate(window.innerWidth / 2, window.innerHeight / 2);
            // table
            noStroke();
            fill(color);
            rect(0, 0, length, width);
            // lines
            stroke(255);
            strokeWeight(2);
            noFill();
            line(
                -length * 0.3,
                -width / 2,
                -length * 0.3,
                width / 2
            );
            arc(
                -length * 0.3,
                0,
                width / 3,
                width / 3,
                PI / 2,
                (PI * 3) / 2
            );
            // rail
            noStroke();
            fill(railColor);
            rect(0, -width / 2 - railWidth / 2, length, railWidth);
            rect(-length / 2 - railWidth / 2, 0, railWidth, width);
            rect(0, width / 2 + railWidth / 2, length, railWidth);
            rect(length / 2 + railWidth / 2, 0, railWidth, width);
            // background of pockets
            noStroke();
            fill(255, 255, 0);
            drawCornerBackground(createVector(-length / 2, -width / 2), 0);
            drawCornerBackground(
                createVector(-width / 2, -length / 2),
                PI / 2
            );
            drawCornerBackground(createVector(-length / 2, -width / 2), PI);
            drawCornerBackground(
                createVector(-width / 2, -length / 2),
                (PI * 3) / 2
            );
            rect(0, -width / 2 - railWidth / 2, railWidth * 2, railWidth);
            rect(0, width / 2 + railWidth / 2, railWidth * 2, railWidth);
            // pockets
            noStroke();
            fill(0);
            ellipse(-length / 2, -width / 2, pocketSize);
            ellipse(0, -width / 2, pocketSize);
            ellipse(length / 2, -width / 2, pocketSize);
            ellipse(-length / 2, width / 2, pocketSize);
            ellipse(0, width / 2, pocketSize);
            ellipse(length / 2, width / 2, pocketSize);
            pop();
        }

        this.sinkCheck = function() {
            for (let i = 0; i < balls.length; i++) {
                for (let j = 0; j < this.pocketsPos.length; j++) {
                    if (
                        dist(
                            balls[i].body.position.x,
                            balls[i].body.position.y,
                            this.pocketsPos[j].x,
                            this.pocketsPos[j].y
                        ) < pocketSize
                    ) {
                        if (i == 0) {
                            Rule.pottedCueBall();
                        } else {
                            console.log(`Sinked`);

                            if (Rule.stage === 1 && balls[i].id !== "#ff0000") {
                                console.log("Reposition");
                                balls[i].reposition();
                                Body.setVelocity(balls[i].body, {x: 0, y: 0});
                                break;
                            }

                            World.remove(world, balls[i].body);
                            balls.splice(i, 1);
                        }
                    }
                }
            }
        }

        function drawCornerBackground(position, deg) {
            var extendSize = pocketSize * 0.4;

            push();
            rotate(deg);
            translate(position.x, position.y);
            beginShape();
            vertex(0, extendSize);
            vertex(-ballSize, extendSize);
            vertex(-ballSize, -ballSize);
            vertex(extendSize, -ballSize);
            vertex(extendSize, 0);
            vertex(0, 0);
            vertex(0, extendSize);
            endShape();
            pop();
        }
    }
}