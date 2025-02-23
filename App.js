import { Canvas, Circle } from "@shopify/react-native-skia";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { BALL_COLOR, RADIUS } from "./constants";

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
