import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { Platform, StatusBar, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as ScreenOrientation from "expo-screen-orientation";
import { palette } from "./src/theme";
import { useSession } from "./src/store";
import { IntroScreen } from "./src/screens/IntroScreen";
import { LevelScreen } from "./src/screens/LevelScreen";
import { DebriefScreen } from "./src/screens/DebriefScreen";

export default function App() {
  useEffect(() => {
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    ).catch(() => {
      // No-op on platforms that do not support orientation lock.
    });
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <StatusBar
          barStyle="dark-content"
          translucent
          backgroundColor="transparent"
        />
        <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}>
          <RouterView />
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const RouterView: React.FC = () => {
  const screen = useSession((s) => s.screen);
  if (screen === "intro") return <IntroScreen />;
  if (screen === "level") return <LevelScreen />;
  return <DebriefScreen />;
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  safe: {
    flex: 1,
    backgroundColor: palette.bg,
    paddingTop: Platform.OS === "android" ? 8 : 0,
  },
});
