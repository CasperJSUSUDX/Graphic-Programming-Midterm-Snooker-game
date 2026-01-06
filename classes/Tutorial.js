/**
 * Class handle the interactive tutorial overlay.
 * Steps through instructions for movement, aiming, and game rules.
 */
class Tutorial {
  constructor() {
    this.active = true;
    this.step = 0;
    this.steps = [
      {
        title: "Welcome",
        text: "Welcome to Snooker demo! This short interactive tutorial will show controls and game concepts. Click Next to continue.",
        overlay: () => {},
      },
      {
        title: "Move the Cue",
        text: "Use WASD to move the cue (when positioned). Try pressing and holding W/A/S/D to move the cue.",
        overlay: () => {
          const position = cue.position;
          push();
          stroke(255, 255, 0);
          strokeWeight(3);
          noFill();
          ellipse(position.x, position.y, 140);
          noStroke();
          fill(255, 255, 0, 150);
          textAlign(CENTER, CENTER);
          text("W/A/S/D", position.x, position.y - 90);
          pop();
        },
      },
      {
        title: "Aim with Mouse",
        text: "Move your mouse to aim. The cue rotates towards the mouse.",
        overlay: () => {
          if (typeof cue !== "undefined") {
            const position = cue.position;
            push();
            stroke(0, 255, 255);
            strokeWeight(3);
            line(position.x, position.y, mouseX, mouseY);
            noStroke();
            fill(0, 255, 255, 170);
            textAlign(LEFT, TOP);
            text("Move mouse to aim", mouseX + 10, mouseY + 10);
            pop();
          }
        },
      },
      {
        title: "Charge & Shoot",
        text: "Click & drag to charge, then release to shoot. The charge bar (right) shows force.",
        overlay: () => {
          const x = window.innerWidth / 75 + window.innerWidth / 125;
          const y = window.innerHeight / 2;
          const height = window.innerHeight / 3;
          push();
          noFill();
          stroke(255, 200, 0);
          strokeWeight(3);
          rect(x, y, 40, height);
          noStroke();
          fill(255, 200, 0, 180);
          textAlign(CENTER, CENTER);
          text("Charge", x, y - height / 2 - 20);
          pop();
        },
      },
      {
        title: "Select Target Color",
        text: "Click a color at the top-right to select it (applies in later stages).",
        overlay: () => {
          const interval = UI.interval;
          const circleSize = UI.circleSize;
          var index = 1;
          UI.colorMap.forEach((value, key) => {
            const x =
              window.innerWidth - (UI.colorMap.size + 1 - index) * interval;
            const y = interval;
            push();
            noFill();
            stroke(255, 0, 0);
            strokeWeight(3);
            ellipse(x, y, circleSize + 6);
            index++;
            pop();
          });
        },
      },
      {
        title: "D Zone Placement",
        text: "Click space to place cue ball at the mouse's position.\nIf outside the D-zone, game will put the nearest position in the D-zone",
        overlay: () => {
          // draw the D semicircle and a ghost cue ball
          const cx = window.innerWidth / 2 - tableLength * 0.3;
          const cy = window.innerHeight / 2;
          const r = tableWidth / 6;
          push();
          // outline
          noFill();
          stroke(255, 220, 0);
          strokeWeight(3);
          arc(cx, cy, r * 2, r * 2, PI / 2, (PI * 3) / 2);
          line(cx, cy - r, cx, cy + r);

          // translucent fill to highlight the D
          noStroke();
          fill(255, 220, 0, 60);
          arc(cx, cy, r * 2, r * 2, PI / 2, PI * 3 / 2);

          // a ghost cue ball to indicate placement
          fill(255, 255, 255, 220);
          noStroke();
          ellipse(cx - r * 0.3, cy, ballSize);

          // label
          fill(255, 220, 0);
          textAlign(CENTER, BOTTOM);
          text("D Zone — place cue ball here", cx, cy - r - 10);
          pop();
        },
      },
      {
        title: "End",
        text: "That's it — good luck! Press T anytime to toggle this tutorial.",
        overlay: () => {},
      },
    ];

    // simple UI button positions (screen coords)
    this.buttonWidth = 120;
    this.buttonHeight = 40;
  }

