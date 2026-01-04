class Rule {
  // 1 for starting position, 2 for ramdom position(only red balls), 3 for random position(red balls and colors)
  static mode = 1;
  // stage 0: break shoot, stage 1: red and color ball in turn, stage 2: color order
  static stage = 0;
  static needSelectCueBallPos = true;
  static redWasPotted = false;
  static previousPotColor = null;
  static selectedColor = "#ff0000";

  static selectColorBall() {
    if (!this.selectedColor) {
      var selected = false;
      var index = 1;
      for (const [key, _] of UI.colorMap.entries()) {
        const x =
          window.innerWidth - (UI.colorMap.size + 1 - index) * UI.interval;
        const y = UI.interval;
        if (dist(mouseX, mouseY, x, y) <= UI.circleSize / 2) {
          this.selectedColor = key;
          selected = true;
          break;
        }
        index++;
      }

      if (selected) {
        UI.colorMap.forEach((_, key) => {
          if (key === this.selectedColor) UI.colorMap.set(key, true);
          else UI.colorMap.set(key, false);
        });
      }
    }
  }

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
   * The checking functions when there is a ball hit by the cue
   */
  static turnProcess() {
    if (this.#firstHit.id === "empty")
      this.#firstHit = Ball.cueBallCollisionCheck();
    Ball.ballCollisionWithWallCheck();
    if (!this.isAnyBallMoving()) this.#turnEnd();
  }
  /**
   * A helper function of turnProcess
   * Handling the check things after all the ball is stop(speed < 0.01)
   */
  static #turnEnd() {
    var inOff = false;
    var hitWrongBall = false;
    var pottedOutOfTarget = new Set();
    var foul = false;
    var maxSocre = 0;
    // foul check
    if (scene.sinkedMap.has("#ffffff")) inOff = true;
    if (!["empty", this.selectedColor, "#ff0000"].includes(this.#firstHit.id))
      hitWrongBall = true;
    scene.sinkedMap.forEach((value, key) => {
      if (![this.selectedColor, "#ff0000", "#ffffff"].includes(key)) {
        pottedOutOfTarget.add(value);
        maxSocre = max(maxSocre, value.score);
      }
    });

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

    switch (this.stage) {
      case 0:
        if (
          foul ||
          (!Ball.checkListWasDecreaseAndClear() &&
            !scene.sinkedMap.get("#ff0000"))
        ) {
          // reset the entire table
          UI.resetScore();
          UI.pushProgressSpan("Restart", "#ff0000");
          this.needSelectCueBallPos = true;
          this.redWasPotted = false;
          this.previousPotColor = null;
          this.selectedColor = null;
          for (const ball of Ball.balls) ball.reposition();
          break;
        }

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
      case 1:
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
          }
        });

        if (scene.sinkedMap.size === 0) {
          this.redWasPotted = false;
        }
        break;
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

        if (Ball.balls.length == 1) {
          UI.pushProgressSpan("Game End", "#00ff00", 10000);
        }
        break;
    }

    // Unlock the cue and reset the state
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
