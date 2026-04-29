import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { palette, typography } from "../theme";

interface Props {
  hint: string | null;
}

export const HintBubble: React.FC<Props> = ({ hint }) => {
  if (!hint) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Hint</Text>
      <Text style={styles.body}>{hint}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.hintSoft,
    borderColor: palette.hint,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  label: {
    ...typography.caption,
    color: palette.hint,
  },
  body: {
    ...typography.body,
    fontSize: 14,
    color: palette.ink,
    flexShrink: 1,
  },
});
