class Rule {
    // 1 for starting position, 2 for ramdom position(only red balls), 3 for random position(red balls and colors)
    static mode = 1;
    // stage 1: red and color ball in turn, stage 2: color order
    static stage = 1;
    static allRedPockected = false;
    static previousHitColor = null;
    static selectedColor = null;
    static colors = UI.colorOrder;
    static hitOrderCheck(ball) {       
        if (this.allRedPockected) {
            console.log("All red were pockected.");
        } else {
            if (ball.id === "#ff0000") {
                UI.addAndUpdateScore(1);
                selectedColor();
            } else if (
                this.previousHitColor === "#ff0000" &&
                ball.id == this.selectedColor
            ) {
                UI.addAndUpdateScore(ball.score);
            } else {
                console.log("Foul");
            }
        }

        this.previousHitColor = ball.id;
    }

    static selectColorBall() {
        if (!this.selectedColor) {
            for (let i = 0; i < this.colors.length; i++) {
                if (
                    dist(
                        mouseX,
                        mouseY,
                        window.innerWidth - UI.interval - (this.colors.length - 1 - i) * UI.interval,
                        UI.interval
                    ) <= UI.circleSize
                ) {
                    if (this.colors[i].match(/40$/gm)) {
                        break;
                    } else {
                        this.selectedColor =  this.colors[i];
                    }
                }
            }
        }
    }

    // Foul checks
    static hitColorCheck(ball){
        if (this.selectedColor == null) this.selectedColor = "#ff0000";
        // hit correct color
        if (ball && this.selectedColor == ball.id) return;
        this.hitOrPottedWrongBall();
    }

    // Foul response
    static failToHitCueBall() {
        UI.addAndUpdateScore(-4);
        console.log("Foul: Didn't hit cue ball.");
    }

    static pottedCueBall() {
        console.log("Foul: Cue ball in pocket.")
        UI.addAndUpdateScore(-4);
        console.log("Please select a place.");
    }

    static hitOrPottedWrongBall() {
        console.log("Foul: Hitted or Potted wrong color.");
        UI.addAndUpdateScore(-max(ball.score, 4));
    }

    static missTouching() {
        console.log("Foul: Touched ball during push.");
        UI.addAndUpdateScore(-4);
    }
}