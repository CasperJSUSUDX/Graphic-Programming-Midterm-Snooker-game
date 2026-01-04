/**
 * Class is relative the snooker cue
 * Manage user input, aiming, charging large and physic interact with balls
 */
class Cue {
  /**
   * @param {p5.Vector} _initPos - Initial position relative to center of table
   * @param {Number} _length - Visual length of the cue
   * @param {Number} _diameter - Visual thickness
   * @param {String} _color - Hex color code of the cue
   * @param {Number} _speed - Movement speed
   * @param {Number} _maxPushForce - Maximum force applied to the ball.
   * @param {Number} _hitSupportRange - Tolerance range for hitting the ball.
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

    // closure variables
    var position = Vector.add(_initPos, {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    var deg = 0;
    var length = _length;
    var diameter = _diameter;
    var color = _color;
    var speed = _speed;
    var maxPushForce = _maxPushForce;
    var hitSupportRange = _hitSupportRange;
    // flags
    var pushing = false;
    var positionLock = false;
    var rotationLock = false;
    // push calculation variables
    var originalPos;
    var pushStartPos;
    var hitSensor;

    // public variable
    this.position = Vector.clone(position);

    this.draw = function () {
      push();
      translate(position.x, position.y);
      rotate(deg);
      noStroke();
      fill(color);
      rect(0, 0, length, diameter);
      pop();
    };

    /**
     * Handle WASD movement of the cue
     * Updates position based on key states.
     */
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
        this.position = Vector.clone(position);
      }
    };

    /**
     * Rotates the cue to face the mouse cursor.
     */
    this.rotate = function () {
      if (!rotationLock) {
        deg = atan2(mouseY - position.y, mouseX - position.x);
      }
    };

    // Toggle position lock
    this.switchMode = function () {
      if (!pushing && !Rule.isAnyBallMoving()) {
        positionLock = !positionLock;
      }
    };

    this.adjustSpeed = function (num) {
      speed = num;
    };

    /**
     * Starts the pushing mechanic (Mouse Press).
     * Locks rotation and prepares the hit sensor.
     */
    this.pushStart = function () {
      if (!pushing && positionLock) {
        pushing = true;
        rotationLock = true;
        pushStartPos = { x: mouseX, y: mouseY };
        originalPos = Vector.clone(position);

        // create a sensor at the tip of cue
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

    /**
     * Calculates drag distance to determine push power (Mouse Drag).
     * And visualizes the "pull back" animation.
     */
    this.pushProcess = function () {
      if (pushing && positionLock) {
        // reset position
        position = Vector.clone(originalPos);

        // calulate cue's animation
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

        // update UI charge bar
        UI.convertForceToChargeBarHeight(moveLength, 0, 300);

        // Visual pull back
        position = Vector.sub(position, moveDirection);
      }
    };

    /**
     * Executes the shot (Mouse Release).
     * Animates the cue striking forward and applies force to the ball.
     */
    this.pushEnd = async function () {
      // Helper function: asynchronous update the moving forward animation
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
            // asynchronous recursive
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
        // map the pull distance to actual force
        const pushForce = map(moveLength, 0, 300, 0, maxPushForce * 10);
        var hitBall = null;

        // Animate the strike
        const speed = Vector.div(
          {
            x: originalPos.x - position.x,
            y: originalPos.y - position.y,
          },
          5
        );
        await cueReposition(speed);

        // Detect collision with hitSensor
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

        // rule processing
        if (hitBall) {
          if (hitBall.id !== "#ffffff") Rule.failToHitCueBall(hitBall.score);
          // break shot check
          else if (Rule.stage === 0)
            Ball.registerCheckList(
              Ball.balls.filter((e) => e.id === "#ff0000")
            );
        } else {
          Rule.failToHitCueBall();
        }

        World.remove(world, hitSensor);

        // Visual effects
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

    /**
     * Cancle push progress
     */
    this.interruptPush = function () {
      if (pushing) {
        pushing = false;
        cue.unlock();
        UI.resetChargeBar();
        position = Vector.clone(originalPos);
      }
    };
  }
}
