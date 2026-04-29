import { Base } from "./types";

export const palette = {
  bg: "#F6F1E7",
  panel: "#FFFFFF",
  ink: "#1F2A36",
  inkSoft: "#56657A",
  rule: "#D9D2C2",
  accent: "#3B6E8F",
  accentSoft: "#CFE0EA",
  success: "#2E7D5B",
  successSoft: "#D6ECDF",
  warn: "#B8552B",
  warnSoft: "#F4DDCF",
  hint: "#8A6E2A",
  hintSoft: "#F1E5C4",
  shadow: "rgba(31, 42, 54, 0.12)",
};

export const baseColors: Record<Base, { fill: string; ink: string }> = {
  A: { fill: "#A8D5A2", ink: "#1B3D1A" },
  T: { fill: "#F2B5A0", ink: "#5A2110" },
  G: { fill: "#B7C9E8", ink: "#1F3C66" },
  C: { fill: "#F2D78A", ink: "#5A4310" },
  U: { fill: "#D7B6E2", ink: "#3F1F4D" },
};

export const baseLabel: Record<Base, string> = {
  A: "adenine",
  T: "thymine",
  G: "guanine",
  C: "cytosine",
  U: "uracil",
};

export const typography = {
  display: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: palette.ink,
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: palette.ink,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    color: palette.ink,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: palette.inkSoft,
    letterSpacing: 0.4,
    textTransform: "uppercase" as const,
  },
  figure: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: palette.inkSoft,
    fontStyle: "italic" as const,
  },
  baseGlyph: {
    fontSize: 22,
    fontWeight: "700" as const,
    letterSpacing: 0,
  },
};

export const layout = {
  screenPadding: 24,
  cardRadius: 18,
  tileRadius: 14,
  tileSize: 64,
  slotSize: 64,
  strandGap: 18,
};
