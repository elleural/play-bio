import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { palette, typography } from "../theme";

interface Props {
  figure: string;
  title?: string;
  body: string;
  tone?: "info" | "success" | "warn";
}

export const Callout: React.FC<Props> = ({ figure, title, body, tone = "info" }) => {
  const bg =
    tone === "success"
      ? palette.successSoft
      : tone === "warn"
      ? palette.warnSoft
      : palette.accentSoft;
  const border =
    tone === "success"
      ? palette.success
      : tone === "warn"
      ? palette.warn
      : palette.accent;

  return (
    <View style={[styles.container, { backgroundColor: bg, borderColor: border }]}>
      <Text style={styles.figure}>{figure}</Text>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={styles.body}>{body}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 4,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  figure: {
    ...typography.figure,
    marginBottom: 4,
  },
  title: {
    ...typography.title,
    fontSize: 16,
    marginBottom: 4,
  },
  body: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
