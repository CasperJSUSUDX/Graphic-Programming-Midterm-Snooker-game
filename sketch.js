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
        x: -tableLength / 2,
        y: -tableWidth / 2,
    },
    {
        x: 0,
        y: -tableWidth / 2,
    },
    {
        x: tableLength / 2,
        y: -tableWidth / 2,
    },
    {
        x: -tableLength / 2,
        y: tableWidth / 2,
    },
    {
        x: 0,
        y: tableWidth / 2,
    },
    {
        x: tableLength / 2,
        y: tableWidth / 2,
    },
];
var tableSides;
const tableOptions = {
    ccd: true,
    // isStatic: true,
    restitution: 0.7,
    friction: 0.1,
    label: "Wall",
    collisionFilter: {
        category: SCENE,
        mask: SCENE,
    },
};
const tableRestitution = 0.7;
const tableFriction = 0.1;
// cue
const cueLength = (tableWidth * 5) / 6;
const cueDiameter = tableWidth * 0.014;
const cueColor = "#563112";
var cue;
var cueMoveSpeed = 10;
var cuePosition;
var originalCuePos;
var cueRotateDeg = 0;
var preCueRotateDeg = 0;
var pushStartPos;
var pushForce = 2;
var pushing = false;
var positionLock = false;
var rotationLock = false;
const cueOptions = {
    isStatic: true,
    density: 0.06,
    friction: 0.8,
    frictionAir: 0.8,
    label: "cue",
    collisionFilter: {
        category: PLAYER,
        mask: PLAYER,
    },
};

// balls
var balls = [];
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
var colorOrder = [
    "#ff0000",
    "#ffff00",
    "#00ff00",
    "#784315",
    "#0000ff",
    "#EF88BE",
    "#000000",
];
var selectedColor;
var cueBallHasCollision = false;
var redWasPockected = false;

// setting
// 1 for starting position, 2 for ramdom position(only red balls), 3 for random position(red balls and colors)
var modes = 1;

