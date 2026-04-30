import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { palette, typography } from "../theme";
import { AMINO_ACIDS, AminoAcidId } from "../game/codonTable";

interface Props {
  id: AminoAcidId;
  size?: number;
  faded?: boolean;
  showFull?: boolean;
}

export const AminoAcidToken: React.FC<Props> = ({
  id,
  size = 56,
  faded = false,
  showFull = false,
}) => {
  const info = AMINO_ACIDS[id];
  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.tile,
          {
            width: size,
            height: size,
            borderRadius: size * 0.22,
            backgroundColor: info.color,
            opacity: faded ? 0.5 : 1,
          },
        ]}
      >
        <Text
          style={[
            typography.title,
            { color: info.ink, fontSize: id === "STOP" ? size * 0.28 : size * 0.32 },
          ]}
        >
          {info.short}
        </Text>
      </View>
      {showFull && (
        <Text style={styles.fullName} numberOfLines={1}>
          {info.full}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: 4,
  },
  tile: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(31,42,54,0.18)",
  },
  fullName: {
    ...typography.caption,
    fontSize: 10,
    color: palette.inkSoft,
    maxWidth: 90,
    textAlign: "center",
  },
});
