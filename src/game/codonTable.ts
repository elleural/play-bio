import { Base } from "../types";

/**
 * A deliberately tiny subset of the genetic code, chosen so the player can
 * actually learn a few codons through play instead of memorizing a 64-cell
 * table. Any codon not listed here is treated as "unknown" by the game.
 */

export type AminoAcidId =
  | "Met"
  | "Phe"
  | "Ala"
  | "Leu"
  | "Ser"
  | "Gly"
  | "STOP";

export interface AminoAcidInfo {
  id: AminoAcidId;
  short: string;
  full: string;
  color: string;
  ink: string;
  isStart?: boolean;
  isStop?: boolean;
}

export const AMINO_ACIDS: Record<AminoAcidId, AminoAcidInfo> = {
  Met: {
    id: "Met",
    short: "Met",
    full: "Methionine (start)",
    color: "#A8D5A2",
    ink: "#1B3D1A",
    isStart: true,
  },
  Phe: {
    id: "Phe",
    short: "Phe",
    full: "Phenylalanine",
    color: "#F2B5A0",
    ink: "#5A2110",
  },
  Ala: {
    id: "Ala",
    short: "Ala",
    full: "Alanine",
    color: "#B7C9E8",
    ink: "#1F3C66",
  },
  Leu: {
    id: "Leu",
    short: "Leu",
    full: "Leucine",
    color: "#F2D78A",
    ink: "#5A4310",
  },
  Ser: {
    id: "Ser",
    short: "Ser",
    full: "Serine",
    color: "#D7B6E2",
    ink: "#3F1F4D",
  },
  Gly: {
    id: "Gly",
    short: "Gly",
    full: "Glycine",
    color: "#C8E0CF",
    ink: "#1B3D2E",
  },
  STOP: {
    id: "STOP",
    short: "STOP",
    full: "Stop signal",
    color: "#444B57",
    ink: "#FFFFFF",
    isStop: true,
  },
};

export type CodonString = string;

/**
 * Subset codon table. Codons not in this map produce undefined and the
 * game treats them as unknown.
 */
export const CODON_TABLE: Record<CodonString, AminoAcidId> = {
  AUG: "Met",
  UUU: "Phe",
  UUC: "Phe",
  GCU: "Ala",
  GCC: "Ala",
  GCA: "Ala",
  CUU: "Leu",
  CUC: "Leu",
  UCU: "Ser",
  UCC: "Ser",
  GGU: "Gly",
  GGC: "Gly",
  UGA: "STOP",
  UAA: "STOP",
  UAG: "STOP",
};

export const codonKey = (codon: Base[]): CodonString => codon.join("");

export const lookupCodon = (codon: Base[]): AminoAcidId | null =>
  CODON_TABLE[codonKey(codon)] ?? null;

export const chunkCodons = (mRNA: Base[]): Base[][] => {
  const out: Base[][] = [];
  for (let i = 0; i < mRNA.length; i += 3) {
    out.push(mRNA.slice(i, i + 3));
  }
  return out;
};

export const translateMRNA = (mRNA: Base[]): AminoAcidId[] => {
  const codons = chunkCodons(mRNA);
  const protein: AminoAcidId[] = [];
  for (const codon of codons) {
    if (codon.length < 3) break;
    const aa = lookupCodon(codon);
    if (!aa) break;
    protein.push(aa);
    if (aa === "STOP") break;
  }
  return protein;
};

/** Identify which codon position (if any) differs between two equal-length mRNAs. */
export const findChangedCodon = (a: Base[], b: Base[]): number | null => {
  const ca = chunkCodons(a);
  const cb = chunkCodons(b);
  for (let i = 0; i < Math.max(ca.length, cb.length); i++) {
    if (codonKey(ca[i] ?? []) !== codonKey(cb[i] ?? [])) return i;
  }
  return null;
};

export type MutationOutcome = "silent" | "missense" | "nonsense";

export const classifyMutation = (
  original: Base[],
  mutated: Base[]
): MutationOutcome => {
  const protA = translateMRNA(original);
  const protB = translateMRNA(mutated);
  // Compare protein sequences up to first stop in either.
  const maxLen = Math.max(protA.length, protB.length);
  for (let i = 0; i < maxLen; i++) {
    const a = protA[i];
    const b = protB[i];
    if (a === b) continue;
    if (b === "STOP" && a !== "STOP") return "nonsense";
    return "missense";
  }
  return "silent";
};
