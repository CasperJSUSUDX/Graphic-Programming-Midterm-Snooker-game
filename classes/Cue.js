class Cue {
  /**
   * @param {p5.Vector} _initPos
   * @param {Number} _length
   * @param {Number} _diameter
   * @param {HEX} _color
   * @param {Number} _speed
   * @param {Number} _pushForce
   */
  constructor(
    _initPos,
    _length,
    _diameter,
    _color,
    _speed,
    _maxPushForce,
    _hitSupportRange
  ) {
    const sensorOptions = {
      isSensor: true,
      collisionFilter: {
        category: SCENE,
        mask: SCENE,
      },
    };
    var position = Vector.add(_initPos, {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    this.position = Vector.clone(position);
    var deg = 0;
    var length = _length;
    var diameter = _diameter;
    var color = _color;
    var speed = _speed;
    var maxPushForce = _maxPushForce;
    var hitSupportRange = _hitSupportRange;
    var pushing = false;
    var positionLock = false;
    var rotationLock = false;
    var originalPos;
    var pushStartPos;
    var hitSensor;

    this.draw = function () {
      push();
      translate(position.x, position.y);
      rotate(deg);
      noStroke();
      fill(color);
      rect(0, 0, length, diameter);
      pop();
    };

    this.move = function () {
      if (keyIsPressed && !positionLock) {
        var velocity = { x: 0, y: 0 };

        // W
        if (keyIsDown(87)) velocity = Vector.add(velocity, { x: 0, y: -speed });
        // A
        if (keyIsDown(65)) velocity = Vector.add(velocity, { x: -speed, y: 0 });
        // S
        if (keyIsDown(83)) velocity = Vector.add(velocity, { x: 0, y: speed });
        // D
        if (keyIsDown(68)) velocity = Vector.add(velocity, { x: speed, y: 0 });

        position = Vector.add(position, Vector.mult(Vector.normalise(velocity), speed));
      }
    };

    this.rotate = function () {
      if (!rotationLock) {
        deg = atan2(mouseY - position.y, mouseX - position.x);
      }
    };

    this.switchMode = function () {
      if (!pushing && !Rule.isAnyBallMoving()) {
        positionLock = !positionLock;
      }
    };

    this.adjustSpeed = function (num) {
      speed = num;
    };

    this.pushStart = function () {
      if (!pushing && positionLock) {
        pushing = true;
        rotationLock = true;
        pushStartPos = { x: mouseX, y: mouseY };
        originalPos = Vector.clone(position);
        hitSensor = Bodies.rectangle(
          position.x + cos(deg) * (length / 2 + hitSupportRange / 2),
          position.y + sin(deg) * (length / 2 + hitSupportRange / 2),
          hitSupportRange,
          hitSupportRange,
          sensorOptions
        );
        Body.setAngle(hitSensor, deg);
        World.add(world, hitSensor);
      }
    };

    this.pushProcess = function () {
      if (pushing && positionLock) {
        // reset cue position
        position = Vector.clone(originalPos);

        // calulate cue's moving and store cue position
        originalPos = Vector.clone(position);
        const pushEndPos = { x: mouseX, y: mouseY };
        const moveLength = min(
          300,
          Vector.magnitude(Vector.sub(pushEndPos, pushStartPos))
        );
        const moveDirection = Vector.mult(
          { x: cos(deg), y: sin(deg) },
          moveLength
        );
        UI.convertForceToChargeBarHeight(moveLength, 0, 300);
        position = Vector.sub(position, moveDirection);
      }
    };

    this.pushEnd = async function () {
      async function cueReposition(direction) {
        return new Promise((resolve) => {
          const step = () => {
            if (
              Vector.magnitude(
                Vector.sub(Vector.clone(position), originalPos)
              ) <= 50
            ) {
              resolve();
              position = Vector.clone(originalPos);
              return;
            }

            position = Vector.add(position, direction);
            setTimeout(step, 20);
          };

          step();
        });
      }

      if (pushing && positionLock) {
        const pushEndPos = { x: mouseX, y: mouseY };
        const moveLength = min(
          300,
          Vector.magnitude(Vector.sub(pushEndPos, pushStartPos))
        );
        const pushForce = map(moveLength, 0, 300, 0, maxPushForce * 10);
        var hitBall = null;

        const speed = Vector.div(
          {
            x: originalPos.x - position.x,
            y: originalPos.y - position.y,
          },
          5
        );
        await cueReposition(speed);
        for (const ball of Ball.balls) {
          if (Collision.collides(ball.body, hitSensor)) {
            hitBall = ball;
            Body.applyForce(ball.body, ball.body.position, {
              x: cos(deg) * pushForce * 0.02,
              y: sin(deg) * pushForce * 0.02,
            });
            break;
          }
        }
        if (hitBall) {
          if (hitBall.id !== "#ffffff") Rule.failToHitCueBall(hitBall.score);
          else if (Rule.stage === 0)
            Ball.registerCheckList(
              Ball.balls.filter((e) => e.id === "#ff0000")
            );
        } else {
          Rule.failToHitCueBall();
        }
        World.remove(world, hitSensor);
        Particle.callEffect("spark", [Ball.balls[0]]);
        Particle.callEffect("comet", [Ball.balls[0]]);
        Rule.turnProcessing = true;
      }
    };

    this.unlock = function () {
      pushing = false;
      positionLock = false;
      rotationLock = false;
    };

    this.interruptPush = function () {
      if (pushing) {
        pushing = false;
        cue.unlock();
        UI.resetChargeBar();
        position = Vector.clone(originalPos);
      }
    };

    // debug use
    this.drawHitArea = function () {
      push();
      translate(
        position.x + cos(deg) * (length / 2 + hitSupportRange / 2),
        position.y + sin(deg) * (length / 2 + hitSupportRange / 2)
      );
      noStroke();
      fill(255, 0, 0, 75);
      rotate(deg);
      rect(0, 0, hitSupportRange);
      pop();
    };
  }
}
