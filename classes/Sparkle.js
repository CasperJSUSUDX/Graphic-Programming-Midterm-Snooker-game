class Sparkle {
    constructor(_position, _size, _color, _existTime) {
        var position = _position;
        var size = _size;
        var color = _color;
        var existTime = _existTime;
        
        this.draw = function() {
            push();
            noStroke();
            fill(color);
            ellipise(position.x, position.y, size);
            pop();
        }

        // auto discard;
        setTimeout(() => {
            const index = Sparkle.sparkles.indexOf(this);
            Sparkle.sparkles.splice(index, 1);
        }, existTime);
    }

    static sparkles = [];

    static createCometTrail(target) {
        
    }
}