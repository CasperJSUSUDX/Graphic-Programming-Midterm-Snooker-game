/**
 * Application Design and Interaction:
 * The core design philosophy behind my snooker game was simulating realistic physics and providing precise user control.
 * I implemented a hybrid input system using both keyboard and mouse to interact with the game.
 * The WASD keys control the physical position of the cue stick. The Mouse is dedicated to the aiming and the shooting power.
 * This separation simulates the real-world behavior that player can move and aim at the same time.
 * To execute a shot, the user presses space to lock the movement then clicks and drags to pull back the cue, visualizing the power via a dynamic Charge Bar on the left side of the game.
 * Furthermore, I implemented the real snooker rule inside my game.
 * So, each turn player can choose the target color at the top-right.
 * And at the start of the game, player needs to select the starting position inside D-zone using mouse and space.
 * Technical Implementation:
 * The project follows Object-Oriented Programming principles.
 * I separated the logic into different classes, and each class processed relevant logic. 
 * or example, “Ball” has a constructor to create multiple balls, and it also includes several static functions to deal with logic which related to a group of balls.
 * The other example is “Rule”. In this class, it provides a series of foul responses.
 * Hence, no matter how other functions call the foul, they do not need to care about the detail.
 * And every time I want to change the processing method, I do not need to change the thing multiple times and prevent human error.
 * Visualization:
 * Cue ball has a comet effect that generates fading particles behind moving balls to visualize velocity.
 * Cue impacts some spark effect when hitting a ball.
 * When a ball is potted, the physical body is removed, and a sink particle effect is triggered to animate the ball shrinking and fading into the pocket.
 * Extension Crazy Pinball Mode:
 * For the extension, I developed a Crazy Pinball mode (Mode 4).
 * In this mode, the table is added high-restitution Bumpers randomly generated in the center of the play area.
 * This extension transforms the strategic landscape of Snooker.
 * The bumpers have a restitution value of 2.0, causing balls to accelerate upon impact rather than lose energy.
 * This mode will create a chaotic environment and looks like a pinball game where players must calculate complex rebounds to avoid or use those obstacles.
 * Implementing this required dynamic modification of the “Composite” world to add and remove static bodies seamlessly when switching modes.
 * I also included an interactive Tutorial mode to guide new player through these controls.
 */

// Bitmask for collision filter
const SCENE = 0b0001;

// Table dimensions based on window size
const tableLength = window.innerWidth * 0.6;
const tableWidth = tableLength / 2;
const ballSize = tableWidth / 36;

// Matter,js modules
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

// Global variables
var engine;
var world;
var scene;
var cue;
var tutorial;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  frameRate(60);
  background(255);
  rectMode(CENTER);

  // Initialize Matter.js engine
  engine = Engine.create({
    enableCCD: true,
    positionIterations: 20,
    velocityIterations: 12,
  });
  world = engine.world;
  // Disable gravity
  engine.gravity.y = 0;

  // Initialize Game object
  // create balls
  Ball.initBalls();

  // Create table
  scene = new Scene(
    tableLength,
    tableWidth,
    ballSize,
    ballSize * 1.5,
    "#2A6137",
    "#784315"
  );

  // Create cue
  cue = new Cue(
    { x: 0, y: -tableWidth / 4 },
    (tableWidth * 5) / 6,
    tableWidth * 0.014,
    "#563112",
    10,
    tableLength / 307.65,
    ballSize / 2
  );

  // Center the physics world to center of table(render)
  Composite.translate(world, {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  // Initialize UI
  UI.createUIContainer();
  UI.createMoveSensetiveSlider(cue);
  UI.createScoreText();
  UI.createProgressText();

  // Initialize UI
  tutorial = new Tutorial();
  tutorial.start();
}

function draw() {
  // Update physic engine
  Engine.update(engine, 1000 / 60);

  background(255);

  // Render static elements
  scene.draw();
  Scene.drawBumper();

  // Render visual effect
  Particle.drawEffects();

  // Render Dynamic elements
  for (const ball of Ball.balls) {
    ball.draw();
  }

  cue.draw();
  cue.move();
  cue.rotate();

  // Scene logic check
  scene.sinkCheck();

  // UI overlay
  UI.drawSelectBallArea(Rule.redWasPotted);
  UI.drawChargeBar();

  // Rule process
  if (Rule.turnProcessing) Rule.turnProcess();

  // Tutorial overlay
  tutorial.draw();
}

function mousePressed() {
  if (tutorial.active) {
    // If in tutorial mode, not process other logic
    if (tutorial.mousePressed()) return;
  }

  if (!Rule.turnProcessing) {
    cue.pushStart();
    UI.selectColorBall();
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
  /**
   * Helper function: Swtich to a mode
   * @param {Number} newMode - Change mode number
   */
  function switchMode(newMode) {
    if (!tutorial.active) {
      UI.pushProgressSpan(`Switch to mode ${newMode}`);
      mode = newMode;
      Scene.removeBumpers();
      Ball.resetBalls();
    }
  }

  // 1-4
  if (keyCode === 49) switchMode(1); // Standard
  if (keyCode === 50) switchMode(2); // Random Reds
  if (keyCode === 51) switchMode(3); // Practice Cross
  if (keyCode === 52) switchMode(4); // Crazy Pinball

  // space
  if (keyCode === 32) {
    if (!tutorial.active) {
      // Placing Cue Ball (D-Zone)
      if (Rule.needSelectCueBallPos)
        Rule.needSelectCueBallPos = !Ball.selectPosInDZone(Ball.balls[0]);
      // Must select color first (Rule enforcement)
      else if (Rule.redWasPotted && Rule.selectedColor === null)
        UI.pushProgressSpan("Please select target color", "#ff0000");
      // Lock/Unlock Cue movement
      else cue.switchMode();

      // Reset cue if pressed during push
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
