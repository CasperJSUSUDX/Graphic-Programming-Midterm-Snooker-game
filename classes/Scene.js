/**
 * Class is releated the snooker table
 * Manages the physics body, render, and bumper logics
 */
class Scene {
  /**
   * @param {Number} length - Table length
   * @param {Number} width - Table width
   * @param {Number} railWidth - Width of the cushion rails
   * @param {Number} pocketSize - Diameter of the pockets
   * @param {String} color - Hex color for the table background
   * @param {String} railColor - Hex color for the cushion rails
   * @param {Number} restitution - Bounciness of the cushion rails (default 0.7)
   * @param {Number} friction - Friction of the cushion rails (default 0.1)
   */
  constructor(
    length,
    width,
    railWidth,
    pocketSize,
    color,
    railColor,
    restitution = 0.7,
    friction = 0.1
  ) {
    const options = {
      ccd: true,
      restitution: restitution,
      friction: friction,
      label: "Wall",
      collisionFilter: {
        category: SCENE,
        mask: SCENE,
      },
    };
    // pocket positions relative to center of the table
    const pocketsPos = [
      {
        x: -length / 2 - railWidth / 2,
        y: -width / 2 - railWidth / 2,
      },
      {
        x: length / 2 + railWidth / 2,
        y: -width / 2 - railWidth / 2,
      },
      {
        x: -length / 2 - railWidth / 2,
        y: width / 2 + railWidth / 2,
      },
      {
        x: length / 2 + railWidth / 2,
        y: width / 2 + railWidth / 2,
      },
      {
        x: 0,
        y: -width / 2 - railWidth,
      },
      {
        x: 0,
        y: width / 2 + railWidth,
      },
    ];

    const leftDeg = PI / 4;
    const rightDeg = PI / 4;

    // Define trapezoidal shapes for horizontal rails
    const verticesForHorizontal = [
      {
        x: -length / 4 + pocketSize / 4,
        y: -railWidth / 2,
      },
      {
        x: -length / 4 + pocketSize / 4 + railWidth / tan(leftDeg),
        y: railWidth / 2,
      },
      {
        x: length / 4 - pocketSize / 4 - railWidth / tan(rightDeg),
        y: railWidth / 2,
      },
      {
        x: length / 4 - pocketSize / 4,
        y: -railWidth / 2,
      },
    ];

    // Define trapezoidal shapes for vertical rails
    const verticesForVertical = [
      {
        x: -railWidth / 2,
        y: -width / 2,
      },
      {
        x: railWidth / 2,
        y: -width / 2 + railWidth / tan(rightDeg),
      },
      {
        x: railWidth / 2,
        y: width / 2 - railWidth / tan(rightDeg),
      },
      {
        x: -railWidth / 2,
        y: width,
      },
    ];

    // Create the bodies of cushion rails
    const parts = [
      // top left
      Bodies.fromVertices(
        -length / 4 - pocketSize / 4,
        -width / 2 - railWidth / 2,
        verticesForHorizontal,
        options
      ),
      // top right
      Bodies.fromVertices(
        -length / 4 - pocketSize / 4,
        width / 2 + railWidth / 2,
        verticesForHorizontal,
        options
      ),
      // bottom left
      Bodies.fromVertices(
        length / 4 + pocketSize / 4,
        -width / 2 - railWidth / 2,
        verticesForHorizontal,
        Object.assign(options, { angle: PI })
      ),
      // bottom right
      Bodies.fromVertices(
        length / 4 + pocketSize / 4,
        width / 2 + railWidth / 2,
        verticesForHorizontal,
        options
      ),
      // left
      Bodies.fromVertices(
        -length / 2 - railWidth / 2,
        0,
        verticesForVertical,
        Object.assign(options, { angle: 0 })
      ),
      // right
      Bodies.fromVertices(
        length / 2 + railWidth / 2,
        0,
        verticesForVertical,
        Object.assign(options, { angle: PI })
      ),
    ];

    // Combine the parts into one static body
    this.body = Body.create({
      parts: parts,
      isStatic: true,
      label: "RailCompound",
    });

    World.add(world, this.body);

    /**
     * Render the table and its components
     */
    this.draw = function () {
      // draw table
      push();
      translate(window.innerWidth / 2, window.innerHeight / 2);
      // rails
      noStroke();
      fill(railColor);
      rect(0, 0, length + railWidth * 4, width + railWidth * 4);
      // table
      noStroke();
      fill(color);
      rect(0, 0, length + railWidth * 2, width + railWidth * 2);
      // lines
      stroke(255);
      strokeWeight(2);
      noFill();
      line(-length * 0.3, -width / 2, -length * 0.3, width / 2);
      arc(-length * 0.3, 0, width / 3, width / 3, PI / 2, (PI * 3) / 2);
      // background of pockets
      noStroke();
      fill(255, 255, 0);
      const positions = [
        {
          x: -length / 2 - railWidth,
          y: -width / 2 - railWidth,
        },
        {
          x: -width / 2 - railWidth,
          y: -length / 2 - railWidth,
        },
        {
          x: -length / 2 - railWidth,
          y: -width / 2 - railWidth,
        },
        {
          x: -width / 2 - railWidth,
          y: -length / 2 - railWidth,
        },
      ];
      for (let i = 0; i < positions.length; i++) {
        drawCornerBackground(positions[i], (PI * i) / 2);
      }
      rect(0, -width / 2 - (railWidth * 3) / 2, railWidth * 2, railWidth);
      rect(0, width / 2 + (railWidth * 3) / 2, railWidth * 2, railWidth);
      // pockets
      noStroke();
      fill(0);
      for (const position of pocketsPos) {
        ellipse(position.x, position.y, pocketSize);
      }

      for (let i = 0; i < 4; i++) {
        if (i % 2 === 0) {
          // left
          drawTrapezoid(
            length / 2 - pocketSize / 2,
            railWidth,
            leftDeg,
            rightDeg,
            "#06402B",
            {
              x: -length / 4 - pocketSize / 4,
              y: (width / 2 + railWidth / 2) * (i - 1),
            },
            (PI * i) / 2
          );
          // right
          drawTrapezoid(
            length / 2 - pocketSize / 2,
            railWidth,
            leftDeg,
            rightDeg,
            "#06402B",
            {
              x: length / 4 + pocketSize / 4,
              y: (width / 2 + railWidth / 2) * (i - 1),
            },
            (PI * i) / 2
          );
        } else {
          drawTrapezoid(
            width,
            railWidth,
            leftDeg,
            rightDeg,
            "#06402B",
            {
              x: (tableLength / 2 + railWidth / 2) * (2 - i),
              y: 0,
            },
            (PI * i) / 2
          );
        }
      }
      pop();
    };

    this.sinkedMap = new Map();

    /**
     * Check if any ball has entered any pocket
     * If sinked, convert the ball to invisiable
     */
    this.sinkCheck = function () {
      for (const ball of Ball.balls) {
        for (let j = 0; j < pocketsPos.length; j++) {
          const translateX = window.innerWidth / 2 + pocketsPos[j].x;
          const translateY = window.innerHeight / 2 + pocketsPos[j].y;

          // check distance between ball and pocket center
          if (
            dist(
              ball.body.position.x,
              ball.body.position.y,
              translateX,
              translateY
            ) <
            ball.size / 2
          ) {
            // Trigger effect
            if (ball.visiable) Particle.callEffect("sink", [ball]);

            // Disable collision and conver to invisiable
            Body.set(ball, "isSensor", true);
            ball.visiable = false;
            Body.setVelocity(ball.body, { x: 0, y: 0 });

            // set the ball into sinkMap
            this.sinkedMap.set(ball.id, ball);
          }
        }
      }
    };

    // drawing helper function
    function drawTrapezoid(
      length,
      width,
      leftDeg,
      rightDeg,
      color,
      position = { x: 0, y: 0 },
      rotateDeg = 0
    ) {
      push();
      translate(position.x, position.y);
      rotate(rotateDeg);
      noStroke();
      fill(color);
      beginShape();
      vertex(-length / 2, -width / 2);
      vertex(length / 2, -width / 2);
      vertex(length / 2 - width / tan(rightDeg), width / 2);
      vertex(-length / 2 + width / tan(leftDeg), width / 2);
      vertex(-length / 2, -width / 2);
      endShape();
      pop();
    }

    function drawCornerBackground(position, deg) {
      var extendSize = pocketSize * 0.4;

      push();
      rotate(deg);
      translate(position.x, position.y);
      beginShape();
      vertex(0, extendSize);
      vertex(-ballSize, extendSize);
      vertex(-ballSize, -ballSize);
      vertex(extendSize, -ballSize);
      vertex(extendSize, 0);
      vertex(0, 0);
      vertex(0, extendSize);
      endShape();
      pop();
    }
  }

