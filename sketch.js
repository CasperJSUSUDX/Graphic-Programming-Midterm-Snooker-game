// collision group
const SCENE = 0b0001;
const PLAYER = 0b0010;

// table
const tableLength = window.innerWidth * 0.6;
const tableWidth = tableLength / 2;
const ballSize = tableWidth / 36;
const pocketSize = ballSize * 1.5;
const tableColor = "#2A6137";
const slideColor = "#784315";
const pocketsPos = [
    {
        x: window.innerWidth / 2 - tableLength / 2,
        y: window.innerHeight / 2 - tableWidth / 2,
    },
    {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2 - tableWidth / 2,
    },
    {
        x: window.innerWidth / 2 + tableLength / 2,
        y: window.innerHeight / 2 - tableWidth / 2,
    },
    {
        x: window.innerWidth / 2 - tableLength / 2,
        y: window.innerHeight / 2 + tableWidth / 2,
    },
    {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2 + tableWidth / 2,
    },
    {
        x: window.innerWidth / 2 + tableLength / 2,
        y: window.innerHeight / 2 + tableWidth / 2,
    },
];
var tableSides;
var tableSensor
const tableRestitution = 0.7;
const tableFriction = 0.1;
const tableOptions = {
    ccd: true,
    restitution: tableRestitution,
    friction: tableFriction,
    label: "Wall",
    collisionFilter: {
        category: SCENE,
        mask: SCENE,
    },
};
const tableSensorOptions = {
    ccd: true,
    isSensor: true,
    label: "WallSensor",
    collisionFilter: {
        category: SCENE,
        mask: SCENE,
    },
};
// cue
var cue;
// balls
var balls = [];

// UI
var scoreUI;

var debugMode = true;

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    background(255);
    rectMode(CENTER);

    // physic engine initial
    engine = Engine.create({
        enableCCD: true,
        positionIterations: 20,
        velocityIterations: 12,
    });
    world = engine.world;
    // disable gravity
    engine.gravity.y = 0;

    // variables initial
    cuePosition = createVector(0, -tableWidth / 4);

    // object initial
    layoutOfSnookerBalls();
    
    // bodise initial
    // table
    tableSides = Body.create({
        parts: [
            // top
            Bodies.rectangle(
                0,
                -tableWidth / 2 - ballSize / 2,
                tableLength - ballSize / 4,
                ballSize,
                tableOptions
            ),
            // left
            Bodies.rectangle(
                -tableLength / 2 - ballSize / 2,
                0,
                ballSize,
                tableWidth - ballSize / 4,
                tableOptions
            ),
            // bottom
            Bodies.rectangle(
                0,
                tableWidth / 2 + ballSize / 2,
                tableLength - ballSize / 4,
                ballSize,
                tableOptions
            ),
            // right
            Bodies.rectangle(
                tableLength / 2 + ballSize / 2,
                0,
                ballSize,
                tableWidth - ballSize / 4,
                tableOptions
            ),
        ],
        isStatic: true,
        label: "TableCompound",
    });
    tableSensor = Body.create({
        parts: [
            // top
            Bodies.rectangle(
                0,
                -tableWidth / 2 - ballSize / 2,
                tableLength,
                ballSize,
                tableSensorOptions
            ),
            // left
            Bodies.rectangle(
                -tableLength / 2 - ballSize / 2,
                0,
                ballSize,
                tableWidth,
                tableSensorOptions
            ),
            // bottom
            Bodies.rectangle(
                0,
                tableWidth / 2 + ballSize / 2,
                tableLength,
                ballSize,
                tableSensorOptions
            ),
            // right
            Bodies.rectangle(
                tableLength / 2 + ballSize / 2,
                0,
                ballSize,
                tableWidth,
                tableSensorOptions
            ),
        ],
        label: "TableSensorCompound",
    });

    // cue
    cue = new Cue(
            createVector(0, -tableWidth / 4),
            (tableWidth * 5) / 6,
            tableWidth * 0.014,
            "#563112",
            10,
            5,
            ballSize / 2
        );

    // add bodies to world
    World.add(world, [tableSides, tableSensor]);

    // translate the world to the center of user window
    Composite.translate(
        world,
        {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        }
    );

    UI.createUIContainer();
    UI.createMoveSensetiveSlider(cue);
    UI.createScoreText();
}

