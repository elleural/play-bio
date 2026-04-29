import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Base, BuildLevelDef, ErrorKind, LevelResult } from "../types";
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
  level: BuildLevelDef;
  onComplete: (result: LevelResult) => void;
  hintIndex: number;
}

const TRAY: Base[] = ["A", "T", "G", "C"];

export const BuildLevel: React.FC<Props> = ({
  level,
  onComplete,
  hintIndex,
}) => {
  const [position, setPosition] = useState<number>(0);
  const [product, setProduct] = useState<(Base | null)[]>(() =>
    level.template.map(() => null)
  );
  const [stability, setStability] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"info" | "success" | "warn">(
    "info"
  );
  const [solved, setSolved] = useState(false);
  const draftRef = useRef<LevelResult>(newLevelDraft(level.id));
  const startedAtRef = useRef<number>(Date.now());

  // Per-button shake shared values (declared at top level to satisfy rules of hooks).
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
    setPosition(0);
    setProduct(level.template.map(() => null));
    setStability(1);
    setFeedback(null);
    setSolved(false);
    draftRef.current = newLevelDraft(level.id);
    startedAtRef.current = Date.now();
  }, [level.id, level.template]);

  const onTryBase = (b: Base) => {
    if (solved) return;
    const target = level.template[position];
    if (!target) return;
    const expected = dnaComplement(target);
    draftRef.current = {
      ...draftRef.current,
      attempts: draftRef.current.attempts + 1,
    };
    if (b === expected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const next = product.slice();
      next[position] = b;
      setProduct(next);
      const bonds = bondCount(target, b);
      setFeedbackTone("success");
      setFeedback(
        `${baseFullName(target)} + ${baseFullName(b)} → ${bonds} hydrogen bonds. Polymerase advances.`
      );
      const newPos = position + 1;
      setPosition(newPos);
      if (newPos >= level.template.length) {
        setSolved(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
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
      const newStab = Math.max(0, stability - 0.08);
      setStability(newStab);
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
            <Text style={styles.machineTitle}>DNA polymerase</Text>
            <Text style={styles.machineSub}>
              Position {Math.min(position + 1, level.template.length)} of {level.template.length}
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.strandStack}>
              {/* Direction labels */}
              <View style={styles.dirRow}>
                <Text style={styles.dirTag}>3'</Text>
                <Text style={styles.roleTag}>DNA template</Text>
                <Text style={styles.dirTag}>5'</Text>
              </View>

              <View style={styles.row}>
                {level.template.map((b, i) => (
                  <View
                    key={`tpl-${i}`}
                    style={[
                      styles.cell,
                      position === i && !solved && styles.cellHead,
                    ]}
                  >
                    <Nucleotide base={b} size={56} faded />
                  </View>
                ))}
              </View>

              {/* Bond zone */}
              <View style={styles.bondRow}>
                {level.template.map((b, i) => {
                  const placed = product[i];
                  if (placed) {
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
                    <View key={`bond-${i}`} style={styles.bondCell} />
                  );
                })}
              </View>

              <View style={styles.row}>
                {product.map((b, i) =>
                  b ? (
                    <View key={`prod-${i}`} style={styles.cell}>
                      <Nucleotide base={b} size={56} flipped />
                    </View>
                  ) : (
                    <View key={`prod-${i}`} style={styles.cell}>
                      <View style={styles.emptyProduct} />
                    </View>
                  )
                )}
              </View>

              <View style={styles.dirRow}>
                <Text style={styles.dirTag}>5'</Text>
                <Text style={styles.roleTag}>new product</Text>
                <Text style={styles.dirTag}>3'</Text>
              </View>
            </View>
          </ScrollView>
        </Card>

        <View style={styles.sidebar}>
          <StabilityMeter
            value={stability}
            label="Strand stability"
            hint={
              stability < 1
                ? "Wrong attempts loosen the local structure."
                : "All correct so far."
            }
            width={undefined as unknown as number}
          />
          <View style={{ height: 12 }} />
          <Card style={{ paddingVertical: 12 }}>
            <Text style={styles.sidebarLabel}>What polymerase wants</Text>
            <Text style={styles.sidebarBody}>
              {solved
                ? "Strand complete."
                : `A nucleotide that pairs with ${baseFullName(
                    level.template[position]!
                  )} (${level.template[position]}).`}
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
            disabled={solved}
            onPress={() => onTryBase(b)}
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
            title="Strand complete"
            body={level.successDebrief}
            tone="success"
          />
          <View style={styles.successActions}>
            <PrimaryButton label="Continue" onPress={finish} />
          </View>
        </View>
      )}

      <View style={styles.briefStrip}>
        <Text style={styles.modeLabel}>Build run</Text>
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
  },
  cellHead: {
    backgroundColor: palette.accentSoft,
    borderRadius: 12,
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
  emptyProduct: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: palette.rule,
    backgroundColor: "rgba(31,42,54,0.04)",
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
