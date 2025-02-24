import {
  Canvas,
  Circle,
  LinearGradient,
  Rect,
  RoundedRect,
  Shader,
  useClock,
  vec,
} from "@shopify/react-native-skia";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import {
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";
import {
  BALL_COLOR,
  BRICK_HEIGHT,
  BRICK_MIDDLE,
  BRICK_ROW_LENGTH,
  BRICK_WIDTH,
  height,
  PADDLE_HEIGHT,
  PADDLE_MIDDLE,
  PADDLE_WIDTH,
  RADIUS,
  TOTAL_BRICKS,
  width,
} from "./constants";
import { animate, createBouncingExample } from "./logic";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { shader } from "./shader";

export default function App() {
  const clock = useClock();

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

  const Brick = ({ idx, brick }) => {
    const color = useDerivedValue(() => {
      return brick.canCollide.value ? "orange" : "transparent";
    }, [brick.canCollide]);
    return (
      <RoundedRect
        key={idx}
        x={brick.x}
        y={brick.y}
        width={brick.width}
        height={brick.height}
        color={color}
        r={8}
      >
        <LinearGradient
          start={vec(5, 3000)}
          end={vec(4, 50)}
          colors={["red", "orange"]}
        />
      </RoundedRect>
    );
  };

  const bricks = Array(TOTAL_BRICKS)
    .fill(0)
    .map((_, idx) => {
      const farBrickX = BRICK_MIDDLE + BRICK_WIDTH + 50;
      const middleBrickX = BRICK_MIDDLE;
      const closeBrickX = BRICK_MIDDLE - BRICK_WIDTH - 50;
      const startingY = 60;
      const ySpacing = 45;

      let startingXPosition = -1;
      if (idx % BRICK_ROW_LENGTH === 0) {
        startingXPosition = farBrickX;
      } else if (idx % BRICK_ROW_LENGTH === 1) {
        startingXPosition = middleBrickX;
      } else if (idx % BRICK_ROW_LENGTH === 2) {
        startingXPosition = closeBrickX;
      }

      const startingYPosition =
        startingY + ySpacing * Math.floor(idx / BRICK_ROW_LENGTH);
      return {
        type: "Brick",
        id: 0,
        x: useSharedValue(startingXPosition),
        y: useSharedValue(startingYPosition),
        ax: 0,
        ay: 0,
        vx: 0,
        vy: 0,
        height: BRICK_HEIGHT,
        width: BRICK_WIDTH,
        canCollide: useSharedValue(true),
      };
    });

  createBouncingExample(circleObject);

  useFrameCallback((frameInfo) => {
    if (!frameInfo.timeSincePreviousFrame) {
      return;
    }
    animate(
      [circleObject, rectangleObject, ...bricks],
      frameInfo.timeSincePreviousFrame,
      0
    );
  });

  const uniforms = useDerivedValue(() => {
    return {
      iResolution: vec(width, height),
      iTime: clock.value * 0.0005,
    };
  }, [clock, width, height]);

  const gesture = Gesture.Pan().onChange(({ x }) => {
    rectangleObject.x.value = x - PADDLE_WIDTH / 2;
  });
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <View style={styles.container}>
          <Canvas style={{ flex: 1 }}>
            <Rect x={0} y={0} height={height} width={width}>
              <Shader source={shader} uniforms={uniforms} />
            </Rect>
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
            {bricks.map((brick, idx) => {
              console.log(idx);
              return <Brick key={idx} idx={idx} brick={brick} />;
            })}
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
