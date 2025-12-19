class Particle {
    constructor(_position, _size, _color, _existTime, options = {}) {
        var position = {..._position};
        var size = _size;
        var color = _color;
        var existTime = _existTime;
        const positionCallback = Object.hasOwn(options, "positionCallback") ? options.positionCallback : null; 
        const isFade = Object.hasOwn(options, "isFade") ? options.isFade : false;
        const self = this;
        
        this.draw = function() {
            if (positionCallback) {
                position = positionCallback(position);
            }

            push();
            noStroke();
            fill(color);
            ellipse(position.x, position.y, size);
            pop();
        }

        const fade = function(rate) {
            if (size <= 0.5) {
                const index = Particle.#particles.indexOf(self);
                Particle.#particles.splice(index, 1);
                return;
            }

            size = size * rate;
            setTimeout(() => {
                fade(rate);
            }, 0);
        }

        // auto discard;
        setTimeout(() => {
            if (isFade) {
                fade(0.9);
            } else {
                const index = Particle.#particles.indexOf(this);
                Particle.#particles.splice(index, 1);
            }
        }, existTime);
    }

    static #particles = [];
    static #effects = [];
    static #effectMap = new Map([
        ["comet", this.#cometTrail],
        ["spinfire", this.#spinFireTrail],
        ["spark", this.#sparkWhenHit]
    ]);
    static drawEffects() {
        for (const e of this.#effects) {
            e.func.apply(this, [...e.args, this.#effects.indexOf(e)]);
        }
        for (const particle of this.#particles) {
            particle.draw();
        }
    }

    static callEffect(effectName, args) {
        const name = effectName.toLowerCase();
        if (this.#effectMap.has(name)) {
            const obj = {
                func: this.#effectMap.get(name),
                args: args,
            }
            this.#effects.push(obj);
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

        const size = target.size / 4;
        const existTime = 1000;
        const direction = Vector.normalise(target.body.velocity);
        const left = Vector.mult(Vector.rotate(direction, PI / 2), size / 2);
        const right = Vector.neg(left);
        const centerPosition = {...target.body.position};
        function getCloseToCenter(position) {
            const direction = Vector.sub(position, centerPosition);
            return Vector.sub(position, Vector.normalise(direction));
        }
        this.#particles.push(new Particle(
            Vector.add(centerPosition, left),
            size,
            "#89CFF088",
            existTime / 3,
            {
                positionCallback: getCloseToCenter,
                isFade: true
            }
        ));
        this.#particles.push(new Particle(
            Vector.add(centerPosition, right),
            size,
            "#89CFF088",
            existTime / 3,
            {
                positionCallback: getCloseToCenter,
                isFade: true
            }
        ));
        this.#particles.push(new Particle(centerPosition, size * 2, "#89CFF0cc", existTime, {isFade: true}));
    }

    // TODO: Finish spin fire trail
    static #spinFireTrail(target, index) {
        // discard if target stop
        if (target.body.speed <= 0.1) {
            this.#effects.splice(index, 1);
        }

        const position = {
            x: target.body.position.x + random(-target.size / 2, target.size / 2),
            y: target.body.position.y + random(-target.size / 2, target.size / 2)
        };
        this.#particles.push(new Particle(position, 10, "#ffffff88", 500));
    }

    static #sparkWhenHit(target, index) {
        const size = 5;
        const interval = 3;
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
                        this.#particles.push(new Particle(p, size, "#ff000088", 100));
                    }, delay);
                    position = Vector.add(position, intervalOfParticles);
                }

                intervalOfParticles = Vector.rotate(intervalOfParticles, (PI / 12) * side);
            }
        }

        this.#effects.splice(index, 1);
    }
}