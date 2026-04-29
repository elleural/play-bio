import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Base, ErrorKind, LevelResult, RepairLevelDef } from "../types";
import { layout, palette, typography } from "../theme";
import { Card } from "../components/Card";
import { Callout } from "../components/Callout";
import { PrimaryButton } from "../components/PrimaryButton";
import { Nucleotide } from "../components/Nucleotide";
import { BondLines } from "../components/BondLines";
import { StabilityMeter } from "../components/StabilityMeter";
import { newLevelDraft, recordError } from "../store";
import { baseFullName, bondCount, dnaComplement } from "../game/pairing";

interface Props {
  level: RepairLevelDef;
  onComplete: (result: LevelResult) => void;
  hintIndex: number;
}

const TRAY: Base[] = ["A", "T", "G", "C"];

export const RepairLevel: React.FC<Props> = ({
  level,
  onComplete,
  hintIndex,
}) => {
  const [product, setProduct] = useState<Base[]>(() => level.startingProduct.slice());
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"info" | "success" | "warn">(
    "info"
  );
  const [solved, setSolved] = useState(false);
  const draftRef = useRef<LevelResult>(newLevelDraft(level.id));
  const startedAtRef = useRef<number>(Date.now());

  const shakeA = useSharedValue(0);
  const shakeT = useSharedValue(0);
  const shakeG = useSharedValue(0);
  const shakeC = useSharedValue(0);
  const shakeValues: Record<Base, SharedValue<number>> = {
    A: shakeA,
    T: shakeT,
    G: shakeG,
    C: shakeC,
    U: shakeA,
  };

  useEffect(() => {
    setProduct(level.startingProduct.slice());
    setSelected(null);
    setFeedback(null);
    setSolved(false);
    draftRef.current = newLevelDraft(level.id);
    startedAtRef.current = Date.now();
  }, [level.id]);

  const remaining = useMemo(
    () =>
      level.template.reduce(
        (count, t, i) => count + (product[i] !== dnaComplement(t) ? 1 : 0),
        0
      ),
    [level.template, product]
  );
  const totalErrors = level.errorPositions.length;
  const stability = totalErrors === 0 ? 1 : 1 - remaining / totalErrors / 1.0;

  useEffect(() => {
    if (remaining === 0 && !solved) {
      setSolved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [remaining, solved]);

  const onSelectPosition = (i: number) => {
    if (solved) return;
    Haptics.selectionAsync();
    if (product[i] === dnaComplement(level.template[i])) {
      setFeedbackTone("info");
      setFeedback(
        `Position ${i + 1} already pairs correctly (${baseFullName(level.template[i])} with ${baseFullName(product[i])}).`
      );
      setSelected(null);
      return;
    }
    setSelected(i);
    setFeedbackTone("warn");
    setFeedback(
      `Position ${i + 1}: ${baseFullName(product[i])} does not pair with ${baseFullName(level.template[i])}. Choose a replacement.`
    );
  };

  const onPickReplacement = (b: Base) => {
    if (selected === null || solved) return;
    const target = level.template[selected];
    if (!target) return;
    const expected = dnaComplement(target);
    draftRef.current = {
      ...draftRef.current,
      attempts: draftRef.current.attempts + 1,
    };
    if (b === expected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const next = product.slice();
      next[selected] = b;
      setProduct(next);
      setFeedbackTone("success");
      setFeedback(
        `Mismatch repaired. ${baseFullName(target)} now pairs with ${baseFullName(b)}.`
      );
      setSelected(null);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      shakeValues[b].value = withSequence(
        withTiming(8, { duration: 60 }),
        withTiming(-8, { duration: 60 }),
        withTiming(6, { duration: 60 }),
        withTiming(0, { duration: 60 })
      );
      setFeedbackTone("warn");
      setFeedback(
        `${baseFullName(b)} does not pair with ${baseFullName(target)}. Try another.`
      );
      draftRef.current = recordError(draftRef.current, "wrong-pair" as ErrorKind);
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

  return (
    <View style={styles.root}>
      <View style={styles.body}>
        <Card style={styles.machineCard}>
          <View style={styles.machineHeader}>
            <Text style={styles.machineTitle}>Proofreading station</Text>
            <Text style={styles.machineSub}>
              Mismatches remaining: {remaining}
            </Text>
          </View>

          <View style={styles.strandStack}>
            <View style={styles.dirRow}>
              <Text style={styles.dirTag}>3'</Text>
              <Text style={styles.roleTag}>DNA template</Text>
              <Text style={styles.dirTag}>5'</Text>
            </View>
            <View style={styles.row}>
              {level.template.map((b, i) => (
                <View key={`tpl-${i}`} style={styles.cell}>
                  <Nucleotide base={b} size={56} faded />
                </View>
              ))}
            </View>

            <View style={styles.bondRow}>
              {level.template.map((b, i) => {
                const placed = product[i];
                const correct = placed === dnaComplement(b);
                if (correct) {
                  return (
                    <View key={`bond-${i}`} style={styles.bondCell}>
                      <BondLines
                        count={bondCount(b, placed) as 2 | 3}
                        length={26}
                        vertical
                      />
                    </View>
                  );
                }
                return (
                  <View key={`bond-${i}`} style={styles.bondCell}>
                    <Text style={styles.brokenBond}>×</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.row}>
              {product.map((b, i) => {
                const correct = b === dnaComplement(level.template[i]);
                const isSelected = selected === i;
                return (
                  <Pressable
                    key={`prod-${i}`}
                    onPress={() => onSelectPosition(i)}
                    style={[
                      styles.cell,
                      styles.productCell,
                      isSelected && styles.productCellSelected,
                      !correct && !isSelected && styles.productCellWrong,
                    ]}
                  >
                    <Nucleotide base={b} size={56} flipped />
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.dirRow}>
              <Text style={styles.dirTag}>5'</Text>
              <Text style={styles.roleTag}>product (being repaired)</Text>
              <Text style={styles.dirTag}>3'</Text>
            </View>
          </View>
        </Card>

        <View style={styles.sidebar}>
          <StabilityMeter
            value={stability}
            label="Repair progress"
            hint={
              remaining === 0
                ? "All positions pair correctly."
                : `${remaining} mismatch${remaining === 1 ? "" : "es"} left.`
            }
            width={undefined as unknown as number}
          />
          <View style={{ height: 12 }} />
          <Card style={{ paddingVertical: 12 }}>
            <Text style={styles.sidebarLabel}>How to use this station</Text>
            <Text style={styles.sidebarBody}>
              {selected === null
                ? "Tap a position on the lower strand to select it, then choose a replacement base."
                : `Position ${selected + 1} selected. Tap A, T, G, or C below.`}
            </Text>
          </Card>
        </View>
      </View>

      {feedback ? (
        <View
          style={[
            styles.feedback,
            feedbackTone === "warn" && {
              backgroundColor: palette.warnSoft,
              borderColor: palette.warn,
            },
            feedbackTone === "success" && {
              backgroundColor: palette.successSoft,
              borderColor: palette.success,
            },
          ]}
        >
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      ) : null}

      <View style={styles.tray}>
        {TRAY.map((b) => (
          <ShakingBaseButton
            key={b}
            base={b}
            shake={shakeValues[b]}
            disabled={solved || selected === null}
            onPress={() => onPickReplacement(b)}
          />
        ))}
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
            title="Strand repaired"
            body={level.successDebrief}
            tone="success"
          />
          <View style={styles.successActions}>
            <PrimaryButton label="Continue" onPress={finish} />
          </View>
        </View>
      )}

      <View style={styles.briefStrip}>
        <Text style={styles.modeLabel}>Repair</Text>
        <Text style={styles.briefText}>{level.brief}</Text>
      </View>
    </View>
  );
};

const ShakingBaseButton: React.FC<{
  base: Base;
  shake: SharedValue<number>;
  disabled?: boolean;
  onPress: () => void;
}> = ({ base, shake, disabled, onPress }) => {
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));
  return (
    <Animated.View style={style}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.trayBtn,
          pressed && { opacity: 0.85 },
          disabled && { opacity: 0.4 },
        ]}
      >
        <Nucleotide base={base} size={56} />
        <Text style={styles.trayLabel}>{baseFullName(base)}</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: layout.cardRadius,
    gap: 10,
  },
  body: {
    flexDirection: "row",
    gap: 14,
    flex: 1,
  },
  machineCard: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  machineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  machineTitle: {
    ...typography.title,
    fontSize: 16,
  },
  machineSub: {
    ...typography.caption,
    color: palette.inkSoft,
  },
  strandStack: {
    paddingVertical: 6,
  },
  dirRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  dirTag: {
    ...typography.caption,
    fontFamily: "Menlo",
    fontSize: 11,
    color: palette.inkSoft,
  },
  roleTag: {
    ...typography.caption,
    color: palette.inkSoft,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  cell: {
    width: 70,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  productCell: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  productCellWrong: {
    borderColor: palette.warn,
    backgroundColor: palette.warnSoft,
  },
  productCellSelected: {
    borderColor: palette.accent,
    backgroundColor: palette.accentSoft,
  },
  bondRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 32,
    marginVertical: 4,
  },
  bondCell: {
    width: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  brokenBond: {
    color: palette.warn,
    fontWeight: "700",
    fontSize: 18,
  },
  sidebar: {
    width: 220,
  },
  sidebarLabel: {
    ...typography.caption,
    color: palette.inkSoft,
  },
  sidebarBody: {
    ...typography.body,
    fontSize: 13,
    marginTop: 4,
  },
  feedback: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderLeftWidth: 4,
    backgroundColor: palette.accentSoft,
    borderColor: palette.accent,
  },
  feedbackText: {
    ...typography.body,
    fontSize: 13,
  },
  tray: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    gap: 8,
    paddingVertical: 6,
  },
  trayBtn: {
    backgroundColor: palette.panel,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.rule,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    minWidth: 110,
    gap: 6,
  },
  trayLabel: {
    ...typography.caption,
    color: palette.ink,
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
    bottom: 80,
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
