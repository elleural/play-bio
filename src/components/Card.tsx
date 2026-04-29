import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { layout, palette } from "../theme";

export const Card: React.FC<ViewProps> = ({ style, children, ...rest }) => (
  <View style={[styles.card, style]} {...rest}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.panel,
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: palette.rule,
    padding: 18,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
  },
});