// UI
var UIcontainer;
var moveUI;
var moveSlider;
var moveSensetiveText;
var currentSensetiveText;
var scoreUI;
var score = 0;

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

    // UI
    UIcontainer = createDiv();
    UIcontainer.id("ui");
    UIcontainer.position(10, 10);
    UIcontainer.style("display", "flex");
    UIcontainer.style("flex-direction", "column");
    // move
    moveUI = createDiv();
    moveUI.id("ui-move");
    moveUI.style("display", "flex");
    moveUI.parent("ui");
    moveSensetiveText = createSpan("Move sensetive: ");
    moveSensetiveText.class("ui-text");
    moveSensetiveText.parent("ui-move");
    moveSlider = createSlider(0, 20, 10);
    moveSlider.size(200);
    moveSlider.parent("ui-move");
    currentSensetiveText = createSpan(moveSlider.value());
    currentSensetiveText.class("ui-text");
    currentSensetiveText.parent("ui-move");
    moveSlider.changed(() => {
        currentSensetiveText.html(moveSlider.value());
        cueMoveSpeed = moveSlider.value();
    });
    // score
    scoreUI = createSpan(`Score: ${score}`);
    scoreUI.class("ui-text");
    scoreUI.parent("ui");

    // TODO(Casper): Using Body.translate to change the initial position of  bodies
    // bodise initial
    // table
    tableSides = Body.create({
        parts: [
            // top
            Bodies.rectangle(
                0,
                -tableWidth / 2 - ballSize / 2,
                tableLength,
                ballSize,
                tableOptions
            ),
            // left
            Bodies.rectangle(
                -tableLength / 2 - ballSize / 2,
                0,
                ballSize,
                tableWidth,
                tableOptions
            ),
            // bottom
            Bodies.rectangle(
                0,
                tableWidth / 2 + ballSize / 2,
                tableLength,
                ballSize,
                tableOptions
            ),
            // right
            Bodies.rectangle(
                tableLength / 2 + ballSize / 2,
                0,
                ballSize,
                tableWidth,
                tableOptions
            ),
        ],
        isStatic: true,
        label: "TableCompound",
    });
    // cue
    cue = Bodies.rectangle(
        0,
        -tableWidth / 4,
        cueLength,
        cueDiameter,
        cueOptions
    );

    // add bodies to world
    World.add(world, [tableSides, cue]);

    // translate the world to the center of user window
    Composite.translate(world,
        {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        });
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

    // draw cue
    push();
    translate(window.innerWidth / 2, window.innerHeight / 2);
    translate(cuePosition);
    rotate(cueRotateDeg);
    noStroke();
    fill(cueColor);
    rect(0, 0, cueLength, cueDiameter);
    pop();

    // cue movement
    if (keyIsPressed && !positionLock) {
        let speed = createVector(0, 0);

        // W
        if (keyIsDown(87)) {
            speed.add(0, -cueMoveSpeed);
        }
        // A
        if (keyIsDown(65)) {
            speed.add(-cueMoveSpeed, 0);
        }
        // S
        if (keyIsDown(83)) {
            speed.add(0, cueMoveSpeed);
        }
        // D
        if (keyIsDown(68)) {
            speed.add(cueMoveSpeed, 0);
        }

        speed.normalize();
        speed.mult(cueMoveSpeed);
        cuePosition.add(speed);
        Body.setPosition(cue, {
            x: cuePosition.x,
            y: cuePosition.y,
        });
    }

    // cue rotate
    if (!rotationLock) {
        let translateMouseX = mouseX - window.innerWidth / 2;
        let translateMouseY = mouseY - window.innerHeight / 2;
        cueRotateDeg = atan2(
            translateMouseY - cuePosition.y,
            translateMouseX - cuePosition.x
        );
    }
    // TODO(Casper): Switch to useing angular speed to spin cue instead of useing "setAngle"
    Body.setAngle(cue, cueRotateDeg);
    preCueRotateDeg = cueRotateDeg;

    // sink check
    for (let i = 0; i < balls.length; i++) {
        for (let j = 0; j < pocketsPos.length; j++) {
            if (
                dist(
                    balls[i].info().position.x,
                    balls[i].info().position.y,
                    pocketsPos[j].x,
                    pocketsPos[j].y
                ) < pocketSize
            ) {
                console.log("drop");
                World.remove(world, balls[i].info());
                score += balls[i].score;
                scoreUI.html(`Score: ${score}`);
                balls.splice(i, 1);
                break;
            }
        }
    }

    // select object ball area
    push();
    for (let i = 0; i < colorOrder.length; i++) {
        let color = colorOrder[i];

        if (redWasPockected && color.match(/^#ff0000$/g)) {
            color += "40";
        } else if (!redWasPockected && !color.match(/(^#ff0000$)|(40$)/g)) {
            color += "40";
        }

        fill(color);
        ellipse(
            window.innerWidth - 60 - (colorOrder.length - 1 - i) * 60,
            60,
            50
        );
    }
    pop();

    // mouse position
    drawMousePos();
}

function mousePressed() {
    // start deciding push force
    if (!pushing && positionLock) {
        pushing = true;
        pushStartPos = createVector(mouseX, mouseY);
        originalCuePos = cuePosition.copy();
    }

    // select color
    if (!selectedColor) {
        for (let i = 0; i < colorOrder.length; i++) {
            if (
                dist(
                    mouseX,
                    mouseY,
                    window.innerWidth - 60 - (colorOrder.length - 1 - i) * 60,
                    60
                ) <= 50
            ) {
                if (colorOrder[i].match(/40$/gm)) {
                    break;
                } else {
                    selectedColor = colorOrder[i];
                }
            }
        }
    }
}

function mouseDragged() {
    if (pushing && positionLock) {
        // reset cue position
        cuePosition = originalCuePos.copy();

        // calulate cue's moving and store cue position
        originalCuePos = cuePosition.copy();
        let pushEndPos = createVector(mouseX, mouseY);
        let moveLength = min(300, pushEndPos.sub(pushStartPos).mag());
        let moveDirection = createVector(
            cos(cueRotateDeg),
            sin(cueRotateDeg)
        ).mult(moveLength);

        cuePosition.sub(moveDirection);
    }
}

async function mouseReleased() {
    // end deciding push force
    if (pushing && positionLock) {
        let pushEndPos = createVector(mouseX, mouseY);
        let moveLength = min(300, pushEndPos.sub(pushStartPos).mag());

        pushForce = map(moveLength, 0, 300, 0, 10);

        // apply pushing animation
        console.log("Apply push animation");
        // cuePosition = originalCuePos.copy();
        let speed = createVector(
            originalCuePos.x - cuePosition.x,
            originalCuePos.y - cuePosition.y
        ).div(pushForce);
        await cueReposition(speed);
        // after animation apply velocity to cue's body
        let cueSensor = Bodies.rectangle(
            cuePosition.x,
            cuePosition.y,
            cueLength + ballSize / 2,
            cueDiameter,
            {
                isSensor: true,
                collisionFilter: {
                    category: SCENE,
                    mask: SCENE,
                },
            }
        );
        World.add(world, cueSensor);
        for (let i = 0; i < balls.length; i++) {
            // BUG(Casper): Cue sensor cannot detect balls
            console.log(Collision.collides(balls[i].info(), cueSensor));
        }

        Body.applyForce(cue, cue.position, {
            x: cos(cueRotateDeg) * pushForce * 0.1,
            y: sin(cueRotateDeg) * pushForce * 0.1,
        });
        console.log(`Apply velocity: ${pushForce}`);
        World.remove(world, cueSensor);

        // change state
        // pushing = false;
        // positionLock = false;
        // rotationLock = false;
        // cue.collisionFilter.category = PLAYER;
        // cue.collisionFilter.mask = PLAYER;
    }
}

function keyPressed() {
    if (keyCode == 32 && !pushing) {
        if (positionLock) {
            cue.collisionFilter.category = PLAYER;
            cue.collisionFilter.mask = PLAYER;
            rotationLock = false;
        } else {
            cue.collisionFilter.category = SCENE;
            cue.collisionFilter.mask = SCENE;
            rotationLock = true;
        }

        positionLock = !positionLock;
    }
}

function drawCornerBackground(position, deg) {
    let extendSize = pocketSize * 0.4;

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
        let basicPosY = (ballSize / 2) * i;
        for (let j = 0; j <= i; j++) {
            balls.push(
                new Ball(
                    createVector(
                        tableLength / 4 + ballSize * (i + 1),
                        basicPosY - ballSize * j
                    ),
                    "#ff0000"
                )
            );
        }
    }
}

function chooseColor(target) {}

async function cueReposition(direction) {
    return new Promise((resolve) => {
        const step = () => {
            if (cuePosition.copy().sub(originalCuePos).mag() <= 50) {
                resolve();
                cuePosition = originalCuePos.copy();
                return;
            }

            cuePosition.add(direction);
            setTimeout(step, 20);
        };

        step();
    });
}
