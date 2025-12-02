class Rule {
    // 1 for starting position, 2 for ramdom position(only red balls), 3 for random position(red balls and colors)
    static mode = 1;
    static allRedPockected = false;
    static previousHitColor = null;
    static selectedColor;
    static sinkedBalls = [];
    static colors = UI.colorOrder;
    static hitOrderCheck = function(ball) {       
        if (this.allRedPockected) {
            console.log("All red were pockected.");
        } else {
            if (ball.id === "#ff0000") {
                score++;
                selectedColor();
            } else if (
                this.previousHitColor === "#ff0000" &&
                ball.id == this.selectedColor
            ) {
                score += ball.score;
            } else {
                console.log("Foul");
            }
        }

        this.previousHitColor = ball.id;
    }

    static selectColorBall = function() {
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
}