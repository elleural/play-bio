import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

interface Props {
  targetX: number;
  targetY: number;
  size?: number;
  locked?: boolean;
  onDrop: (absX: number, absY: number) => void;
  onPickUp?: () => void;
  children: React.ReactNode;
}

/**
 * Generic draggable wrapper for sugars, phosphates, bases, or any tile.
 * Mirrors DraggableTile but accepts arbitrary children so non-base parts
 * can use the same drag/spring/haptics machinery.
 */
export const DraggablePart: React.FC<Props> = ({
  targetX,
  targetY,
  size = 64,
  locked = false,
  onDrop,
  onPickUp,
  children,
}) => {
  const baseX = useSharedValue(targetX);
  const baseY = useSharedValue(targetY);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const lift = useSharedValue(0);

  useEffect(() => {
    // Snap back / move to new home with a quick spring so misdrops do not
    // visually linger at a wrong location.
    baseX.value = withSpring(targetX, {
      mass: 0.4,
      stiffness: 320,
      damping: 22,
    });
    baseY.value = withSpring(targetY, {
      mass: 0.4,
      stiffness: 320,
      damping: 22,
    });
  }, [targetX, targetY, baseX, baseY]);

  const triggerHaptic = () => {
    Haptics.selectionAsync();
  };
  const reportDrop = (x: number, y: number) => onDrop(x, y);
  const reportPickUp = () => onPickUp?.();

  const pan = Gesture.Pan()
    .enabled(!locked)
    .onStart(() => {
      lift.value = withSpring(1, { mass: 0.4, stiffness: 200, damping: 15 });
      runOnJS(triggerHaptic)();
      runOnJS(reportPickUp)();
    })
    .onUpdate((e) => {
      dragX.value = e.translationX;
      dragY.value = e.translationY;
    })
    .onEnd((e) => {
      const finalX = baseX.value + e.translationX;
      const finalY = baseY.value + e.translationY;
      baseX.value = finalX;
      baseY.value = finalY;
      dragX.value = 0;
      dragY.value = 0;
      lift.value = withSpring(0);
      runOnJS(reportDrop)(finalX, finalY);
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: baseX.value + dragX.value },
      { translateY: baseY.value + dragY.value },
      { scale: 1 + lift.value * 0.08 },
    ],
    shadowOpacity: 0.18 + lift.value * 0.4,
    zIndex: lift.value > 0 ? 10 : 1,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[styles.dragContainer, { width: size, height: size }, animStyle]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  dragContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
});