function draw() {
    // update physic engine
    Engine.update(engine, 1000 / 60);

    background(255);

    // draw table
    push();
    translate(window.innerWidth / 2, window.innerHeight / 2);
    // table
    noStroke();
    fill(tableColor);
    rect(0, 0, tableLength, tableWidth);
    // lines
    stroke(255);
    strokeWeight(2);
    noFill();
    line(
        -tableLength * 0.3,
        -tableWidth / 2,
        -tableLength * 0.3,
        tableWidth / 2
    );
    arc(
        -tableLength * 0.3,
        0,
        tableWidth / 3,
        tableWidth / 3,
        PI / 2,
        (PI * 3) / 2
    );
    // slide
    noStroke();
    fill(slideColor);
    rect(0, -tableWidth / 2 - ballSize / 2, tableLength, ballSize);
    rect(-tableLength / 2 - ballSize / 2, 0, ballSize, tableWidth);
    rect(0, tableWidth / 2 + ballSize / 2, tableLength, ballSize);
    rect(tableLength / 2 + ballSize / 2, 0, ballSize, tableWidth);
    // background of pockets
    noStroke();
    fill(255, 255, 0);
    drawCornerBackground(createVector(-tableLength / 2, -tableWidth / 2), 0);
    drawCornerBackground(
        createVector(-tableWidth / 2, -tableLength / 2),
        PI / 2
    );
    drawCornerBackground(createVector(-tableLength / 2, -tableWidth / 2), PI);
    drawCornerBackground(
        createVector(-tableWidth / 2, -tableLength / 2),
        (PI * 3) / 2
    );
    rect(0, -tableWidth / 2 - ballSize / 2, ballSize * 2, ballSize);
    rect(0, tableWidth / 2 + ballSize / 2, ballSize * 2, ballSize);
    // pockets
    noStroke();
    fill(0);
    ellipse(-tableLength / 2, -tableWidth / 2, pocketSize);
    ellipse(0, -tableWidth / 2, pocketSize);
    ellipse(tableLength / 2, -tableWidth / 2, pocketSize);
    ellipse(-tableLength / 2, tableWidth / 2, pocketSize);
    ellipse(0, tableWidth / 2, pocketSize);
    ellipse(tableLength / 2, tableWidth / 2, pocketSize);
    pop();

    // draw balls
    for (let i = 0; i < balls.length; i++) {
        balls[i].draw();
    }

    cue.draw();
    cue.move();
    cue.rotate();

    // sink check
    for (let i = 0; i < balls.length; i++) {
        for (let j = 0; j < pocketsPos.length; j++) {
            if (
                dist(
                    balls[i].body.position.x,
                    balls[i].body.position.y,
                    pocketsPos[j].x,
                    pocketsPos[j].y
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

    Ball.cueBallCollisionCheck();
    Ball.ballCollisionWithWallCheck();
    UI.drawSelectBallArea(Rule.allRedPockected);

    if (debugMode) {
        drawMousePos();
        cue.drawHitArea();
    }
}

function mousePressed() {
    cue.pushStart();
    Rule.selectColorBall();
}

function mouseDragged() {
    cue.pushProcess();
}

async function mouseReleased() {
    cue.pushEnd();
}

function keyPressed() {
    if (keyCode == 32) {
        if (Rule.stage === 0) {

        } else {
            cue.switchMode();
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

function layoutOfSnookerBalls() {
    // cue ball
    balls.push(new Ball({ x: -tableLength * 0.35, y: 0 }, "#ffffff"));
    // yellow ball
    balls.push(
        new Ball({ x: -tableLength * 0.3, y: tableWidth / 6 }, "#ffff00", 2)
    );
    // browen ball
    balls.push(new Ball({ x: -tableLength * 0.3, y: 0 }, "#784315", 4));
    // green ball
    balls.push(
        new Ball({ x: -tableLength * 0.3, y: -tableWidth / 6 }, "#00ff00", 3)
    );
    // blue ball
    balls.push(new Ball({ x: 0, y: 0 }, "#0000ff", 5));
    // pink
    balls.push(new Ball({ x: tableLength / 4, y: 0 }, "#EF88BE", 6));
    // black ball
    balls.push(new Ball({ x: (tableLength * 9) / 22, y: 0 }, "#000000", 7));
    // red balls
    for (let i = 0; i < 5; i++) {
        var basicPosY = (ballSize / 2) * i;
        for (let j = 0; j <= i; j++) {
            balls.push(
                new Ball(
                    { x: tableLength / 4 + ballSize * (i + 1), y: basicPosY - ballSize * j },
                    "#ff0000"
                )
            );
        }
    }
}

function chooseColor(target) {}