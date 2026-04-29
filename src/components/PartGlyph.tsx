import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { palette } from "../theme";

interface PhosphateProps {
  size?: number;
  faded?: boolean;
}

/**
 * Phosphate group: round amber circle labeled "P".
 * Matches the small nubs used inside the Nucleotide component.
 */
export const PhosphateGlyph: React.FC<PhosphateProps> = ({ size = 44, faded }) => (
  <View
    style={[
      styles.phosphate,
      {
        width: size,
        height: size,
        borderRadius: size,
        opacity: faded ? 0.5 : 1,
      },
    ]}
  >
    <Text style={[styles.glyph, { fontSize: size * 0.42 }]}>P</Text>
  </View>
);

interface SugarProps {
  size?: number;
  faded?: boolean;
}

/**
 * Sugar (deoxyribose): light tan diamond labeled "S".
 */
export const SugarGlyph: React.FC<SugarProps> = ({ size = 48, faded }) => (
  <View
    style={[
      styles.sugar,
      {
        width: size,
        height: size,
        opacity: faded ? 0.5 : 1,
      },
    ]}
  >
    <Text style={[styles.sugarGlyph, { fontSize: size * 0.32 }]}>S</Text>
  </View>
);

const styles = StyleSheet.create({
  phosphate: {
    backgroundColor: "#E8C58A",
    borderWidth: 1.5,
    borderColor: "#A47424",
    alignItems: "center",
    justifyContent: "center",
  },
  sugar: {
    backgroundColor: "#E0D7C2",
    borderWidth: 1.5,
    borderColor: "#867A60",
    transform: [{ rotate: "45deg" }],
    alignItems: "center",
    justifyContent: "center",
  },
  glyph: {
    color: palette.ink,
    fontWeight: "700",
  },
  sugarGlyph: {
    color: palette.ink,
    fontWeight: "700",
    transform: [{ rotate: "-45deg" }],
  },
});
