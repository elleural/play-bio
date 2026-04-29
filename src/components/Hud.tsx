import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { palette, typography } from "../theme";
import { PrimaryButton } from "./PrimaryButton";

interface Props {
  title: string;
  subtitle: string;
  onHint: () => void;
  onReset: () => void;
  hintsUsed: number;
}

export const Hud: React.FC<Props> = ({
  title,
  subtitle,
  onHint,
  onReset,
  hintsUsed,
}) => (
  <View style={styles.container}>
    <View style={styles.titleBlock}>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
    <View style={styles.actions}>
      <PrimaryButton
        label={hintsUsed > 0 ? `Hint (${hintsUsed})` : "Hint"}
        onPress={onHint}
        variant="secondary"
        style={styles.action}
      />
      <PrimaryButton
        label="Reset"
        onPress={onReset}
        variant="ghost"
        style={styles.action}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  titleBlock: {
    flexShrink: 1,
  },
  subtitle: {
    ...typography.caption,
    color: palette.inkSoft,
  },
  title: {
    ...typography.title,
    fontSize: 22,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  action: {
    minWidth: 90,
  },
});
