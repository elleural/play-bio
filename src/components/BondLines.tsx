import React from "react";
import { StyleSheet, View } from "react-native";
import { palette } from "../theme";

interface Props {
  count: 2 | 3;
  length?: number;
  color?: string;
  vertical?: boolean;
}

/**
 * Visualizes hydrogen bonds between two paired bases.
 * - A-T pairs use 2 bonds.
 * - G-C pairs use 3 bonds.
 */
export const BondLines: React.FC<Props> = ({
  count,
  length = 36,
  color = palette.success,
  vertical = false,
}) => {
  const bonds = Array.from({ length: count });
  return (
    <View
      style={[
        styles.container,
        vertical ? { width: 14, height: length } : { width: length, height: 14 },
        { flexDirection: vertical ? "row" : "column" },
      ]}
    >
      {bonds.map((_, i) => (
        <View
          key={i}
          style={[
            styles.bond,
            vertical
              ? { width: length, height: 2 }
              : { width: 2, height: length },
            { backgroundColor: color },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  bond: {
    borderRadius: 1,
    opacity: 0.85,
  },
});
