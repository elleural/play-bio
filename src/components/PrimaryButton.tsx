import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  StyleProp,
} from "react-native";
import * as Haptics from "expo-haptics";
import { palette, typography } from "../theme";

interface Props {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const PrimaryButton: React.FC<Props> = ({
  label,
  onPress,
  variant = "primary",
  disabled,
  style,
}) => {
  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  const containerStyle = [
    styles.base,
    variant === "primary" && styles.primary,
    variant === "secondary" && styles.secondary,
    variant === "ghost" && styles.ghost,
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.label,
    variant === "primary" && styles.labelPrimary,
    variant === "secondary" && styles.labelSecondary,
    variant === "ghost" && styles.labelGhost,
    disabled && styles.labelDisabled,
  ];

  return (
    <Pressable
      onPress={disabled ? undefined : handlePress}
      style={({ pressed }) => [containerStyle, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={textStyle}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 130,
  },
  primary: {
    backgroundColor: palette.accent,
  },
  secondary: {
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.rule,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...typography.title,
    fontSize: 16,
  },
  labelPrimary: {
    color: "#FFFFFF",
  },
  labelSecondary: {
    color: palette.ink,
  },
  labelGhost: {
    color: palette.accent,
  },
  labelDisabled: {
    color: palette.inkSoft,
  },
});
