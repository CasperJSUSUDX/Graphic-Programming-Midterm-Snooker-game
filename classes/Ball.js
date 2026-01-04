/**
 * Class is releated with snooker balls
 * Manages the physics body, render, and static logics
 */
class Ball {
  /**
   * Create a ball
   * @param {2D Vector} _initPosition - the initial position of the ball
   * @param {string} color - Hex color code
   * @param {Number} _score - the score of the ball, default value is 1
   * @param {Number} _size - Diameter of the ball(Optional)
   */
  constructor(_initPosition, color, _score = 1, _size = ballSize) {
    const ballOptions = {
      ccd: true,
      density: 0.04,
      restitution: 0.8,
      friction: 0.1,
      frictionAir: 0.01,
      label: "Ball",
      collisionFilter: {
        category: SCENE,
        mask: SCENE,
      },
    };
    // public variables
    this.visiable = true;
    // use hex color code as id
    this.id = color;
    this.score = _score;
    this.size = _size;
    this.initPosition = { ..._initPosition };

    // create Matter.js body
    this.body = Bodies.circle(
      _initPosition.x,
      _initPosition.y,
      _size / 2,
      ballOptions
    );
    World.add(world, this.body);

    /**
     * Render the ball
     */
    this.draw = function () {
      if (this.visiable) {
        push();
        translate(this.body.position.x, this.body.position.y);
        rotate(this.body.angle);
        stroke(0);
        strokeWeight(0.5);
        fill(color);
        ellipse(0, 0, this.size);
        pop();
      }
    };

    /**
     * Reset the ball to its initial position and stop it
     */
    this.reposition = function () {
      this.visiable = true;
      Body.setPosition(this.body, this.initPosition);
      Body.translate(this.body, {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      // ensure the ball is solid
      Body.set(this.body, "isSensor", false);
    };
  }

  static balls = [];

  /**
   * Check whether the moving cue ball has collided with another ball
   * @returns {Object} - A object containing id and score
   */
  static cueBallCollisionCheck() {
    if (this.balls[0].body.speed > 0.01) {
      for (let i = 1; i < this.balls.length; i++) {
        var collided = Collision.collides(
          this.balls[0].body,
          this.balls[i].body
        );
        if (collided) return this.balls[i];
      }
    }

    return {
      id: "empty",
      score: 4,
    };
  }
  /**
   * Remove all balls from this.balls and clear this.balls
   * Then initialize balls based on current mode
   */
  static resetBalls() {
    World.remove(
      world,
      this.balls.map((e) => e.body)
    );
    Ball.balls = [];
    this.initBalls(mode);
    UI.resetScore();

    for (const ball of this.balls) {
      Body.translate(ball.body, {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
    }
  }

  // checking list of ballCollisionWithWallCheck
  static #checkList = [];
  static #startLength;

  /**
   * Iterates through the checkList
   * And check whether the element has collided with a body that label with "Wall"
   * If has collided, remove the element from checkList
   */
  static ballCollisionWithWallCheck() {
    if (this.#checkList.length === 0) return;

    for (let i = 0; i < this.#checkList.length; i++) {
      let collided = false;

      for (const body of world.bodies) {
        // Handle compound bodies
        if (body.parts.length > 1) {
          for (const part of body.parts) {
            if (part.label == "Wall") {
              if (Collision.collides(this.#checkList[i].body, body)) {
                collided = true;
                break;
              }
            }
          }
        }
        // Handle simple bodies
        if (body.label === "Wall") {
          if (Collision.collides(this.#checkList[i].body, body)) {
            collided = true;
            break;
          }
        }
      }

      if (collided) {
        this.#checkList.splice(i, 1);
        i--;
      }
    }
  }
  /**
   * Push the passing array into checkList and initialize the startLength
   * @param {object[]} arr - the object needs to have Matter.js body property
   */
  static registerCheckList(arr) {
    this.#checkList = [...arr];
    this.#startLength = this.#checkList.length;
  }
  /**
   * Check whether the checklist change
   * Then clear the checkList
   * @returns {Boolean} - Whether the length of checklist change
   */
  static checkListWasDecreaseAndClear() {
    const l = this.#checkList.length;
    this.#checkList = [];
    if (l !== this.#startLength) return true;
    return false;
  }

  /**
   * Calculates valid coordinates for placing the cue ball within the D-Zone.
   * @param {Ball} cueBall - The cue ball object to be placed.
   * @returns {Boolean} - Whether the placement is valid or not
   */
  static selectPosInDZone(cueBall) {
    const vector = { x: 0, y: 0 };

    // Define the horizontal boundaries
    const rightLimit = window.innerWidth / 2 - tableLength * 0.3;
    const leftLimit =
      window.innerWidth / 2 - tableLength * 0.3 - tableWidth / 6;

    // Calculate x position
    vector.x = -tableLength * 0.35;
    if (mouseX >= rightLimit) {
      vector.x = rightLimit;
    } else if (mouseX <= leftLimit) {
      vector.x = leftLimit;
    } else {
      vector.x = mouseX;
    }

    // Calculate vertical boundaries
    const radius = tableWidth / 6;
    const distFromCenter = rightLimit - vector.x;
    const l_square = radius ** 2 - distFromCenter ** 2;

    var l;
    if (l_square <= 0.001) l = tableWidth / 6;
    else l = Math.sqrt((tableWidth / 6) ** 2 - (rightLimit - vector.x) ** 2);

    const topLimit = window.innerHeight / 2 - l;
    const bottomLimit = window.innerHeight / 2 + l;

    // Calculate y position
    vector.y = 0;
    if (mouseY <= topLimit) {
      vector.y = topLimit;
    } else if (mouseY >= bottomLimit) {
      vector.y = bottomLimit;
    } else {
      vector.y = mouseY;
    }

    // Collision check
    // Ensure the place is valid
    // Create a temporary sensor
    Body.set(cueBall.body, "isSensor", true);
    Body.setPosition(cueBall.body, vector);

    for (let i = 1; i < this.balls.length; i++) {
      if (Collision.collides(cueBall.body, this.balls[i].body)) {
        UI.pushProgressSpan("Cannot put cue ball at there.", "#ff0000");
        cueBall.reposition();
        return false;
      }
    }
    Body.set(cueBall.body, "isSensor", false);

    return true;
  }

  /**
   * Initializes the table setup based on mode
   * @param {Number} mode - 1: Standard, 2: Random red balls, 3: Practice Cross, 4: Crasy Pinball
   */
  static initBalls(mode = 1) {
    switch (mode) {
      // standard mode
      case 1:
        // Add cue ball and colors
        this.balls.push(new Ball({ x: -tableLength * 0.35, y: 0 }, "#ffffff"));
        this.balls.push(
          new Ball({ x: -tableLength * 0.3, y: tableWidth / 6 }, "#ffff00", 2)
        );
        this.balls.push(
          new Ball({ x: -tableLength * 0.3, y: 0 }, "#784315", 4)
        );
        this.balls.push(
          new Ball({ x: -tableLength * 0.3, y: -tableWidth / 6 }, "#00ff00", 3)
        );
        this.balls.push(new Ball({ x: 0, y: 0 }, "#0000ff", 5));
        this.balls.push(new Ball({ x: tableLength / 4, y: 0 }, "#EF88BE", 6));
        this.balls.push(
          new Ball({ x: (tableLength * 9) / 22, y: 0 }, "#000000", 7)
        );
        // Triangle formation for Reds
        for (let i = 0; i < 5; i++) {
          var basicPosY = (ballSize / 2) * i;
          for (let j = 0; j <= i; j++) {
            this.balls.push(
              new Ball(
                {
                  x: tableLength / 4 + ballSize * (i + 1),
                  y: basicPosY - ballSize * j,
                },
                "#ff0000"
              )
            );
          }
        }
        break;
      // Random red balls
      case 2:
        // Add cue ball and colors
        this.balls.push(new Ball({ x: -tableLength * 0.35, y: 0 }, "#ffffff"));
        this.balls.push(
          new Ball({ x: -tableLength * 0.3, y: tableWidth / 6 }, "#ffff00", 2)
        );
        this.balls.push(
          new Ball({ x: -tableLength * 0.3, y: 0 }, "#784315", 4)
        );
        this.balls.push(
          new Ball({ x: -tableLength * 0.3, y: -tableWidth / 6 }, "#00ff00", 3)
        );
        this.balls.push(new Ball({ x: 0, y: 0 }, "#0000ff", 5));
        this.balls.push(new Ball({ x: tableLength / 4, y: 0 }, "#EF88BE", 6));
        this.balls.push(
          new Ball({ x: (tableLength * 9) / 22, y: 0 }, "#000000", 7)
        );
        // Generate 15 reds at random positions
        for (let i = 0; i < 15; i++) {
          this.balls.push(new Ball(this.#generatePosition(), "#ff0000"));
        }
        break;
      // Practice Mode
      case 3:
        // Add cue ball and colors
        this.balls.push(new Ball({ x: -tableLength * 0.35, y: 0 }, "#ffffff"));
        this.balls.push(
          new Ball({ x: -tableLength * 0.3, y: tableWidth / 6 }, "#ffff00", 2)
        );
        this.balls.push(
          new Ball({ x: -tableLength * 0.3, y: 0 }, "#784315", 4)
        );
        this.balls.push(
          new Ball({ x: -tableLength * 0.3, y: -tableWidth / 6 }, "#00ff00", 3)
        );
        this.balls.push(new Ball({ x: 0, y: 0 }, "#0000ff", 5));
        this.balls.push(new Ball({ x: tableLength / 4, y: 0 }, "#EF88BE", 6));
        this.balls.push(
          new Ball({ x: (tableLength * 9) / 22, y: 0 }, "#000000", 7)
        );
        // Cross formation
        const xInterval = (tableLength * 7) / 264;
        const yInterval = tableWidth / 12;
        for (let i = 0; i < 5; i++) {
          // top
          this.balls.push(
            new Ball({ x: tableLength / 4, y: -yInterval * (i + 1) }, "#ff0000")
          );
          // bottom
          this.balls.push(
            new Ball({ x: tableLength / 4, y: yInterval * (i + 1) }, "#ff0000")
          );
          // right
          this.balls.push(
            new Ball(
              { x: tableLength / 4 + xInterval * (i + 1), y: 0 },
              "#ff0000"
            )
          );
        }
        break;
      // Crazy Pinball Mode
      case 4:
        // Setup similar to Mode 1 but includes Bumper creation
        this.balls.push(new Ball({ x: -tableLength * 0.35, y: 0 }, "#ffffff"));
        this.balls.push(
          new Ball({ x: -tableLength * 0.3, y: tableWidth / 6 }, "#ffff00", 2)
        );
        this.balls.push(
          new Ball({ x: -tableLength * 0.3, y: 0 }, "#784315", 4)
        );
        this.balls.push(
          new Ball({ x: -tableLength * 0.3, y: -tableWidth / 6 }, "#00ff00", 3)
        );
        this.balls.push(new Ball({ x: 0, y: 0 }, "#0000ff", 5));
        this.balls.push(new Ball({ x: tableLength / 4, y: 0 }, "#EF88BE", 6));
        this.balls.push(
          new Ball({ x: (tableLength * 9) / 22, y: 0 }, "#000000", 7)
        );
        for (let i = 0; i < 5; i++) {
          var basicPosY = (ballSize / 2) * i;
          for (let j = 0; j <= i; j++) {
            this.balls.push(
              new Ball(
                {
                  x: tableLength / 4 + ballSize * (i + 1),
                  y: basicPosY - ballSize * j,
                },
                "#ff0000"
              )
            );
          }
        }

        // Add bumpers
        Scene.createBumper(5);
        break;
    }
  }

  /**
   * Generate a random position inside the table
   * If there exist a ball at the position, call itself until success
   * @returns {2D Vector} - a 2d vector {x, y}
   */
  static #generatePosition() {
    const position = {
      x: -tableLength / 2 + ballSize + Math.random() * (tableLength - ballSize),
      y: -tableWidth / 2 + ballSize + Math.random() * (tableWidth - ballSize),
    };

    for (const ball of this.balls) {
      const deltaX = ball.initPosition.x - position.x;
      const deltaY = ball.initPosition.y - position.y;
      if (Math.sqrt(deltaX ** 2 + deltaY ** 2) <= ballSize / 2) {
        return this.#generatePosition();
      }
    }

    return position;
  }
}
