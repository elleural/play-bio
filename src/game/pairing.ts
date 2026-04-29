import { Base } from "../types";

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

export const isDnaPair = (template: Base, candidate: Base): boolean =>
  candidate === dnaComplement(template);

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
