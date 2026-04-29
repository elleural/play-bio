import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Base } from "../types";
import { baseColors, palette, typography } from "../theme";
import { BaseGlyph } from "./BaseGlyph";

interface Props {
  base?: Base;
  size?: number;
  showParts?: boolean;
  showLabels?: boolean;
  partFocus?: "phosphate" | "sugar" | "base" | null;
  faded?: boolean;
  flipped?: boolean;
}

/**
 * A simplified textbook-style nucleotide:
 *
 *   [P]   <- phosphate
 *    |
 *   [S]   <- sugar
 *    |
 *   [BASE]
 *
 * `showParts` reveals the phosphate and sugar pieces with labels.
 * `flipped` puts the base at the top (used for the bottom strand of a
 * double-helix where the base hangs upward toward its partner).
 */
export const Nucleotide: React.FC<Props> = ({
  base,
  size = 64,
  showParts = false,
  showLabels = false,
  partFocus = null,
  faded = false,
  flipped = false,
}) => {
  const baseEl = base ? (
    <BaseGlyph base={base} size={size} faded={faded && !partFocus} />
  ) : (
    <View
      style={[
        styles.emptyBase,
        {
          width: size,
          height: size,
          borderRadius: size * 0.22,
        },
      ]}
    />
  );

  const phosphate = (
    <View
      style={[
        styles.partWrap,
        partFocus === "phosphate" && styles.partFocused,
      ]}
    >
      <View
        style={[
          styles.phosphate,
          { width: size * 0.42, height: size * 0.42 },
        ]}
      >
        <Text style={[styles.partGlyph, { fontSize: size * 0.22 }]}>P</Text>
      </View>
      {showLabels && <Text style={styles.partLabel}>phosphate</Text>}
    </View>
  );

  const sugar = (
    <View
      style={[
        styles.partWrap,
        partFocus === "sugar" && styles.partFocused,
      ]}
    >
      <View
        style={[
          styles.sugar,
          { width: size * 0.46, height: size * 0.46 },
        ]}
      >
        <Text style={[styles.partGlyph, { fontSize: size * 0.22 }]}>S</Text>
      </View>
      {showLabels && <Text style={styles.partLabel}>sugar</Text>}
    </View>
  );

  const baseLabel = base && showLabels ? (
    <Text style={[styles.partLabel, { color: baseColors[base].ink }]}>
      base ({base})
    </Text>
  ) : null;

  const stem = (
    <View style={[styles.stem, { height: size * 0.18 }]} />
  );

  if (!showParts) {
    // Compact: small phosphate-sugar nub plus the prominent base.
    return (
      <View style={[styles.compact, flipped && styles.compactFlipped]}>
        <View style={styles.compactBackboneNub}>
          <View
            style={[
              styles.phosphate,
              {
                width: size * 0.32,
                height: size * 0.32,
              },
            ]}
          />
          <View
            style={[
              styles.sugar,
              {
                width: size * 0.32,
                height: size * 0.32,
                marginTop: 2,
              },
            ]}
          />
        </View>
        <View style={[styles.compactStem, { height: 6 }]} />
        {baseEl}
      </View>
    );
  }

  return (
    <View style={[styles.full, flipped && styles.compactFlipped]}>
      {phosphate}
      {stem}
      {sugar}
      {stem}
      <View
        style={[
          styles.partWrap,
          partFocus === "base" && styles.partFocused,
        ]}
      >
        {baseEl}
        {baseLabel}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  compact: {
    alignItems: "center",
  },
  compactFlipped: {
    transform: [{ rotate: "180deg" }],
  },
  compactBackboneNub: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  compactStem: {
    width: 2,
    backgroundColor: palette.rule,
  },
  full: {
    alignItems: "center",
  },
  stem: {
    width: 2,
    backgroundColor: palette.rule,
    marginVertical: 2,
  },
  partWrap: {
    alignItems: "center",
    padding: 4,
    borderRadius: 10,
  },
  partFocused: {
    backgroundColor: palette.accentSoft,
  },
  partLabel: {
    ...typography.caption,
    color: palette.inkSoft,
    fontSize: 10,
    marginTop: 4,
    letterSpacing: 0.6,
  },
  phosphate: {
    backgroundColor: "#E8C58A",
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#A47424",
    alignItems: "center",
    justifyContent: "center",
  },
  sugar: {
    backgroundColor: "#E0D7C2",
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#867A60",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "45deg" }],
  },
  partGlyph: {
    color: palette.ink,
    fontWeight: "700",
    transform: [{ rotate: "0deg" }],
  },
  emptyBase: {
    borderWidth: 2,
    borderColor: palette.rule,
    borderStyle: "dashed",
    backgroundColor: "rgba(31,42,54,0.04)",
  },
});
