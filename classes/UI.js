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
        scoreUI.id("score-text")
        scoreUI.class("ui-text");
        scoreUI.parent("ui");
    }
    static addAndUpdateScore(num) {
        this.#score += num;
        select("#score-text").html(`Score: ${this.#score}`)
    }

    static createProgressText() {
        const container = createDiv();
        container.style("display", "flex");
        container.style("flex-direction", "column");
        // container.style("align-items", "center");
        container.style("position", "absolute");
        container.style("left", `${window.innerWidth / 2 - 200}px`);
        container.style("top", "0");

        const stageSpan = createSpan("Stage: 0 - Break shot");
        // stageSpan.style("text-align", "center");
        stageSpan.style("font-size", "4vh");
        stageSpan.class("ui-text");
        stageSpan.parent(container);

        const messageSpan = createSpan("");
        messageSpan.id("ui-message");
        // messageSpan.style("text-align", "center");
        messageSpan.style("font-size", "3vh");
        messageSpan.class("ui-text");
        messageSpan.parent(container);
    }
    static updateProgressSpan(message, time) {
        const span = select("#ui-message");
        span.class("ui-text warn");
        span.html(message);

        setTimeout(() => {
            span.class("ui-text warn");
            span.html("");
        }, time);
    }

    static interval = 60;
    static circleSize = 50;
    static colorOrder = [
        "#ff0000",
        "#ffff00",
        "#00ff00",
        "#784315",
        "#0000ff",
        "#EF88BE",
        "#000000",
    ];
    static drawSelectBallArea(redWasPockected) {
        push();
        for (let i = 0; i < this.colorOrder.length; i++) {
            var color = this.colorOrder[i];

            if (redWasPockected && color.match(/^#ff0000$/g)) {
                color += "40";
            } else if (!redWasPockected && !color.match(/(^#ff0000$)|(40$)/g)) {
                color += "40";
            }

            fill(color);
            ellipse(
                window.innerWidth - this.interval - (this.colorOrder.length - 1 - i) * this.interval,
                this.interval,
                this.circleSize
            );
        }
        pop();
    }
}