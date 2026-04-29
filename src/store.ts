import { create } from "zustand";
import { ErrorKind, LevelResult, Screen } from "./types";
import { LEVELS } from "./content/levels";

type FeedbackResponse = {
  fun?: number;
  clarity?: number;
  wouldPlayMore?: boolean;
  conceptCheck?: Record<string, string>;
  notes?: string;
};

interface SessionState {
  screen: Screen;
  currentLevelIndex: number;
  results: LevelResult[];
  feedback: FeedbackResponse;
  startGame: () => void;
  goToLevel: (idx: number) => void;
  recordResult: (r: LevelResult) => void;
  advance: () => void;
  reset: () => void;
  setFeedback: (f: Partial<FeedbackResponse>) => void;
}

const emptyResult = (levelId: string): LevelResult => ({
  levelId,
  attempts: 0,
  hintsUsed: 0,
  errorsByKind: {},
  durationMs: 0,
  completed: false,
});

export const useSession = create<SessionState>((set) => ({
  screen: "intro",
  currentLevelIndex: 0,
  results: [],
  feedback: {},
  startGame: () =>
    set({
      screen: "level",
      currentLevelIndex: 0,
      results: [],
      feedback: {},
    }),
  goToLevel: (idx) => set({ screen: "level", currentLevelIndex: idx }),
  recordResult: (r) =>
    set((s) => {
      const existingIdx = s.results.findIndex((x) => x.levelId === r.levelId);
      const next = [...s.results];
      if (existingIdx >= 0) {
        next[existingIdx] = r;
      } else {
        next.push(r);
      }
      return { results: next };
    }),
  advance: () =>
    set((s) => {
      const next = s.currentLevelIndex + 1;
      if (next >= LEVELS.length) {
        return { screen: "debrief" };
      }
      return { currentLevelIndex: next };
    }),
  reset: () =>
    set({
      screen: "intro",
      currentLevelIndex: 0,
      results: [],
      feedback: {},
    }),
  setFeedback: (f) =>
    set((s) => ({ feedback: { ...s.feedback, ...f } })),
}));

export const recordError = (
  draft: LevelResult,
  kind: ErrorKind,
  count = 1
): LevelResult => ({
  ...draft,
  errorsByKind: {
    ...draft.errorsByKind,
    [kind]: (draft.errorsByKind[kind] ?? 0) + count,
  },
});

export const newLevelDraft = (levelId: string): LevelResult =>
  emptyResult(levelId);
