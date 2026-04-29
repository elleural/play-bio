import React, { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Base, DiscoveryLevelDef, ErrorKind, LevelResult } from "../types";
import { layout, palette, typography } from "../theme";
import { Card } from "../components/Card";
import { Callout } from "../components/Callout";
import { PrimaryButton } from "../components/PrimaryButton";
import { Nucleotide } from "../components/Nucleotide";
import { BondLines } from "../components/BondLines";
import { StabilityMeter } from "../components/StabilityMeter";
import { newLevelDraft, recordError } from "../store";
import { baseFullName, bondCount } from "../game/pairing";

interface Props {
  level: DiscoveryLevelDef;
  onComplete: (result: LevelResult) => void;
  hintIndex: number;
}

type Trial = {
  candidate: Base;
  bonds: 0 | 2 | 3;
  caption: string;
} | null;

export const DiscoveryLevel: React.FC<Props> = ({
  level,
  onComplete,
  hintIndex,
}) => {
  const [trial, setTrial] = useState<Trial>(null);
  const [solved, setSolved] = useState(false);
  const [tested, setTested] = useState<Set<Base>>(new Set());
  const draftRef = useRef<LevelResult>(newLevelDraft(level.id));
  const startedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    draftRef.current = newLevelDraft(level.id);
    startedAtRef.current = Date.now();
    setTrial(null);
    setSolved(false);
    setTested(new Set());
  }, [level.id]);

  const onTryCandidate = (candidate: Base) => {
    if (solved) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const bonds = bondCount(level.fixedBase, candidate);
    const caption =
      bonds === 0
        ? `${baseFullName(level.fixedBase)} and ${baseFullName(
            candidate
          )} cannot form stable hydrogen bonds.`
        : `${baseFullName(level.fixedBase)} and ${baseFullName(
            candidate
          )} form ${bonds} hydrogen bonds.`;
    setTrial({ candidate, bonds, caption });
    const next = new Set(tested);
    next.add(candidate);
    setTested(next);
    draftRef.current = {
      ...draftRef.current,
      attempts: draftRef.current.attempts + 1,
    };
    if (bonds > 0) {
      setSolved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      const errorKind: ErrorKind = "wrong-pair";
      draftRef.current = recordError(draftRef.current, errorKind);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const finish = () => {
    const result: LevelResult = {
      ...draftRef.current,
      durationMs: Date.now() - startedAtRef.current,
      hintsUsed: hintIndex + 1 > 0 ? hintIndex + 1 : 0,
      completed: true,
    };
    onComplete(result);
  };

  const stabilityValue = trial && trial.bonds > 0 ? trial.bonds / 3 : 0;
  const stabilityHint = trial
    ? trial.bonds === 0
      ? "No stable bonds at this position."
      : `${trial.bonds} of a possible 3 hydrogen bonds.`
    : "Try a candidate to see what happens.";

  return (
    <View style={styles.root}>
      <View style={styles.chamberRow}>
        <View style={styles.chamberLeft}>
          <Card style={styles.chamberCard}>
            <Text style={styles.chamberCaption}>Bond chamber</Text>
            <View style={styles.chamberBody}>
              <View style={styles.fixedSlot}>
                <Nucleotide base={level.fixedBase} size={84} />
                <Text style={styles.molLabel}>
                  {level.fixedBase} ({baseFullName(level.fixedBase)})
                </Text>
                <Text style={styles.molSublabel}>fixed</Text>
              </View>

              <View style={styles.bondZone}>
                {trial && trial.bonds > 0 ? (
                  <BondLines count={trial.bonds as 2 | 3} length={48} />
                ) : trial && trial.bonds === 0 ? (
                  <Text style={styles.brokenBondText}>no bond</Text>
                ) : (
                  <Text style={styles.bondZonePrompt}>?</Text>
                )}
              </View>

              <View style={styles.testSlot}>
                {trial ? (
                  <BouncingNucleotide
                    base={trial.candidate}
                    bonded={trial.bonds > 0}
                    key={`${trial.candidate}-${trial.bonds}-${tested.size}`}
                  />
                ) : (
                  <View style={styles.placeholderSlot}>
                    <Text style={styles.placeholderText}>candidate</Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={styles.captionText}>
              {trial?.caption ?? "Tap a candidate at right to test."}
            </Text>
          </Card>

          <View style={{ marginTop: 12 }}>
            <StabilityMeter
              value={stabilityValue}
              label="Pair stability"
              hint={stabilityHint}
              width={undefined as unknown as number}
            />
          </View>
        </View>

        <View style={styles.candidatesCol}>
          <Text style={styles.candidatesHeader}>Candidates</Text>
          {level.candidates.map((c) => {
            const wasTested = tested.has(c);
            const lastTried = trial?.candidate === c;
            const wasFailed = wasTested && bondCount(level.fixedBase, c) === 0;
            const wasSuccess = wasTested && bondCount(level.fixedBase, c) > 0;
            return (
              <Pressable
                key={c}
                onPress={() => onTryCandidate(c)}
                disabled={solved && !lastTried}
                style={({ pressed }) => [
                  styles.candidateBtn,
                  wasFailed && styles.candidateFailed,
                  wasSuccess && styles.candidateSuccess,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Nucleotide base={c} size={56} />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.candidateLabel}>
                    {c} — {baseFullName(c)}
                  </Text>
                  <Text style={styles.candidateHint}>
                    {wasSuccess
                      ? "stable pair"
                      : wasFailed
                      ? "no stable bond"
                      : "try this one"}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {hintIndex >= 0 && level.hints[hintIndex] ? (
        <View style={styles.hintBubble}>
          <Text style={styles.hintLabel}>Hint</Text>
          <Text style={styles.hintText}>{level.hints[hintIndex]}</Text>
        </View>
      ) : null}

      {solved && (
        <View style={styles.successPanel}>
          <Callout
            figure="Lab note"
            title="Stable pair found"
            body={level.successDebrief}
            tone="success"
          />
          <View style={styles.successActions}>
            <PrimaryButton label="Continue" onPress={finish} />
          </View>
        </View>
      )}

      <View style={styles.briefStrip}>
        <Text style={styles.modeLabel}>Discovery</Text>
        <Text style={styles.briefText}>{level.brief}</Text>
      </View>
    </View>
  );
};

const BouncingNucleotide: React.FC<{ base: Base; bonded: boolean }> = ({
  base,
  bonded,
}) => {
  const tx = useSharedValue(40);
  const wobble = useSharedValue(0);

  useEffect(() => {
    if (bonded) {
      tx.value = withSpring(0, { damping: 18, stiffness: 220 });
    } else {
      // wobble then snap back
      wobble.value = withSequence(
        withTiming(8, { duration: 80, easing: Easing.linear }),
        withTiming(-8, { duration: 80, easing: Easing.linear }),
        withTiming(6, { duration: 80, easing: Easing.linear }),
        withTiming(0, { duration: 80, easing: Easing.linear })
      );
      tx.value = withSequence(
        withTiming(0, { duration: 120 }),
        withTiming(40, { duration: 220 })
      );
    }
  }, [bonded, tx, wobble]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { rotate: `${wobble.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.bouncingWrap, style]}>
      <Nucleotide base={base} size={72} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
    borderRadius: layout.cardRadius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    position: "relative",
  },
  chamberRow: {
    flexDirection: "row",
    gap: 16,
    flex: 1,
  },
  chamberLeft: {
    flex: 1,
  },
  chamberCard: {
    paddingVertical: 18,
    paddingHorizontal: 18,
    gap: 10,
  },
  chamberCaption: {
    ...typography.caption,
    color: palette.inkSoft,
  },
  chamberBody: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 18,
  },
  fixedSlot: {
    alignItems: "center",
    gap: 6,
  },
  molLabel: {
    ...typography.title,
    fontSize: 14,
  },
  molSublabel: {
    ...typography.caption,
    color: palette.inkSoft,
  },
  bondZone: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  brokenBondText: {
    ...typography.caption,
    color: palette.warn,
  },
  bondZonePrompt: {
    ...typography.display,
    color: palette.inkSoft,
  },
  testSlot: {
    alignItems: "center",
    minHeight: 90,
    justifyContent: "center",
  },
  placeholderSlot: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: palette.rule,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    ...typography.caption,
    color: palette.inkSoft,
  },
  captionText: {
    ...typography.body,
    fontSize: 13,
    color: palette.ink,
    textAlign: "center",
    marginTop: 6,
  },
  candidatesCol: {
    width: 260,
    gap: 8,
  },
  candidatesHeader: {
    ...typography.caption,
    color: palette.inkSoft,
  },
  candidateBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.panel,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.rule,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  candidateFailed: {
    borderColor: palette.warn,
    backgroundColor: palette.warnSoft,
  },
  candidateSuccess: {
    borderColor: palette.success,
    backgroundColor: palette.successSoft,
  },
  candidateLabel: {
    ...typography.title,
    fontSize: 14,
  },
  candidateHint: {
    ...typography.caption,
    color: palette.inkSoft,
  },
  bouncingWrap: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  hintBubble: {
    backgroundColor: palette.hintSoft,
    borderColor: palette.hint,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  hintLabel: {
    ...typography.caption,
    color: palette.hint,
  },
  hintText: {
    ...typography.body,
    fontSize: 13,
    flexShrink: 1,
  },
  successPanel: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 60,
    backgroundColor: palette.panel,
    borderRadius: layout.cardRadius,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: palette.rule,
  },
  successActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  briefStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 4,
  },
  modeLabel: {
    ...typography.caption,
    color: palette.accent,
    backgroundColor: palette.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  briefText: {
    ...typography.body,
    fontSize: 13,
    color: palette.inkSoft,
    flexShrink: 1,
  },
});
