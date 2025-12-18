class Particle {
    constructor(_position, _size, _color, _existTime) {
        var position = {..._position};
        var size = _size;
        var color = _color;
        var existTime = _existTime;
        
        this.draw = function() {
            push();
            noStroke();
            fill(color);
            ellipse(position.x, position.y, size);
            pop();
        }

        // auto discard;
        setTimeout(() => {
            const index = Particle.#sparkles.indexOf(this);
            Particle.#sparkles.splice(index, 1);
        }, existTime);
    }

    static #sparkles = [];
    static #effects = [];
    static #effectMap = new Map([
        ["comet", this.#cometTrail],
        ["unknow", this.#unknowTrail],
        ["spark", this.#sparkWhenHit]
    ]);
    static drawEffects() {
        for (const e of this.#effects) {
            e.func.apply(this, [...e.args, e.index]);
        }
        for (const sparkle of this.#sparkles) {
            sparkle.draw();
        }
    }

    static callEffect(effectName, args) {
        const name = effectName.toLowerCase();
        if (this.#effectMap.has(name)) {
            const obj = {
                func: this.#effectMap.get(name),
                args: args,
                index: -1
            }
            this.#effects.push(obj);
            obj.index = this.#effects.indexOf(obj);
        }
    }

    /**
     * 
     * @param {Ball} target This effect will apply on what target
     * @param {Int} index the index in effects 
     */
    static #cometTrail(target, index) {
        // discard if target stop
        if (target.body.speed <= 0.1) {
            this.#effects.splice(index, 1);
        }

        const size = 10;
        const direction = Vector.normalise(target.body.velocity);
        const left = Vector.mult(Vector.rotate(direction, PI / 2), size / 2);
        const right = Vector.neg(left);
        this.#sparkles.push(new Particle(Vector.add(target.body.position, left), size, "#89CFF088", 500));
        this.#sparkles.push(new Particle(target.body.position, size, "#89CFF0cc", 1000));
        this.#sparkles.push(new Particle(Vector.add(target.body.position, right), size, "#89CFF088", 500));
    }

    static #unknowTrail(target, index) {
        // discard if target stop
        if (target.body.speed <= 0.1) {
            this.#effects.splice(index, 1);
        }

        const position = {
            x: target.body.position.x + random(-target.size / 2, target.size / 2),
            y: target.body.position.y + random(-target.size / 2, target.size / 2)
        };
        this.#sparkles.push(new Particle(position, 10, "#ffffff88", 500));
    }

    static #sparkWhenHit(target, index) {
        const size = 5;
        const interval = 2;
        const reverseDirection = Vector.normalise(Vector.neg(target.body.velocity));
        const horizonDirection = Vector.rotate(reverseDirection, PI / 2);
        const sizeVectorOfTarget = Vector.mult(reverseDirection, target.size / 2);
        const baseInterval = Vector.mult(reverseDirection, size / 2);
        const sides = [1, -1];

        for (const side of sides) {
            var intervalOfParticles = {...baseInterval};

            for (let i = 0; i < 4; i++) {
                if (side === -1 && i === 0) {
                    intervalOfParticles = Vector.rotate(intervalOfParticles, (PI / 12) * side);
                    continue;
                }

                var position = Vector.sub(target.body.position, sizeVectorOfTarget);

                for (let j = 0; j < 20; j++) {
                    var delay = j * interval;
                    const p = Vector.add({...position}, Vector.mult(horizonDirection, random(-size, size)));
                    setTimeout(() => {
                        this.#sparkles.push(new Particle(p, size, "#ff000088", 100));
                    }, delay);
                    position = Vector.add(position, intervalOfParticles);
                }

                intervalOfParticles = Vector.rotate(intervalOfParticles, (PI / 12) * side);
            }
        }

        this.#effects.splice(index, 1);
    }
}