class UI {
    static UIcontainer;
    static createUIContainer = function() {
        this.UIcontainer = createDiv();
        this.UIcontainer.id("ui");
        this.UIcontainer.position(10, 10);
        this.UIcontainer.style("display", "flex");
        this.UIcontainer.style("flex-direction", "column");
    }
    
    static moveUI;
    static moveSensetiveText;
    static moveSlider;
    static currentSensetiveText;
    static createMoveSensetiveSlider = function(cue) {
        this.moveUI = createDiv();
        this.moveUI.id("ui-move");
        this.moveUI.style("display", "flex");
        this.moveUI.parent("ui");
        this.moveSensetiveText = createSpan("Move sensetive: ");
        this.moveSensetiveText.class("ui-text");
        this.moveSensetiveText.parent("ui-move");
        this.moveSlider = createSlider(0, 20, 10);
        this.moveSlider.size(200);
        this.moveSlider.parent("ui-move");
        this.currentSensetiveText = createSpan(this.moveSlider.value());
        this.currentSensetiveText.class("ui-text");
        this.currentSensetiveText.parent("ui-move");
        this.moveSlider.changed(() => {
            this.currentSensetiveText.html(this.moveSlider.value());
            cue.adjustSpeed(this.moveSlider.value());
        });
    }

    static scoreUI;
    static createScoreText = function(score) {
        this.scoreUI = createSpan(`Score: ${score}`);
        this.scoreUI.class("ui-text");
        this.scoreUI.parent("ui");
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