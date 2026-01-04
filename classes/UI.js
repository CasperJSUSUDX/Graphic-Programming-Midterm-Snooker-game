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
    container.class("ui-panel small");
    container.parent("ui");

    const moveLabel = createSpan("Move sensitive");
    moveLabel.class("ui-text");
    moveLabel.parent(container);

    const moveSlider = createSlider(0, 20, 10);
    moveSlider.class("ui-slider");
    moveSlider.size(160);
    moveSlider.parent(container);

    const currentSensetiveText = createSpan(moveSlider.value());
    currentSensetiveText.class("ui-slider-val");
    currentSensetiveText.parent(container);

    moveSlider.input(() => {
      currentSensetiveText.html(moveSlider.value());
      cue.adjustSpeed(moveSlider.value());
    });
  }

  static #score = 0;
  static createScoreText() {
    const container = createDiv();
    container.id("ui-score");
    container.class("ui-panel small");
    container.parent("ui");

    const label = createSpan("Score");
    label.class("score-label");
    label.parent(container);

    const value = createSpan(`${this.#score}`);
    value.id("score-value");
    value.class("score-value");
    value.parent(container);
  }
  static addAndUpdateScore(num) {
    this.#score += num;
    const el = select("#score-value");
    if (el) el.html(`${this.#score}`);
  }
  static resetScore() {
    this.#score = 0;
    const el = select("#score-value");
    if (el) el.html(`${this.#score}`);
  }

  static #updateList = [];
  static async createProgressText() {
    const container = createDiv();
    container.id("ui-progress");
    container.style("display", "flex");
    container.style("flex-direction", "column");
    container.style("position", "absolute");
    container.style("left", `${window.innerWidth / 2 - 200}px`);
    container.style("top", "0");

    // Stage display as a panel
    const stagePanel = createDiv();
    stagePanel.class("ui-panel");
    stagePanel.parent(container);

    const stageSpan = createSpan("Stage: 0 - Break shot");
    stageSpan.style("font-size", "3vh");
    stageSpan.class("ui-text");
    stageSpan.id("stage-text");
    stageSpan.parent(stagePanel);

    // Message panel below stage (small)
    const messagePanel = createDiv();
    messagePanel.class("ui-panel small");
    messagePanel.parent(container);
    // hide when there's no message
    messagePanel.style("display", "none");

    const messageSpan = createSpan("");
    messageSpan.id("ui-message");
    messageSpan.style("font-size", "2.2vh");
    messageSpan.class("ui-text");
    messageSpan.parent(messagePanel);

    // update message span regularly
    const updateInterval = 100;
    setInterval(() => {
      if (this.#updateList[0]) {
        // ensure panel is visible when there's a message
        messagePanel.style("display", "inline-flex");
        messageSpan.style("color", this.#updateList[0].color);
        messageSpan.html(this.#updateList[0].message);
        this.#updateList[0].time -= updateInterval;
        if (this.#updateList[0].time <= 0) {
          this.#updateList.splice(0, 1);
          // if no more messages, hide panel
          if (!this.#updateList[0]) {
            messageSpan.html("");
            messageSpan.style("color", "#000000");
            messageSpan.class("ui-text");
            messagePanel.style("display", "none");
          }
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
  static selectColorBall() {
    if (!Rule.selectedColor) {
      var selected = false;
      var index = 1;
      for (const [key, _] of UI.colorMap.entries()) {
        const x =
          window.innerWidth - (UI.colorMap.size + 1 - index) * UI.interval;
        const y = UI.interval;
        if (dist(mouseX, mouseY, x, y) <= UI.circleSize / 2) {
          Rule.selectedColor = key;
          selected = true;
          break;
        }
        index++;
      }

      if (selected) {
        UI.colorMap.forEach((_, key) => {
          if (key === Rule.selectedColor) UI.colorMap.set(key, true);
          else UI.colorMap.set(key, false);
        });
      }
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
