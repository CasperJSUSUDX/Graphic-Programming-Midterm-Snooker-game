/**
 * Static class managing the game rule and logic
 * Manage state transitions, score calculation, and foul detection
 */
class Rule {
  // Game Modes: 1: Standard, 2: Random Reds, 3: Practice, 4: Crazy Pinball
  static mode = 1;

  // Game Stages:
  // 0: Break shot
  // 1: Red and Color alternation
  // 2: Clearing the Colors
  static stage = 0;

  // Flags
  static needSelectCueBallPos = true;
  static redWasPotted = false;
  static previousPotColor = null;
  static selectedColor = "#ff0000";

  /**
   * Iterate through all the balls and check the speed
   * @returns {Boolean} whether there are any ball's speed is larger then 0.01
   */
  static isAnyBallMoving() {
    for (const ball of Ball.balls) {
      if (ball.body.speed >= 0.01) {
        return true;
      }
    }

    return false;
  }

  static turnProcessing = false;
  static #firstHit = {
    id: "empty",
    score: 4,
  };

  /**
   * Called every frame while balls are moving
   * Log the first collision of the cue ball
   */
  static turnProcess() {
    if (this.#firstHit.id === "empty")
      this.#firstHit = Ball.cueBallCollisionCheck();
    Ball.ballCollisionWithWallCheck();

    // Settle the turn when all balls stop
    if (!this.isAnyBallMoving()) this.#turnEnd();
  }

  /**
   * Logic executed when the turn ends
   * Calculates score, checks fouls, and updates game stage
   */
  static #turnEnd() {
    var inOff = false; // cue ball potted
    var hitWrongBall = false;
    var pottedOutOfTarget = new Set();
    var foul = false;
    var maxSocre = 0;

    // Foul check
    if (scene.sinkedMap.has("#ffffff")) inOff = true;
    // Check first hit match target
    if (!["empty", this.selectedColor, "#ff0000"].includes(this.#firstHit.id))
      hitWrongBall = true;
    // Check what was potted
    scene.sinkedMap.forEach((value, key) => {
      if (![this.selectedColor, "#ff0000", "#ffffff"].includes(key)) {
        pottedOutOfTarget.add(value);
        maxSocre = max(maxSocre, value.score);
      }
    });

    // Determine sepecific foul type
    if (hitWrongBall || pottedOutOfTarget.size > 0) {
      this.hitOrPottedWrongBall(max(this.#firstHit.score, maxSocre));
      foul = true;
    } else if (inOff) {
      this.pottedCueBall();
      foul = true;
    } else if (this.#firstHit.id === "empty") {
      this.missHit();
      foul = true;
    }

    // State machine
    switch (this.stage) {
      // Break shot
      case 0:
        // Check whether any red ball hit cushion rails
        if (
          foul ||
          (!Ball.checkListWasDecreaseAndClear() &&
            !scene.sinkedMap.get("#ff0000"))
        ) {
          // Break failed
          // Restart game
          UI.resetScore();
          UI.pushProgressSpan("Restart", "#ff0000");
          this.needSelectCueBallPos = true;
          this.redWasPotted = false;
          this.previousPotColor = null;
          this.selectedColor = null;
          for (const ball of Ball.balls) ball.reposition();
          break;
        }

        // Process potted balls
        scene.sinkedMap.forEach((value, key) => {
          const index = Ball.balls.indexOf(value);
          this.previousPotColor = key;
          if (key === "#ff0000") this.redWasPotted = true;
          UI.addAndUpdateScore(value.score);
          World.remove(world, value.body);
          Ball.balls.splice(index, 1);
        });
        this.stage++;
        UI.changeStageSpan(this.stage);
        break;

      // Reds and Colors
      case 1:
        // Transistion to stage 2 if no red ball left
        if (
          !Ball.balls.find((ball) => ball.id === "#ff0000") &&
          this.redWasPotted
        ) {
          this.stage++;
          UI.changeStageSpan(this.stage);
        }

        scene.sinkedMap.forEach((value, key) => {
          if (foul) {
            if (key !== "#ff0000") {
              // color come back when foul
              value.reposition();
            }
          } else {
            const index = Ball.balls.indexOf(value);
            this.previousPotColor = key;
            if (key === "#ff0000") this.redWasPotted = true;
            else this.redWasPotted = false;
            UI.addAndUpdateScore(value.score);
            World.remove(world, value.body);
            Ball.balls.splice(index, 1);
            value.reposition();
          }
        });

        if (scene.sinkedMap.size === 0) {
          this.redWasPotted = false;
        }
        break;

      // Clearing the Colors
      case 2:
        scene.sinkedMap.forEach((value) => {
          if (foul) {
            value.reposition();
          } else {
            const index = Ball.balls.indexOf(value);
            this.previousPotColor = value.id;
            UI.addAndUpdateScore(value.score);
            World.remove(world, value.body);
            Ball.balls.splice(index, 1);
          }
        });

        // Only left cue ball
        if (Ball.balls.length == 1) {
          UI.pushProgressSpan("Game End", "#00ff00", 10000);
        }
        break;
    }

    // Clean and reset flags
    cue.unlock();
    scene.sinkedMap = new Map();
    this.selectedColor = null;
    UI.resetColorMap();
    UI.resetChargeBar();
    this.#firstHit = {
      id: "empty",
      score: 4,
    };
    this.turnProcessing = false;
  }

  // Foul response
  static failToHitCueBall(score = 0) {
    UI.addAndUpdateScore(-max(4, score));
    UI.pushProgressSpan("Foul: Didn't hit cue ball.", "#ff0000");
  }

  static pottedCueBall() {
    UI.pushProgressSpan("Foul: Cue ball in pocket.", "#ff0000");
    UI.addAndUpdateScore(-4);
    this.needSelectCueBallPos = true;
  }

  static hitOrPottedWrongBall(score) {
    UI.pushProgressSpan("Foul: Hitted or Potted wrong color.", "#ff0000");
    UI.addAndUpdateScore(-max(score, 4));
  }
  
  static missHit() {
    UI.pushProgressSpan(
      "Foul: Cue ball didn't hit any other balls.",
      "#ff0000"
    );
    UI.addAndUpdateScore(-4);
  }
}
