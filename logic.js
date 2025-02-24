import { height, MAX_SPEED, RADIUS, width } from "./constants";

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
};
