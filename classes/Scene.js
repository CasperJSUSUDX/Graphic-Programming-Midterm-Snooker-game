class Scene {
    constructor (length, width, railWidth, pocketSize, color, railColor, restitution = 0.7, friction = 0.1) {
        const options = {
            ccd: true,
            restitution: restitution,
            friction: friction,
            label: "Rail",
            collisionFilter: {
                category: SCENE,
                mask: SCENE,
            },
        };
        const pocketsPos = [
            {
                x: -length / 2 - railWidth / 2,
                y: -width / 2 - railWidth / 2,
            },
            {
                x: length / 2 + railWidth / 2,
                y: -width / 2 - railWidth / 2,
            },
            {
                x: -length / 2 - railWidth / 2,
                y: width / 2 + railWidth / 2,
            },
            {
                x: length / 2 + railWidth / 2,
                y: width / 2 + railWidth / 2,
            },
            {
                x: 0,
                y: -width / 2 - railWidth,
            },
            {
                x: 0,
                y: width / 2 + railWidth,
            },
        ];
        const leftDeg = PI / 4;
        const rightDeg = PI / 4;
        const verticesForHorizontal = [
            {
                x: -length / 4 + pocketSize / 4,
                y: -railWidth / 2
            },
            {
                x: -length / 4 + pocketSize / 4 + railWidth/tan(leftDeg),
                y: railWidth / 2
            },
            {
                x: length / 4 - pocketSize / 4 - railWidth/tan(rightDeg),
                y: railWidth / 2
            },
            {
                x: length / 4 - pocketSize / 4,
                y: -railWidth / 2
            }
        ];
        const verticesForVertical = [
            {
                x: -railWidth / 2,
                y: -width / 2
            },
            {
                x: railWidth / 2,
                y: -width / 2 + railWidth / tan(rightDeg)
            },
            {
                x: railWidth / 2,
                y: width / 2 - railWidth / tan(rightDeg)
            },
            {
                x: -railWidth / 2,
                y: width
            }
        ];
        const parts = [
            // top left
            Bodies.fromVertices(
                -length / 4 - pocketSize / 4,
                -width / 2 - railWidth / 2,
                verticesForHorizontal,
                options
            ),
            // top right
            Bodies.fromVertices(
                -length / 4 - pocketSize / 4,
                width / 2 + railWidth / 2,
                verticesForHorizontal,
                options
            ),
            // bottom left
            Bodies.fromVertices(
                length / 4 + pocketSize / 4,
                -width / 2 - railWidth / 2,
                verticesForHorizontal,
                Object.assign(options, {angle: PI})
            ),
            // bottom right
            Bodies.fromVertices(
                length / 4 + pocketSize / 4,
                width / 2 + railWidth / 2,
                verticesForHorizontal,
                options
            ),
            // left
            Bodies.fromVertices(
                -length / 2 - railWidth / 2,
                0,
                verticesForVertical,
                Object.assign(options, {angle: 0})
            ),
            // right
            Bodies.fromVertices(
                length / 2 + railWidth / 2,
                0,
                verticesForVertical,
                Object.assign(options, {angle: PI})
            )
        ]
        this.body = Body.create({
            parts: parts,
            isStatic: true,
            label: "RailCompound"
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
            for (const position of pocketsPos) {
                ellipse(position.x, position.y, pocketSize);
            }

            for (let i = 0; i < 4; i++) {
                if (i % 2 === 0) {
                    // left
                    drawTrapezoid(
                        length / 2 - pocketSize / 2,
                        railWidth,
                        leftDeg,
                        rightDeg,
                        "#06402B",
                        {
                            x: -length / 4 - railWidth / 4,
                            y: (width / 2 + railWidth / 2) * (i - 1)
                        },
                        (PI * i) / 2
                    );
                    // right
                    drawTrapezoid(
                        length / 2 - pocketSize / 2,
                        railWidth,
                        leftDeg,
                        rightDeg,
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
                        leftDeg,
                        rightDeg,
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
                for (let j = 0; j < pocketsPos.length; j++) {
                    const translateX = window.innerWidth / 2 + pocketsPos[j].x;
                    const translateY = window.innerHeight / 2 + pocketsPos[j].y;
                    if (
                        dist(
                            ball.body.position.x,
                            ball.body.position.y,
                            translateX,
                            translateY
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
            vertex(length / 2 - width/tan(rightDeg), width / 2);
            vertex(-length / 2 + width/tan(leftDeg), width / 2);
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