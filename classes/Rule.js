class Rule {
    // 1 for starting position, 2 for ramdom position(only red balls), 3 for random position(red balls and colors)
    static mode = 1;
    // stage 0: break shoot, stage 1: red and color ball in turn, stage 2: color order
    static stage = 0;
    static selectedCueBallInitPos = false;
    static redWasPotted = false;
    static previousPotColor = null;
    static selectedColor = "#ff0000";
    
    // TODO: Add an hit order when stage 2;
    // TODO: Add select color reminder before push
    static selectColorBall() {
        if (!this.selectedColor) {
            var selected = false;
            var index = 1;
            for (const [key, value] of UI.colorMap.entries()) {
                const x = window.innerWidth - (UI.colorMap.size + 1 - index) * UI.interval;
                const y = UI.interval;
                if (dist(mouseX, mouseY, x, y) <= UI.circleSize / 2) {
                    this.selectedColor = key;
                    selected = true;
                    break;
                }
                index++;
            }

            if (selected) {
                UI.colorMap.forEach((value, key) => {
                    if (key === this.selectedColor) UI.colorMap.set(key, true);
                    else UI.colorMap.set(key, false);
                })
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
    
    static turnProcessing = false;
    static #firstHit = {
        id: "undefined",
        score: -4
    };
    static turnProcess() {
        if (this.#firstHit.id === "undefined") this.#firstHit = Ball.cueBallCollisionCheck();
        Ball.ballCollisionWithWallCheck();
        if (!this.isAnyBallMoving()) this.#turnEnd();
    }
    static #turnEnd() {
        var inOff = false;
        var hitWrongBall = false;
        var pottedOutOfTarget = new Set();
        var foul = false;
        var maxSocre = 0;
        cue.switchLayer();
        if (scene.sinkedMap.has("#ffffff")) inOff = true;
        if (this.#firstHit.id !== (this.selectedColor || "#ff0000")) hitWrongBall = true;
        scene.sinkedMap.forEach((value, key) => {
            if (key !== (this.selectedColor || "#ff0000" || "#ffffff")) {
                pottedOutOfTarget.add(value);
                maxSocre = max(maxSocre, value.score);
            }
        });

        if (hitWrongBall || pottedOutOfTarget.size > 0) {
            this.hitOrPottedWrongBall(max(this.#firstHit.score, maxSocre));
            foul = true;
        } else if (inOff) {
            this.pottedCueBall()
            foul = true;
        }

        switch (this.stage) {
            case 0:
                if (foul || (!Ball.checkListWasDecreaseAndClear() && !scene.sinkedMap.get("#ff0000"))) {
                    UI.scoreReset();
                    UI.updateProgressSpan("Restart")
                    this.selectedCueBallInitPos = false;
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
                if (!Ball.balls.find((ball) => ball.id === "#ff0000") && this.redWasPotted) {
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
                if (Ball.balls.length == 1) {
                    UI.updateProgressSpan("Game End", 10000);
                }

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
                break;
        }
        
        cue.unlock();
        scene.sinkedMap = new Map();
        UI.resetColorMap();
        this.selectedColor = null;
        this.#firstHit = {
            id: "undefined",
            score: -4
        };
        this.turnProcessing = false;
    }

    // Foul response
    static failToHitCueBall(score = 0) {
        UI.addAndUpdateScore(-max(4, score));
        UI.updateProgressSpan("Foul: Didn't hit cue ball.");
    }
    static pottedCueBall() {
        UI.updateProgressSpan("Foul: Cue ball in pocket.");
        UI.addAndUpdateScore(-4);
        console.log("Please select a place.");
    }
    static hitOrPottedWrongBall(score) {
        UI.updateProgressSpan("Foul: Hitted or Potted wrong color.");
        UI.addAndUpdateScore(-max(score, 4));
    }
    static missTouching() {
        UI.updateProgressSpan("Foul: Touched ball during push.", 2000);
        UI.addAndUpdateScore(-4);
    }
}