import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { palette, typography } from "../theme";

interface Props {
  /** 0 to 1 fill ratio. */
  value: number;
  label?: string;
  hint?: string;
  width?: number;
}

const colorForValue = (v: number): string => {
  if (v >= 0.66) return palette.success;
  if (v >= 0.34) return palette.hint;
  return palette.warn;
};

export const StabilityMeter: React.FC<Props> = ({
  value,
  label = "Strand stability",
  hint,
  width = 220,
}) => {
  const clamped = Math.max(0, Math.min(1, value));
  const color = colorForValue(clamped);
  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color }]}>{Math.round(clamped * 100)}%</Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${clamped * 100}%`, backgroundColor: color },
          ]}
        />
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.panel,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.rule,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  label: {
    ...typography.caption,
    color: palette.inkSoft,
  },
  value: {
    ...typography.title,
    fontSize: 16,
  },
  track: {
    height: 8,
    backgroundColor: "rgba(31,42,54,0.08)",
    borderRadius: 999,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
  hint: {
    ...typography.body,
    fontSize: 12,
    color: palette.inkSoft,
  },
});
