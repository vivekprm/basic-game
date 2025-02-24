import {
  height,
  MAX_SPEED,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
  RADIUS,
  width,
} from "./constants";

export const createBouncingExample = (circleObject) => {
  "worklet";
  circleObject.x.value = 100;
  circleObject.y.value = 450;
  circleObject.r = RADIUS;
  circleObject.ax = 0.5;
  circleObject.ay = 1;
  circleObject.vx = 0;
  circleObject.vy = 0;
};

function circleRect(cx, cy, rx, ry, rw, rh) {
  "worklet";
  // temporary variables to set edges for testing
  let testX = cx;
  let testY = cy;

  // Which edge is the closest?
  if (cx < rx) {
    textX = rx; // test left edge
  } else if (cx > rx + rw) {
    textX = rx + rw; // right edge
  }

  if (cy < ry) {
    testY = ry; //top edge
  } else if (cy > ry + rh) {
    testY = ry + rh; // bottom edge
  }

  // get distance from the closest edges
  let distX = cx - testX;
  let distY = cy - testY;
  let distance = Math.sqrt(distX * distX + distY * distY);
  // If the distance is less than redius, collision
  if (distance <= RADIUS) {
    return true;
  }
  return false;
}

export const checkCollision = (o1, o2) => {
  "worklet";
  if (
    (o1.type === "Circle" && o2.type === "Paddle") ||
    (o1.type === "Circle" && o2.type === "Brick")
  ) {
    if (o2.type === "Brick") {
      const brick = o2;
      if (!brick.canCollide.value) {
        return {
          collisionInfo: null,
          collided: false,
        };
      }
    }
    const dx = o2.x.value - o1.x.value;
    const dy = o2.y.value - o1.y.value;
    const d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

    const circleObject = o1;
    const rectangleObject = o2;

    const isCollision = circleRect(
      circleObject.x.value,
      circleObject.y.value,
      rectangleObject.x.value,
      rectangleObject.y.value,
      PADDLE_WIDTH,
      PADDLE_HEIGHT
    );
    if (isCollision) {
      if (o2.type === "Brick") {
        const brick = o2;
        brick.canCollide.value = false;
      }
      return {
        collisionInfo: { o1, o2, dx, dy, d },
        collided: true,
      };
    }
  }
  return {
    collisionInfo: null,
    collided: false,
  };
};

export const resolveCollisionWithBounce = (info) => {
  "worklet";
  const circleInfo = info.o1;
  circleInfo.y.value = circleInfo.y.value - circleInfo.r;
  circleInfo.vx = circleInfo.vx;
  circleInfo.ax = circleInfo.ax;
  circleInfo.vy = -circleInfo.vy;
  circleInfo.ay = -circleInfo.ay;
};

export const resolveWallCollision = (circleObject) => {
  "worklet";
  // Right wall Collision
  if (circleObject.x.value + circleObject.r > width) {
    circleObject.x.value = width - circleObject.r * 2;
    circleObject.vx = -circleObject.vx;
    circleObject.ax = -circleObject.ax;
  }
  // Bottom wall Collision
  else if (circleObject.y.value + circleObject.r > height) {
    circleObject.y.value = height - circleObject.r * 2;
    circleObject.vy = -circleObject.vy;
    circleObject.ay = -circleObject.ay;
  }
  // Left wall Collision
  else if (circleObject.x.value - circleObject.r < 0) {
    circleObject.x.value = circleObject.r * 2;
    circleObject.vx = -circleObject.vx;
    circleObject.ax = -circleObject.ax;
  }
  // Top wall Collision
  else if (circleObject.y.value - circleObject.r < 0) {
    circleObject.y.value = circleObject.r * 2;
    circleObject.vy = -circleObject.vy;
    circleObject.ay = -circleObject.ay;
  }
};

const move = (object, dt) => {
  "worklet";
  object.vx += object.ax * dt;
  object.vy += object.ay * dt;

  if (object.vx > MAX_SPEED) {
    object.vx = MAX_SPEED;
  }
  if (object.vx < -MAX_SPEED) {
    object.vx = -MAX_SPEED;
  }
  if (object.vy > MAX_SPEED) {
    object.vy = MAX_SPEED;
  }
  if (object.vy < -MAX_SPEED) {
    object.vy = -MAX_SPEED;
  }

  object.x.value += object.vx * dt;
  object.y.value += object.vy * dt;
};

export const animate = (objects, timeSincePreviousFrame, brickCount) => {
  "worklet";
  for (const o of objects) {
    if (o.type === "Circle") {
      move(o, (0.15 / 16) * timeSincePreviousFrame);
    }
  }
  for (const o of objects) {
    if (o.type === "Circle") {
      resolveWallCollision(o);
    }
  }

  const collisions = [];

  for (const [i, o1] of objects.entries()) {
    for (const [j, o2] of objects.entries()) {
      if (i < j) {
        const { collided, collisionInfo } = checkCollision(o1, o2);
        if (collided && collisionInfo) {
          collisions.push(collisionInfo);
        }
      }
    }
  }
  for (const col of collisions) {
    resolveCollisionWithBounce(col);
  }
};
