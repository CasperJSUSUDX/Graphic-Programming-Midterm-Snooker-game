class UI {
    static createUIContainer = function() {
        const UIcontainer = createDiv();
        UIcontainer.id("ui");
        UIcontainer.position(10, 10);
        UIcontainer.style("display", "flex");
        UIcontainer.style("flex-direction", "column");
    }
    
    static createMoveSensetiveSlider = function(cue) {
        const moveUI = createDiv();
        moveUI.id("ui-move");
        moveUI.style("display", "flex");
        moveUI.parent("ui");

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

    static createScoreText = function(score) {
        const scoreUI = createSpan(`Score: ${score}`);
        scoreUI.class("ui-text");
        scoreUI.parent("ui");
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
    static drawSelectBallArea = function(redWasPockected) {
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