  start() {
    this.active = true;
    this.step = 0;
    const ui = select("#ui");
    if (ui) ui.addClass("dimmed");
    const prog = select("#ui-progress");
    if (prog) prog.addClass("dimmed");
  }

  end() {
    this.active = false;
    const ui = select("#ui");
    if (ui) ui.removeClass("dimmed");
    const prog = select("#ui-progress");
    if (prog) prog.removeClass("dimmed");
  }

  next() {
    if (this.step < this.steps.length - 1) this.step++;
    else this.end();
  }

  prev() {
    if (this.step > 0) this.step--;
  }

  drawPanel() {
    // dark overlay
    push();
    rectMode(CORNER);

    fill(0, 150);
    rect(0, 0, window.innerWidth, window.innerHeight);

    const w = min(700, window.innerWidth - 120);
    const h = 180;
    const x = window.innerWidth / 2 - w / 2;
    const y = window.innerHeight - h - 20;
    const leftPad = 24;
    const topPad = 18;
    const gap = 20;

    noStroke();
    fill(255);
    rect(x, y, w, h, 8);

    // title
    const titleX = x + leftPad;
    const titleY = y + topPad;
    fill(0);
    textAlign(LEFT, TOP);
    textSize(22);
    textStyle(BOLD);
    text(this.steps[this.step].title, titleX, titleY);

    // text
    const titleHeight = textAscent();
    const textX = x + leftPad;
    const textY = titleY + titleHeight + gap;
    const textW = w - 160;
    const textH = h - 40;
    textSize(16);
    textStyle(NORMAL);
    textAlign(LEFT, TOP);
    text(this.steps[this.step].text, textX, textY, textW, textH);

    rectMode(CENTER);
    // buttons: Prev, Next, Skip
    const by = y + h / 2 + 10;
    const bxNext = x + w - this.buttonWidth - 20;
    const bxPrev = bxNext - this.buttonWidth - 10;
    const bxSkip = x + 20;

    // Prev
    fill(230);
    rect(
      bxPrev + this.buttonWidth / 2,
      by + this.buttonHeight / 2,
      this.buttonWidth,
      this.buttonHeight,
      6
    );
    fill(0);
    textAlign(CENTER, CENTER);
    text("Prev", bxPrev + this.buttonWidth / 2, by + this.buttonHeight / 2);

    // Next
    fill(50, 150, 255);
    rect(
      bxNext + this.buttonWidth / 2,
      by + this.buttonHeight / 2,
      this.buttonWidth,
      this.buttonHeight,
      6
    );
    fill(255);
    text("Next", bxNext + this.buttonWidth / 2, by + this.buttonHeight / 2);

    // Skip
    fill(200);
    rect(
      bxSkip + this.buttonWidth / 2,
      by + this.buttonHeight / 2,
      this.buttonWidth,
      this.buttonHeight,
      6
    );
    fill(0);
    text("Skip", bxSkip + this.buttonWidth / 2, by + this.buttonHeight / 2);

    pop();

    push();
    this.steps[this.step].overlay();
    pop();
  }

  draw() {
    if (!this.active) return;
    push();
    textFont("Arial");
    textSize(14);
    textAlign(LEFT, TOP);
    this.drawPanel();
    pop();
  }

  mousePressed() {
    if (!this.active) return false;

    // detect buttons
    const w = min(700, window.innerWidth - 120);
    const h = 180;
    const x = window.innerWidth / 2 - w / 2;
    const y = window.innerHeight - h - 20;
    const by = y + h / 2 + 10;
    const bxNext = x + w - this.buttonWidth - 20;
    const bxPrev = bxNext - this.buttonWidth - 10;
    const bxSkip = x + 20;

    function inside(mx, my, bx, by, bw, bh) {
      return mx >= bx && mx <= bx + bw && my >= by && my <= by + bh;
    }

    if (
      inside(mouseX, mouseY, bxNext, by, this.buttonWidth, this.buttonHeight)
    ) {
      this.next();
      return true;
    }
    if (
      inside(mouseX, mouseY, bxPrev, by, this.buttonWidth, this.buttonHeight)
    ) {
      this.prev();
      return true;
    }
    if (
      inside(mouseX, mouseY, bxSkip, by, this.buttonWidth, this.buttonHeight)
    ) {
      this.end();
      return true;
    }

    return true;
  }
}
