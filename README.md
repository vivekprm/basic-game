# Movement
Variables that we are going to use, and it of-course applies to square, circles, bricks, paddle anything in our little game:
```
X = x position
Y = y position
```
V = velocity with which any object is moving.
```
Vx = Velocity in x direction
Vy = Velocity in y direction
```
a = acceleration, how fast our object is picking up speed.
```
ax = acceleration of x
ay = acceleration of y
```

```
dt = difference in delta between frame.
```

Think of two points on a line ```(x1, y1)``` and ```(x2, y2)``` diff between these two points along the line in delta.

Now let's talk about our model movement.
```
Vx = ax * dt
Vy = ay * dt
```
Once we have our velocities calculated we are going to get our positions.
```
X = Vx * dt
Y = Vy * dt
```

```js
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
```

# Wall Collisions

(0, 0)              (w, 0)
   |------------------|
   |                  |
   |                  |
   |                  |
   |                  |
   |                  |
   |     O            |
   |                  |
   |__________________|
(0, h)               (w, h)

Now let's consider a ball within the wall boundary collides with the floor. What do we do?
We reset y as:
```
y = h - Cr * 2
```

Acceleration and velocity in y direction, we invert it:
```
ay = -ay
vy = -vy
```

What heppens if we collide with the wall on right hand side?
```
x = w - Cr * 2
vx = -vx
ax = -ax
```

```go
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
```

Below is the logic to animate:
```go
export const animate = (objects, timeSincePreviousFrame, brickCount) => {
  "worklet";
  for (const o of objects) {
    if (o.type === "Circle") {
      move(o, 0.15);
    }
  }
  for (const o of objects) {
    if (o.type === "Circle") {
      resolveWallCollision(o);
    }
  }
};
```

We call it from App component:
```js
export default function App() {
  const circleObject = {
    type: "Circle",
    id: 0,
    x: useSharedValue(0),
    y: useSharedValue(0),
    r: RADIUS,
    ax: 0,
    ay: 0,
    vx: 0,
    vy: 0,
  };
  createBouncingExample(circleObject);

  useFrameCallback((frameInfo) => {
    if (!frameInfo.timeSincePreviousFrame) {
      return;
    }
    animate([circleObject], frameInfo.timeSincePreviousFrame, 0);
  });

  return (
    <View style={styles.container}>
      <Canvas style={{ flex: 1 }}>
        <Circle
          cx={circleObject.x}
          cy={circleObject.y}
          r={RADIUS}
          color={BALL_COLOR}
        />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  titleContainer: {
    flexDirection: "row",
  },
  titleTextNormal: {
    color: "white",
    fontSize: 40,
  },
  titleTextBold: {
    color: "white",
    fontSize: 40,
  },
});
```

# Gesture
Now to add gesture we add paddle component as below:

```js
import { Canvas, Circle, RoundedRect } from "@shopify/react-native-skia";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { useFrameCallback, useSharedValue } from "react-native-reanimated";
import {
  BALL_COLOR,
  height,
  PADDLE_HEIGHT,
  PADDLE_MIDDLE,
  PADDLE_WIDTH,
  RADIUS,
} from "./constants";
import { animate, createBouncingExample } from "./logic";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

export default function App() {
  const circleObject = {
    type: "Circle",
    id: 0,
    x: useSharedValue(0),
    y: useSharedValue(0),
    r: RADIUS,
    ax: 0,
    ay: 0,
    vx: 0,
    vy: 0,
  };

  const rectangleObject = {
    type: "Paddle",
    id: "0",
    x: useSharedValue(PADDLE_MIDDLE),
    y: useSharedValue(height - 100),
    ax: 0,
    ay: 0,
    vx: 0,
    vy: 0,
    height: PADDLE_HEIGHT,
    width: PADDLE_WIDTH,
  };

  createBouncingExample(circleObject);

  useFrameCallback((frameInfo) => {
    if (!frameInfo.timeSincePreviousFrame) {
      return;
    }
    animate([circleObject], frameInfo.timeSincePreviousFrame, 0);
  });

  const gesture = Gesture.Pan().onChange(({ x }) => {
    rectangleObject.x.value = x - PADDLE_WIDTH / 2;
  });
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <View style={styles.container}>
          <Canvas style={{ flex: 1 }}>
            <Circle
              cx={circleObject.x}
              cy={circleObject.y}
              r={RADIUS}
              color={BALL_COLOR}
            />
            <RoundedRect
              x={rectangleObject.x}
              y={rectangleObject.y}
              width={rectangleObject.width}
              height={rectangleObject.height}
              color={"white"}
              r={8}
            />
          </Canvas>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  titleContainer: {
    flexDirection: "row",
  },
  titleTextNormal: {
    color: "white",
    fontSize: 40,
  },
  titleTextBold: {
    color: "white",
    fontSize: 40,
  },
});

```

However we see as soon as we move the paddle everything speeds up. We can check this by adding log in ```useFrameCallback``` callback. The reason in moving the paddle causes ```useFrameCallback``` callback to get called lot more frequently. So we need to change ```animate``` function in our logic.

```js
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
```

# Object Collisions
Now let's see how we can make collision work with Paddle.

https://www.jeffreythompson.org/collision-detection/circle-rect.php

