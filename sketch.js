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

    // Ball.initBalls();
    Ball.initBalls("debug");
    
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

    UI.drawSelectBallArea(Rule.redWasPotted);

    if (Rule.turnProcessing) Rule.turnProcess();

    if (debugMode) {
        drawMousePos();
        cue.drawHitArea();
    }
}

function mousePressed() {
    if (!Rule.turnProcessing) {
        cue.pushStart();
        Rule.selectColorBall();
    }
        
}

function mouseDragged() {
    if (!Rule.turnProcessing) {
        cue.pushProcess();
    }
}

async function mouseReleased() {
    if (!Rule.turnProcessing) {
        cue.pushEnd();
    }
}

function keyPressed() {
    if (keyCode == 32) {
        switch (Rule.stage) {
            case 0:
                if (!Rule.selectedCueBallInitPos) Rule.selectedCueBallInitPos = Ball.selectPosInDZone(Ball.balls[0]);
                break;
            case 1:
                if (Rule.redWasPotted && Rule.selectedColor === null) UI.updateProgressSpan("Please select target color");
                else cue.switchMode();
                break;
            case 2:
                cue.switchMode();
                break;
        }
    }
}