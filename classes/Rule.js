class Rule {
    // 1 for starting position, 2 for ramdom position(only red balls), 3 for random position(red balls and colors)
    static mode = 1;
    // stage 0: break shoot, stage 1: red and color ball in turn, stage 2: color order
    static stage = 0;
    static selectedCueBallInitPos = false;
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
    static isAnyBallMoving() {
        for (const ball of Ball.balls) {
            if (ball.body.speed >= 0.01) {
                return true;
            }
        }

        return false;
    }
    static turnEndCheck(firstHit) {
        var inOff = false;
        var hitWrongBall = new Map([["state", false], ["ball", null]]);
        var pottedOutOfTarget = new Set();
        var maxSocre = 0;
        // TODO: Consider fail to hit cue ball
        if (scene.sinkedMap.has("#ffffff")) inOff = true;
        if (firstHit.id !== (this.selectedColor || "#ff0000")) {
            hitWrongBall.set("state", true);
            hitWrongBall.set("ball", firstHit);
        }
        scene.sinkedMap.forEach((key, value, map) => {
            if (key !== this.selectedColor) {
                pottedOutOfTarget.add(value);
                maxSocre = max(maxSocre, value.score);
            }
        });

        if (hitWrongBall.get("state") && pottedOutOfTarget.size > 0) {
            this.hitOrPottedWrongBall(max(hitWrongBall.get("ball").score, maxSocre));
        } else if (inOff) {
            this.pottedCueBall()
        }
        /*
        UI.addAndUpdateScore(ball.score);
        World.remove(world, ball.body);
        Ball.balls.splice(Ball.balls.indexOf(ball), 1);
        */
        switch (this.stage) {
            case 0:
                if (inOff || hitWrongBall.get("state") || pottedOutOfTarget.size > 0) {
                    console.log(inOff, hitWrongBall.get("state"), pottedOutOfTarget.size)
                    UI.updateProgressSpan("Restart")
                    this.selectedCueBallInitPos = false;
                    this.allRedPockected = false;
                    this.previousHitColor = null;
                    this.selectedColor = null;
                    for (const ball of Ball.balls) ball.reposition();
                    break;
                }

                this.stage = 1;
                break;
            case 1:
                if ((inOff || hitWrongBall.get("state") || pottedOutOfTarget.size > 0) && id !== "#ff0000" ) {
                    console.log("Reposition");                       
                    value.reposition();
                }
                break;
            case 2:
                if (inOff || hitWrongBall.get("state") || pottedOutOfTarget.size > 0) {
                    console.log("Reposition");
                    this.hitOrPottedWrongBall(value);
                    value.reposition();
                }
                break;
        }
        // sinked check
        // collided with wall check
    }

    // Foul checks
    static firstCollisionColor(ball){
        if (this.selectedColor == null) this.selectedColor = "#ff0000";
        // hit correct color
        if (ball && this.selectedColor == ball.id) return;
        this.hitOrPottedWrongBall(ball);
    }

    // Foul response
    static failToHitCueBall(score = 0) {
        UI.addAndUpdateScore(-max(4, score));
        UI.updateProgressSpan("Foul: Didn't hit cue ball.");
    }
    static pottedCueBall() {
        // TODO: Fix cue ball will sink multiple times bug
        UI.updateProgressSpan("Foul: Cue ball in pocket.");
        UI.addAndUpdateScore(-4);
        console.log("Please select a place.");
    }
    static hitOrPottedWrongBall(ball) {
        UI.updateProgressSpan("Foul: Hitted or Potted wrong color.");
        UI.addAndUpdateScore(-max(ball.score, 4));
    }
    static missTouching() {
        UI.updateProgressSpan("Foul: Touched ball during push.", 2000);
        UI.addAndUpdateScore(-4);
    }
}