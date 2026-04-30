export type DnaBase = "A" | "T" | "G" | "C";
export type RnaBase = "A" | "U" | "G" | "C";
export type Base = "A" | "T" | "G" | "C" | "U";

export type StrandKind = "DNA" | "RNA";

export interface ConceptRef {
  id: string;
  name: string;
  campbellRef: string;
  oneLine: string;
  explanation: string;
}

export type LevelKind =
  | "briefing"
  | "discovery"
  | "build"
  | "repair"
  | "codon"
  | "ribosome"
  | "mutation-effect";

export interface BriefingLevelDef {
  kind: "briefing";
  id: string;
  title: string;
  brief: string;
  conceptIds: string[];
  successDebrief: string;
  estSeconds: number;
}

export interface DiscoveryStep {
  fixedBase: Base;
  candidates: Base[];
  /** Caption shown after the player finds the stable partner. */
  partnerCaption: string;
}

export interface DiscoveryLevelDef {
  kind: "discovery";
  id: string;
  title: string;
  brief: string;
  steps: DiscoveryStep[];
  conceptIds: string[];
  successDebrief: string;
  hints: string[];
  estSeconds: number;
}

export interface BuildLevelDef {
  kind: "build";
  id: string;
  title: string;
  brief: string;
  template: Base[];
  trayPool: Base[];
  /**
   * Whether the polymerase synthesizes a DNA product or an RNA transcript.
   * RNA mode pairs A on the template with U (instead of T) and labels the
   * product strand as the RNA transcript.
   */
  productKind: StrandKind;
  conceptIds: string[];
  successDebrief: string;
  hints: string[];
  estSeconds: number;
  guided?: boolean;
}

export interface RepairLevelDef {
  kind: "repair";
  id: string;
  title: string;
  brief: string;
  template: Base[];
  startingProduct: Base[];
  errorPositions: number[];
  trayPool: Base[];
  conceptIds: string[];
  successDebrief: string;
  hints: string[];
  estSeconds: number;
}

export interface CodonLevelDef {
  kind: "codon";
  id: string;
  title: string;
  brief: string;
  /** Variants used for replayability; first variant is shown on first play. */
  variants: { mRNA: Base[] }[];
  conceptIds: string[];
  successDebrief: string;
  hints: string[];
  estSeconds: number;
}

export interface RibosomeLevelDef {
  kind: "ribosome";
  id: string;
  title: string;
  brief: string;
  variants: { mRNA: Base[] }[];
  conceptIds: string[];
  successDebrief: string;
  hints: string[];
  estSeconds: number;
}

export interface MutationEffectLevelDef {
  kind: "mutation-effect";
  id: string;
  title: string;
  brief: string;
  variants: {
    label: string;
    originalMRNA: Base[];
    mutatedMRNA: Base[];
  }[];
  conceptIds: string[];
  successDebrief: string;
  hints: string[];
  estSeconds: number;
}

export type LevelDef =
  | BriefingLevelDef
  | DiscoveryLevelDef
  | BuildLevelDef
  | RepairLevelDef
  | CodonLevelDef
  | RibosomeLevelDef
  | MutationEffectLevelDef;

export type ErrorKind =
  | "wrong-pair"
  | "missed-mismatch"
  | "fixed-correct-base"
  | "wrong-codon"
  | "wrong-frame"
  | "wrong-mutation-label";

export interface LevelResult {
  levelId: string;
  attempts: number;
  hintsUsed: number;
  errorsByKind: Partial<Record<ErrorKind, number>>;
  durationMs: number;
  completed: boolean;
}

export type Screen = "intro" | "level" | "debrief";
