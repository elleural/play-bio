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

export type LevelKind = "briefing" | "discovery" | "build" | "repair";

export interface BriefingLevelDef {
  kind: "briefing";
  id: string;
  title: string;
  brief: string;
  conceptIds: string[];
  successDebrief: string;
  estSeconds: number;
}

export interface DiscoveryLevelDef {
  kind: "discovery";
  id: string;
  title: string;
  brief: string;
  fixedBase: Base;
  candidates: Base[];
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

export type LevelDef =
  | BriefingLevelDef
  | DiscoveryLevelDef
  | BuildLevelDef
  | RepairLevelDef;

export type ErrorKind =
  | "wrong-pair"
  | "missed-mismatch"
  | "fixed-correct-base";

export interface LevelResult {
  levelId: string;
  attempts: number;
  hintsUsed: number;
  errorsByKind: Partial<Record<ErrorKind, number>>;
  durationMs: number;
  completed: boolean;
}

export type Screen = "intro" | "level" | "debrief";
