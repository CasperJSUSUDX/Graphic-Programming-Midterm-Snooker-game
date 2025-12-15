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
            // rails
            noStroke();
            fill(railColor);
            rect(0, 0, length + railWidth * 4, width + railWidth * 4);
            // table
            noStroke();
            fill(color);
            rect(0, 0, length + railWidth * 2, width + railWidth * 2);
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
            // background of pockets
            noStroke();
            fill(255, 255, 0);
            const positions = [
                {
                    x: -length / 2 - railWidth,
                    y: -width / 2 - railWidth,
                },
                {
                    x: -width / 2 - railWidth,
                    y: -length / 2 - railWidth,
                },
                {
                    x: -length / 2 - railWidth,
                    y: -width / 2 - railWidth,
                },
                {
                    x: -width / 2 - railWidth,
                    y: -length / 2 - railWidth,
                },
            ];
            for (let i = 0; i < positions.length; i++) {
                drawCornerBackground(
                    positions[i],
                    (PI * i) / 2
                );
            }
            rect(0, -width / 2 - (railWidth * 3) / 2, railWidth * 2, railWidth);
            rect(0, width / 2 + (railWidth * 3) / 2, railWidth * 2, railWidth);
            // pockets
            noStroke();
            fill(0);
            ellipse(-length / 2 - railWidth / 2, -width / 2 - railWidth / 2, pocketSize);
            ellipse(length / 2 + railWidth / 2, -width / 2 - railWidth / 2, pocketSize);
            ellipse(-length / 2 - railWidth / 2, width / 2 + railWidth / 2, pocketSize);
            ellipse(length / 2 + railWidth / 2, width / 2 + railWidth / 2, pocketSize);
            ellipse(0, -width / 2 - railWidth, pocketSize);
            ellipse(0, width / 2 + railWidth, pocketSize);

            for (let i = 0; i < 4; i++) {
                if (i % 2 === 0) {
                    // left
                    drawTrapezoid(
                        length / 2 - (railWidth * 3) / 4,
                        railWidth,
                        PI / 12,
                        PI / 12,
                        "#06402B",
                        {
                            x: -length / 4 - railWidth / 4,
                            y: (width / 2 + railWidth / 2) * (i - 1)
                        },
                        (PI * i) / 2
                    );
                    // right
                    drawTrapezoid(
                        length / 2 - (railWidth * 3) / 4,
                        railWidth,
                        PI / 12,
                        PI / 12,
                        "#06402B",
                        {
                            x: length / 4 + railWidth / 4,
                            y: (width / 2 + railWidth / 2) * (i - 1)
                        },
                        (PI * i) / 2
                    );
                } else {
                    drawTrapezoid(
                        width,
                        railWidth,
                        PI / 12,
                        PI / 12,
                        "#06402B",
                        {
                            x: (tableLength / 2 + railWidth / 2) * (2 - i),
                            y: 0
                        },
                        (PI * i) / 2
                    );
                }
            }
            pop();
        }

        this.sinkedMap = new Map();
        this.sinkCheck = function() {
            for (const ball of Ball.balls) {
                for (let j = 0; j < this.pocketsPos.length; j++) {
                    if (
                        dist(
                            ball.body.position.x,
                            ball.body.position.y,
                            this.pocketsPos[j].x,
                            this.pocketsPos[j].y
                        ) < pocketSize
                    ) {
                        ball.visiable = false;
                        Body.set(ball, "isSensor", true);
                        Body.setVelocity(ball.body, {x: 0, y: 0});
                        this.sinkedMap.set(ball.id, ball);
                    }
                }
            }
        }

        function drawTrapezoid(length, width, leftDeg, rightDeg, color, position = {x: 0, y: 0}, rotateDeg = 0) {
            push();
            translate(position.x, position.y);
            rotate(rotateDeg);
            noStroke();
            fill(color);
            beginShape();
            vertex(-length / 2, -width / 2);
            vertex(length / 2, -width / 2);
            vertex(length / 2 - width/cos(rightDeg), width / 2);
            vertex(-length / 2 + width/cos(leftDeg), width / 2);
            vertex(-length / 2, -width / 2);
            endShape();
            pop();
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