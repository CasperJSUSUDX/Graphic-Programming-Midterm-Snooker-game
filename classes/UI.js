class UI {
  static createUIContainer() {
    const UIcontainer = createDiv();
    UIcontainer.id("ui");
    UIcontainer.position(10, 10);
    UIcontainer.style("display", "flex");
    UIcontainer.style("flex-direction", "column");
  }

  static createMoveSensetiveSlider(cue) {
    const container = createDiv();
    container.id("ui-move");
    container.style("display", "flex");
    container.parent("ui");

    const moveSensetiveText = createSpan("Move sensetive: ");
    moveSensetiveText.class("ui-text");
    moveSensetiveText.parent("ui-move");

    const moveSlider = createSlider(0, 20, 10);
    moveSlider.size(200);
    moveSlider.parent("ui-move");

    const currentSensetiveText = createSpan(moveSlider.value());
    currentSensetiveText.class("ui-text");
    currentSensetiveText.parent("ui-move");

    moveSlider.changed(() => {
      currentSensetiveText.html(moveSlider.value());
      cue.adjustSpeed(moveSlider.value());
    });
  }

  static #score = 0;
  static createScoreText() {
    const scoreUI = createSpan(`Score: ${this.#score}`);
    scoreUI.id("score-text");
    scoreUI.class("ui-text");
    scoreUI.parent("ui");
  }
  static addAndUpdateScore(num) {
    this.#score += num;
    select("#score-text").html(`Score: ${this.#score}`);
  }
  static resetScore() {
    this.#score = 0;
    select("#score-text").html(`Score: ${this.#score}`);
  }

  static #updateList = [];
  static async createProgressText() {
    const container = createDiv();
    container.style("display", "flex");
    container.style("flex-direction", "column");
    container.style("position", "absolute");
    container.style("left", `${window.innerWidth / 2 - 200}px`);
    container.style("top", "0");

    const stageSpan = createSpan("Stage: 0 - Break shot");
    stageSpan.style("font-size", "4vh");
    stageSpan.class("ui-text");
    stageSpan.id("stage-text");
    stageSpan.parent(container);

    const messageSpan = createSpan("");
    messageSpan.id("ui-message");
    messageSpan.style("font-size", "3vh");
    messageSpan.class("ui-text");
    messageSpan.parent(container);

    // update message span each second
    const updateInterval = 100;
    setInterval(() => {
      if (this.#updateList[0]) {
        messageSpan.style("color", this.#updateList[0].color);
        messageSpan.html(this.#updateList[0].message);
        this.#updateList[0].time -= updateInterval;
        if (this.#updateList[0].time <= 0) {
          this.#updateList.splice(0, 1);
          messageSpan.html("");
          messageSpan.style("color", "#000000");
          messageSpan.class("ui-text");
        }
      }
    }, updateInterval);
  }
  static changeStageSpan(stage) {
    const span = select("#stage-text");
    switch (stage) {
      case 0:
        span.html("Stage: 0 - Break shot");
        break;
      case 1:
        span.html("Stage: 1 - Reds and Colors");
        break;
      case 2:
        span.html("Stage: 2 - Clearing the Colors");
        break;
      default:
        span.html("Stage: 0 - Break shot");
        break;
    }
  }
  static async pushProgressSpan(message, color = "#000000", time = 2000) {
    this.#updateList.push({
      message: message,
      color: color,
      time: time,
    });
  }

  static interval = 60;
  static circleSize = 50;
  static colorMap = new Map([
    ["#ff0000", true],
    ["#ffff00", false],
    ["#00ff00", false],
    ["#784315", false],
    ["#0000ff", false],
    ["#EF88BE", false],
    ["#000000", false],
  ]);

  static drawSelectBallArea() {
    push();
    var index = 1;
    this.colorMap.forEach((value, key) => {
      var hexColor = key;
      if (!value) hexColor += "40";

      fill(hexColor);
      ellipse(
        window.innerWidth - (this.colorMap.size + 1 - index) * this.interval,
        this.interval,
        this.circleSize
      );
      index++;
    });
    pop();
  }
  static resetColorMap() {
    switch (Rule.stage) {
      case 2:
        if (Ball.balls.length >= 2) {
          this.colorMap.forEach((_, key) => {
            if (key !== Ball.balls[1].id) {
              this.colorMap.set(key, false);
            } else {
              this.colorMap.set(key, true);
              Rule.selectedColor = Ball.balls[1].id;
            }
          });
        }

        break;
      default:
        this.colorMap.forEach((_, key) => {
          if (!Rule.redWasPotted) {
            if (key === "#ff0000") this.colorMap.set(key, true);
            else this.colorMap.set(key, false);
          } else {
            if (key === "#ff0000") this.colorMap.set(key, false);
            else this.colorMap.set(key, true);
          }
        });
        break;
    }
  }

  static #maxWidth = window.innerWidth / 75;
  static #minWidth = window.innerWidth / 125;
  static #height = window.innerHeight / 3;
  static #interval = 9;
  static #barHeight = this.#height / 2;
  static drawChargeBar() {
    push();
    translate(this.#maxWidth + this.#minWidth, window.innerHeight / 2);
    // edges
    stroke(0);
    fill(100);
    beginShape();
    vertex(-this.#maxWidth / 2, -this.#height / 2);
    vertex(this.#maxWidth / 2, -this.#height / 2);
    vertex(this.#minWidth / 2, this.#height / 2);
    vertex(-this.#minWidth / 2, this.#height / 2);
    endShape();
    // bar
    const l = map(
      this.#barHeight,
      -this.#height / 2,
      this.#height / 2,
      this.#maxWidth / 2,
      this.#minWidth / 2
    );
    const colorR = map(
      this.#barHeight,
      this.#height / 2,
      -this.#height / 2,
      0,
      255
    );
    const colorG = map(
      this.#barHeight,
      this.#height / 2,
      -this.#height / 2,
      255,
      0
    );
    noStroke();
    fill(colorR, colorG, 0);
    beginShape();
    vertex(-l, this.#barHeight);
    vertex(l, this.#barHeight);
    vertex(this.#minWidth / 2, this.#height / 2);
    vertex(-this.#minWidth / 2, this.#height / 2);
    endShape();
    // lines
    stroke(0);
    fill(0);
    for (let i = 0; i < this.#interval; i++) {
      const h = -this.#height / 2 + (i * this.#height) / this.#interval;
      const l = map(
        h,
        -this.#height / 2,
        this.#height / 2,
        this.#maxWidth / 2,
        this.#minWidth / 2
      );
      line(-l, h, l, h);
    }
    pop();
  }
  static convertForceToChargeBarHeight(currentForce, minForce, maxForce) {
    this.#barHeight = map(
      currentForce,
      minForce,
      maxForce,
      this.#height / 2,
      -this.#height / 2
    );
  }
  static resetChargeBar() {
    this.#barHeight = this.#height / 2;
  }
}
