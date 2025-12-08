class Rule {
    // 1 for starting position, 2 for ramdom position(only red balls), 3 for random position(red balls and colors)
    static mode = 1;
    // stage 0: break shoot, stage 1: red and color ball in turn, stage 2: color order
    static stage = 0;
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

    static selectPosInDZone(cueBall) {
        const vector = {
            x: 0,
            y: 0
        }
        const rightLimit = window.innerWidth / 2 - tableLength * 0.3;
        const leftLimit = window.innerWidth / 2 - tableLength * 0.3 - tableWidth / 6;
        vector.x = -tableLength * 0.35;
        if (mouseX >= rightLimit) {
            vector.x = rightLimit;
        } else if (mouseX <= leftLimit) {
            vector.x = leftLimit;
        } else {
            vector.x = mouseX;
        }

        const l_square = (tableWidth / 6) ** 2 - (rightLimit - vector.x) ** 2;
        var l;
        if (l_square <= 0.001) l = tableWidth / 6;
        else l = Math.sqrt((tableWidth / 6) ** 2 - (rightLimit - vector.x) ** 2);
        const topLimit = window.innerHeight / 2 - l;
        const bottomLimit = window.innerHeight / 2 + l;
        vector.y = 0;
        if (mouseY <= topLimit) {
            vector.y = topLimit;
        } else if (mouseY >= bottomLimit) {
            vector.y = bottomLimit;
        } else {
            vector.y = mouseY;
        }

        var decline = false;
        Body.set(cueBall.body, "isSensor", true);
        Body.setPosition(cueBall.body, vector);
        for (let i = 1; i < balls.length; i++) {
            if (Collision.collides(cueBall.body, balls[i].body)) {
                UI.updateProgressSpan("Cannot put cue ball at there.");
                cueBall.reposition();
                decline = true;
                break;
            }
        }
        Body.set(cueBall.body, "isSensor", false);
        if (!decline) {
            this.stage++;
        }
    }

    // Foul checks
    static firstCollisionColor(ball){
        if (this.selectedColor == null) this.selectedColor = "#ff0000";
        // hit correct color
        if (ball && this.selectedColor == ball.id) return;
        this.hitOrPottedWrongBall(ball);
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
    static hitOrPottedWrongBall(ball) {
        console.log("Foul: Hitted or Potted wrong color.");
        UI.addAndUpdateScore(-max(ball.score, 4));
    }
    static missTouching() {
        console.log("Foul: Touched ball during push.");
        UI.addAndUpdateScore(-4);
    }
}