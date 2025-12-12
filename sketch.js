const SCENE = 0b0001;
const PLAYER = 0b0010;
const tableLength = window.innerWidth * 0.6;
const tableWidth = tableLength / 2;
const ballSize = tableWidth / 36;
var scene;
var cue;
var debugMode = true;

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    frameRate(60);
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
    
    // bodies initial
    scene = new Scene(
        tableLength,
        tableWidth,
        ballSize,
        ballSize*1.5,
        "#2A6137",
        "#784315"
    );
    cue = new Cue(
            createVector(0, -tableWidth / 4),
            (tableWidth * 5) / 6,
            tableWidth * 0.014,
            "#563112",
            10,
            tableLength / 307.65,
            ballSize / 2
        );

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
    UI.createProgressText();
}

function draw() {
    // update physic engine
    Engine.update(engine, 1000 / 60);

    background(255);

    scene.draw();

    for (let i = 0; i < Ball.balls.length; i++) {
        Ball.balls[i].draw();
    }

    cue.draw();
    cue.move();
    cue.rotate();

    scene.sinkCheck();

    UI.drawSelectBallArea(Rule.allRedPockected);

    if (Rule.turnProcessing) Rule.turnProcess();

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
        if (Rule.stage === 0 && !Rule.selectedCueBallInitPos) {
            Rule.selectedCueBallInitPos = Ball.selectPosInDZone(Ball.balls[0]);
        } else {
            cue.switchMode();
        }
    }
}

function layoutOfSnookerBalls() {
    // cue ball
    Ball.balls.push(new Ball({ x: -tableLength * 0.35, y: 0 }, "#ffffff"));
    // yellow ball
    Ball.balls.push(
        new Ball({ x: -tableLength * 0.3, y: tableWidth / 6 }, "#ffff00", 2)
    );
    // browen ball
    Ball.balls.push(new Ball({ x: -tableLength * 0.3, y: 0 }, "#784315", 4));
    // green ball
    Ball.balls.push(
        new Ball({ x: -tableLength * 0.3, y: -tableWidth / 6 }, "#00ff00", 3)
    );
    // blue ball
    Ball.balls.push(new Ball({ x: 0, y: 0 }, "#0000ff", 5));
    // pink
    Ball.balls.push(new Ball({ x: tableLength / 4, y: 0 }, "#EF88BE", 6));
    // black ball
    Ball.balls.push(new Ball({ x: (tableLength * 9) / 22, y: 0 }, "#000000", 7));
    // red balls
    for (let i = 0; i < 5; i++) {
        var basicPosY = (ballSize / 2) * i;
        for (let j = 0; j <= i; j++) {
            Ball.balls.push(
                new Ball(
                    { x: tableLength / 4 + ballSize * (i + 1), y: basicPosY - ballSize * j },
                    "#ff0000"
                )
            );
        }
    }
}

function chooseColor(target) {}