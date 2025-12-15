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
    static scoreReset() {
        this.#score = 0;
        select("#score-text").html(`Score: ${this.#score}`)
    }

    static #updateList = [];
    static createProgressText() {
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
    static async updateProgressSpan(message, time = 2000) {
        this.#updateList.push({
            message: message,
            time: time
        })

        return new Promise((resolve) => {
            const processNext = () => {
                const span = select("#ui-message");

                if (this.#updateList.length === 0) {
                    span.html("");
                    span.class("ui-text");
                    resolve();
                    return;
                }

                span.class("ui-text warn");
                span.html(this.#updateList[0].message);
                var interval = this.#updateList[0].time;
                this.#updateList.splice(0, 1);

                setTimeout(processNext, interval);
            }
            
            processNext();
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
        ["#000000", false]
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
}