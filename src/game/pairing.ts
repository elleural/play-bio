import { Base } from "../types";

export type PairingMode = "DNA" | "RNA";

export const dnaComplement = (b: Base): Base => {
  switch (b) {
    case "A":
      return "T";
    case "T":
      return "A";
    case "U":
      return "A";
    case "G":
      return "C";
    case "C":
      return "G";
  }
};

/**
 * RNA complement: when reading a DNA template to synthesize RNA, an
 * adenine on the template pairs with uracil (not thymine) on the
 * transcript. Other pairings follow the same complementarity rules.
 */
export const rnaComplement = (b: Base): Base => {
  switch (b) {
    case "A":
      return "U";
    case "T":
      return "A";
    case "U":
      return "A";
    case "G":
      return "C";
    case "C":
      return "G";
  }
};

export const complementFor = (mode: PairingMode, b: Base): Base =>
  mode === "RNA" ? rnaComplement(b) : dnaComplement(b);

export const isDnaPair = (template: Base, candidate: Base): boolean =>
  candidate === dnaComplement(template);

export const isRnaPair = (template: Base, candidate: Base): boolean =>
  candidate === rnaComplement(template);

export const isPair = (
  mode: PairingMode,
  template: Base,
  candidate: Base
): boolean => candidate === complementFor(mode, template);

export const baseFullName = (b: Base): string => {
  switch (b) {
    case "A":
      return "adenine";
    case "T":
      return "thymine";
    case "G":
      return "guanine";
    case "C":
      return "cytosine";
    case "U":
      return "uracil";
  }
};

export const bondCount = (a: Base, b: Base): 0 | 2 | 3 => {
  const pairKey = `${a}${b}`;
  if (pairKey === "AT" || pairKey === "TA") return 2;
  if (pairKey === "GC" || pairKey === "CG") return 3;
  if (pairKey === "AU" || pairKey === "UA") return 2;
  return 0;
};