  static #bumpers = [];
  static #bumperWidth = window.innerWidth * 0.0085;
  static #bumperOptions = {
    isStatic: true,
    ccd: true,
    restitution: 2,
    label: "Wall",
  };
  /**
   * Helper function
   * Ensures generated bumpers do not overlap with balls or other bumpers.
   * @param {2D vector} position - the position of the bumper
   * @param {Number} length - length of the bumper
   * @returns 
   */
  static #isBumperPositionVaild(position, length) {
    const offsetPosition = {
      x: position.x + window.innerWidth / 2,
      y: position.y + window.innerHeight / 2,
    };

    // overlapping ball detect
    for (const ball of Ball.balls) {
      const _x = ball.body.position.x;
      const _y = ball.body.position.y;
      const minDist = length / 2 + ball.size / 2 + this.#bumperWidth / 2;
      if (dist(position.x, position.y, _x, _y) < minDist) return false;
    }
    // overlapping bumper detect
    for (const _bumper of this.#bumpers) {
      const _x = _bumper.body.position.x;
      const _y = _bumper.body.position.y;

      if (
        dist(offsetPosition.x, offsetPosition.y, _x, _y) <
        length / 2 + _bumper.length / 2
      )
        return false;
    }

    return true;
  }

  /**
   * Generate random bumpers
   * @param {Number} amount - Number of bumpers to create
   */
  static createBumper(amount) {
    for (let i = 0; i < amount; i++) {
      const position = {
        x: 0,
        y: 0,
      };
      const bumper = {
        length: undefined,
        angle: undefined,
        body: undefined,
      };

      // Attempt to find a vaild position
      while (true) {
        bumper.angle = random(-PI, PI);
        bumper.length = random(50, 300);
        position.x = random(
          -tableLength / 2 + bumper.length / 2,
          tableLength / 2 - bumper.length / 2
        );
        position.y = random(
          -tableWidth / 2 + bumper.length / 2,
          tableWidth / 2 - bumper.length / 2
        );

        if (this.#isBumperPositionVaild(position, bumper.length)) break;
      }

      bumper.body = Bodies.rectangle(
        position.x,
        position.y,
        bumper.length,
        this.#bumperWidth,
        this.#bumperOptions
      );
      Body.rotate(bumper.body, bumper.angle);

      this.#bumpers.push(bumper);
      Body.translate(bumper.body, {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      World.add(world, bumper.body);
    }
  }

  /**
   * Render function of the bumpers
   */
  static drawBumper() {
    push();
    noStroke();
    fill("#90D5FF");
    for (const bumper of this.#bumpers) {
      const position = bumper.body.position;
      push();
      translate(position.x, position.y);
      rotate(bumper.angle);
      rect(0, 0, bumper.length, this.#bumperWidth, this.#bumperWidth / 2);
      pop();
    }
    pop();
  }

  /**
   * Remove bumper from world and clear this.#bumpers
   */
  static removeBumpers() {
    if (this.#bumpers.length == 0) return;

    World.remove(
      world,
      this.#bumpers.map((bumper) => bumper.body)
    );
    this.#bumpers = [];
  }
}
