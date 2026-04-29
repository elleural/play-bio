import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Base } from "../types";
import { baseColors, layout, typography } from "../theme";

interface Props {
  base: Base;
  size?: number;
  faded?: boolean;
  highlighted?: boolean;
  error?: boolean;
}

export const BaseGlyph: React.FC<Props> = ({
  base,
  size = layout.tileSize,
  faded = false,
  highlighted = false,
  error = false,
}) => {
  const color = baseColors[base];
  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: size * 0.22,
          backgroundColor: color.fill,
          opacity: faded ? 0.55 : 1,
          borderColor: error
            ? "#9B2C2C"
            : highlighted
            ? "#1F2A36"
            : "rgba(31,42,54,0.18)",
          borderWidth: error || highlighted ? 2.5 : 1,
        },
      ]}
    >
      <Text
        style={[
          typography.baseGlyph,
          { color: color.ink, fontSize: size * 0.42 },
        ]}
      >
        {base}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {
    alignItems: "center",
    justifyContent: "center",
  },
});
