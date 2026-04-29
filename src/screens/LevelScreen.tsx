import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { palette, typography } from "../theme";
import { useSession } from "../store";
import { LEVELS } from "../content/levels";
import { Hud } from "../components/Hud";
import { Callout } from "../components/Callout";
import { PrimaryButton } from "../components/PrimaryButton";
import { BriefingLevel } from "../levels/BriefingLevel";
import { DiscoveryLevel } from "../levels/DiscoveryLevel";
import { BuildLevel } from "../levels/BuildLevel";
import { RepairLevel } from "../levels/RepairLevel";
import { conceptList } from "../content/concepts";
import { LevelDef, LevelResult } from "../types";

const modeLabel = (def: LevelDef): string => {
  switch (def.kind) {
    case "briefing":
      return "Briefing";
    case "discovery":
      return "Discovery";
    case "build":
      return "Build run";
    case "repair":
      return "Repair";
  }
};

const conceptIdsForLevel = (def: LevelDef): string[] => {
  if (def.kind === "briefing") return def.conceptIds;
  if (def.kind === "discovery") return def.conceptIds;
  if (def.kind === "build") return def.conceptIds;
  return def.conceptIds;
};

const hintsForLevel = (def: LevelDef): string[] => {
  if (def.kind === "briefing") return [];
  return def.hints;
};

export const LevelScreen: React.FC = () => {
  const idx = useSession((s) => s.currentLevelIndex);
  const recordResult = useSession((s) => s.recordResult);
  const advance = useSession((s) => s.advance);

  const def = LEVELS[idx];
  const concepts = conceptList(conceptIdsForLevel(def));

  const [hintIndex, setHintIndex] = useState<number>(-1);
  const [resetCount, setResetCount] = useState(0);
  const [result, setResult] = useState<LevelResult | null>(null);

  useEffect(() => {
    setHintIndex(-1);
    setResult(null);
  }, [idx]);

  const hints = hintsForLevel(def);

  const handleHint = () => {
    if (hints.length === 0) return;
    setHintIndex((h) => Math.min(h + 1, hints.length - 1));
  };

  const handleReset = () => {
    setResetCount((c) => c + 1);
    setHintIndex(-1);
    setResult(null);
  };

  const handleComplete = (r: LevelResult) => {
    const adjusted: LevelResult = {
      ...r,
      hintsUsed: hintIndex + 1 > 0 ? hintIndex + 1 : 0,
    };
    recordResult(adjusted);
    setResult(adjusted);
  };

  const handleNext = () => {
    advance();
  };

  const successDebrief =
    def.kind === "briefing"
      ? def.successDebrief
      : def.kind === "discovery"
      ? def.successDebrief
      : def.kind === "build"
      ? def.successDebrief
      : def.successDebrief;

  return (
    <View style={styles.root}>
      <View style={styles.hud}>
        <Hud
          title={def.title}
          subtitle={`Level ${idx + 1} of ${LEVELS.length} — ${modeLabel(def)}`}
          onHint={handleHint}
          onReset={handleReset}
          hintsUsed={Math.max(hintIndex + 1, 0)}
        />
      </View>

      <View style={styles.boardWrap}>
        <LevelBody
          def={def}
          resetCount={resetCount}
          hintIndex={hintIndex}
          onComplete={handleComplete}
        />

        {result && (
          <View style={styles.successPanel}>
            <View style={styles.successInner}>
              <Text style={styles.successKicker}>Solved</Text>
              <Text style={styles.successTitle}>{def.title}</Text>
              <Callout
                figure={`Figure ${idx + 1}.1`}
                title="What just happened"
                body={successDebrief}
                tone="success"
              />
              <View style={styles.conceptList}>
                <Text style={styles.conceptHeader}>Concepts in this level</Text>
                {concepts.map((c) => (
                  <View key={c.id} style={styles.conceptRow}>
                    <Text style={styles.conceptName}>{c.name}</Text>
                    <Text style={styles.conceptRef}>{c.campbellRef}</Text>
                    <Text style={styles.conceptOneLine}>{c.oneLine}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.statsRow}>
                <Stat
                  label="Time"
                  value={`${Math.round(result.durationMs / 1000)}s`}
                />
                <Stat label="Tries" value={String(result.attempts)} />
                <Stat label="Hints" value={String(result.hintsUsed)} />
                <Stat
                  label="Mistakes"
                  value={String(
                    Object.values(result.errorsByKind).reduce(
                      (a, b) => a + (b ?? 0),
                      0
                    )
                  )}
                />
              </View>

              <View style={styles.successCta}>
                {def.kind !== "briefing" && (
                  <PrimaryButton
                    label="Try again"
                    variant="secondary"
                    onPress={handleReset}
                  />
                )}
                <PrimaryButton
                  label={
                    idx + 1 >= LEVELS.length ? "See debrief" : "Next level"
                  }
                  onPress={handleNext}
                />
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const LevelBody: React.FC<{
  def: LevelDef;
  resetCount: number;
  hintIndex: number;
  onComplete: (r: LevelResult) => void;
}> = ({ def, resetCount, hintIndex, onComplete }) => {
  const key = `${def.id}-${resetCount}`;
  if (def.kind === "briefing") {
    return <BriefingLevel key={key} level={def} onComplete={onComplete} />;
  }
  if (def.kind === "discovery") {
    return (
      <DiscoveryLevel
        key={key}
        level={def}
        onComplete={onComplete}
        hintIndex={hintIndex}
      />
    );
  }
  if (def.kind === "build") {
    return (
      <BuildLevel
        key={key}
        level={def}
        onComplete={onComplete}
        hintIndex={hintIndex}
      />
    );
  }
  return (
    <RepairLevel
      key={key}
      level={def}
      onComplete={onComplete}
      hintIndex={hintIndex}
    />
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
    paddingHorizontal: 24,
    paddingVertical: 18,
    gap: 14,
  },
  hud: {
    paddingHorizontal: 4,
  },
  boardWrap: {
    flex: 1,
    position: "relative",
  },
  successPanel: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(31,42,54,0.45)",
    padding: 24,
  },
  successInner: {
    backgroundColor: palette.panel,
    borderRadius: 18,
    paddingHorizontal: 28,
    paddingVertical: 22,
    maxWidth: 720,
    width: "100%",
    gap: 14,
    borderWidth: 1,
    borderColor: palette.rule,
  },
  successKicker: {
    ...typography.caption,
    color: palette.success,
  },
  successTitle: {
    ...typography.display,
    fontSize: 26,
  },
  conceptList: {
    gap: 8,
  },
  conceptHeader: {
    ...typography.caption,
    color: palette.inkSoft,
  },
  conceptRow: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: palette.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.rule,
  },
  conceptName: {
    ...typography.title,
    fontSize: 15,
  },
  conceptRef: {
    ...typography.caption,
    color: palette.inkSoft,
    marginBottom: 2,
  },
  conceptOneLine: {
    ...typography.body,
    fontSize: 13,
  },
  statsRow: {
    flexDirection: "row",
    gap: 14,
  },
  stat: {
    flex: 1,
    backgroundColor: palette.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.rule,
    paddingVertical: 8,
    alignItems: "center",
  },
  statValue: {
    ...typography.title,
    fontSize: 18,
  },
  statLabel: {
    ...typography.caption,
    color: palette.inkSoft,
  },
  successCta: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
});
