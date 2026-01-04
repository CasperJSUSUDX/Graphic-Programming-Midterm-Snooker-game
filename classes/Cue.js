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
    var position = _initPos.add(
      createVector(window.innerWidth / 2, window.innerHeight / 2)
    );

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
    var originalBodyPos;
    var pushStartPos;
    var hitSensor;

    this.draw = function () {
      push();
      translate(position);
      rotate(deg);
      noStroke();
      fill(color);
      rect(0, 0, length, diameter);
      pop();
    };

    this.getP = function () {
      return position;
    };

    this.move = function () {
      if (keyIsPressed && !positionLock) {
        var velocity = createVector(0, 0);

        // W
        if (keyIsDown(87)) velocity.add(0, -speed);
        // A
        if (keyIsDown(65)) velocity.add(-speed, 0);
        // S
        if (keyIsDown(83)) velocity.add(0, speed);
        // D
        if (keyIsDown(68)) velocity.add(speed, 0);

        velocity.normalize().mult(speed);
        position.add(velocity);
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
        pushStartPos = createVector(mouseX, mouseY);
        originalBodyPos = position.copy();
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
        position = originalBodyPos.copy();

        // calulate cue's moving and store cue position
        originalBodyPos = position.copy();
        const pushEndPos = createVector(mouseX, mouseY);
        const moveLength = min(300, pushEndPos.sub(pushStartPos).mag());
        const moveDirection = createVector(cos(deg), sin(deg)).mult(moveLength);
        UI.convertForceToChargeBarHeight(moveLength, 0, 300);
        position.sub(moveDirection);
      }
    };

    this.pushEnd = async function () {
      async function cueReposition(direction) {
        return new Promise((resolve) => {
          const step = () => {
            if (position.copy().sub(originalBodyPos).mag() <= 50) {
              resolve();
              position = originalBodyPos.copy();
              return;
            }

            position.add(direction);
            setTimeout(step, 20);
          };

          step();
        });
      }

      if (pushing && positionLock) {
        var pushEndPos = createVector(mouseX, mouseY);
        var moveLength = min(300, pushEndPos.sub(pushStartPos).mag());
        var hitBall = null;
        var pushForce = map(moveLength, 0, 300, 0, maxPushForce * 10);

        const speed = createVector(
          originalBodyPos.x - position.x,
          originalBodyPos.y - position.y
        ).div(5);
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
        position = originalBodyPos.copy();
        Body.setPosition(collisionSensor, {
          x: window.innerWidth / 2 + position.x,
          y: window.innerHeight / 2 + position.y,
        });
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
