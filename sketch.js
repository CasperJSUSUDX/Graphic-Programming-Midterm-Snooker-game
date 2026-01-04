const SCENE = 0b0001;
const tableLength = window.innerWidth * 0.6;
const tableWidth = tableLength / 2;
const ballSize = tableWidth / 36;
const {
  Engine,
  Body,
  Bodies,
  World,
  Composite,
  Runner,
  Collision,
  Events,
  Vector,
} = Matter;

var engine;
var world;
var scene;
var cue;
var tutorial;
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

  Ball.initBalls();
  // Ball.initBalls("debug");

  // bodies initial
  scene = new Scene(
    tableLength,
    tableWidth,
    ballSize,
    ballSize * 1.5,
    "#2A6137",
    "#784315"
  );
  cue = new Cue(
    { x: 0, y: -tableWidth / 4 },
    (tableWidth * 5) / 6,
    tableWidth * 0.014,
    "#563112",
    10,
    tableLength / 307.65,
    ballSize / 2
  );

  // translate the world to the center of user window
  Composite.translate(world, {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  UI.createUIContainer();
  UI.createMoveSensetiveSlider(cue);
  UI.createScoreText();
  UI.createProgressText();

  // tutorial
  tutorial = new Tutorial();
  tutorial.start();
}

function draw() {
  // update physic engine
  Engine.update(engine, 1000 / 60);

  background(255);

  scene.draw();
  Scene.drawBumper();

  Particle.drawEffects();

  for (const ball of Ball.balls) {
    ball.draw();
  }

  cue.draw();
  cue.move();
  cue.rotate();

  scene.sinkCheck();

  UI.drawSelectBallArea(Rule.redWasPotted);
  UI.drawChargeBar();

  if (Rule.turnProcessing) Rule.turnProcess();

  if (debugMode) {
    drawMousePos();
    cue.drawHitArea();
  }

  // tutorial draw
  tutorial.draw();
}

function mousePressed() {
  if (tutorial.active) {
    if (tutorial.mousePressed()) return;
  }

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
  if (tutorial.active) return;
  if (!Rule.turnProcessing) {
    cue.pushEnd();
  }
}

function keyPressed() {
  // 1
  if (keyCode === 49) {
    if (!tutorial.active) {
      UI.pushProgressSpan("Switch to mode 1");
      mode = 1;
      Scene.removeBumpers();
      Ball.resetBalls();
    }
  }
  // 2
  if (keyCode === 50) {
    if (!tutorial.active) {
      UI.pushProgressSpan("Switch to mode 2");
      mode = 2;
      Scene.removeBumpers();
      Ball.resetBalls();
    }
  }
  // 3
  if (keyCode === 51) {
    if (!tutorial.active) {
      UI.pushProgressSpan("Switch to mode 3");
      mode = 3;
      Scene.removeBumpers();
      Ball.resetBalls();
    }
  }
  // 4
  if (keyCode === 52) {
    if (!tutorial.active) {
      UI.pushProgressSpan("Switch to mode 4");
      mode = 4;
      Scene.removeBumpers();
      Ball.resetBalls();
    }
  }

  // space
  if (keyCode === 32) {
    if (!tutorial.active) {
      if (Rule.needSelectCueBallPos)
        Rule.needSelectCueBallPos = !Ball.selectPosInDZone(Ball.balls[0]);
      else if (Rule.redWasPotted && Rule.selectedColor === null)
        UI.pushProgressSpan("Please select target color", "#ff0000");
      else cue.switchMode();
      cue.interruptPush();
    }
  }

  // t
  if (keyCode === 84) {
    if (tutorial.active) tutorial.end();
    else tutorial.start();
  }

  // left arrow
  if (keyCode === 37) {
    if (tutorial.active) tutorial.prev();
  }

  // right arrow
  if (keyCode === 39) {
    if (tutorial.active) tutorial.next();
  }
}
