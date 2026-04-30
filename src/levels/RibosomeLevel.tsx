import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  Base,
  ErrorKind,
  LevelResult,
  RibosomeLevelDef,
} from "../types";
import { layout, palette, typography } from "../theme";
import { Card } from "../components/Card";
import { Callout } from "../components/Callout";
import { PrimaryButton } from "../components/PrimaryButton";
import { BaseGlyph } from "../components/BaseGlyph";
import { AminoAcidToken } from "../components/AminoAcidToken";
import { StabilityMeter } from "../components/StabilityMeter";
import { newLevelDraft, recordError } from "../store";
import {
  AMINO_ACIDS,
  AminoAcidId,
  chunkCodons,
  codonKey,
  lookupCodon,
} from "../game/codonTable";

interface Props {
  level: RibosomeLevelDef;
  onComplete: (result: LevelResult) => void;
  hintIndex: number;
  variantIndex: number;
}

const TRAY_AMINO_ACIDS: AminoAcidId[] = [
  "Met",
  "Phe",
  "Ala",
  "Leu",
  "Ser",
  "Gly",
  "STOP",
];

const TABLE_CODONS: { codon: string; aa: AminoAcidId }[] = [
  { codon: "AUG", aa: "Met" },
  { codon: "UUU/UUC", aa: "Phe" },
  { codon: "GCU/GCC/GCA", aa: "Ala" },
  { codon: "CUU/CUC", aa: "Leu" },
  { codon: "UCU/UCC", aa: "Ser" },
  { codon: "GGU/GGC", aa: "Gly" },
  { codon: "UGA/UAA/UAG", aa: "STOP" },
];

export const RibosomeLevel: React.FC<Props> = ({
  level,
  onComplete,
  hintIndex,
  variantIndex,
}) => {
  const variant = level.variants[variantIndex % level.variants.length];
  const codons: Base[][] = useMemo(() => chunkCodons(variant.mRNA), [variant.mRNA]);

  const [position, setPosition] = useState(0);
  const [protein, setProtein] = useState<AminoAcidId[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"info" | "success" | "warn">(
    "info"
  );
  const [solved, setSolved] = useState(false);
  const draftRef = useRef<LevelResult>(newLevelDraft(level.id));
  const startedAtRef = useRef<number>(Date.now());

  // Per-token shake values
  const shakeMet = useSharedValue(0);
  const shakePhe = useSharedValue(0);
  const shakeAla = useSharedValue(0);
  const shakeLeu = useSharedValue(0);
  const shakeSer = useSharedValue(0);
  const shakeGly = useSharedValue(0);
  const shakeStop = useSharedValue(0);
  const shakeMap: Record<AminoAcidId, SharedValue<number>> = {
    Met: shakeMet,
    Phe: shakePhe,
    Ala: shakeAla,
    Leu: shakeLeu,
    Ser: shakeSer,
    Gly: shakeGly,
    STOP: shakeStop,
  };

  useEffect(() => {
    setPosition(0);
    setProtein([]);
    setFeedback(null);
    setSolved(false);
    draftRef.current = newLevelDraft(level.id);
    startedAtRef.current = Date.now();
  }, [level.id, variantIndex]);

  const onPickAA = (aa: AminoAcidId) => {
    if (solved) return;
    const codon = codons[position];
    if (!codon || codon.length < 3) return;
    const expected = lookupCodon(codon);
    draftRef.current = {
      ...draftRef.current,
      attempts: draftRef.current.attempts + 1,
    };
    if (aa === expected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const nextProtein = [...protein, aa];
      setProtein(nextProtein);
      const nextPos = position + 1;
      setFeedbackTone("success");
      setFeedback(
        aa === "STOP"
          ? "Stop codon reached. Translation ends."
          : `${codonKey(codon)} → ${AMINO_ACIDS[aa].full}.`
      );
      if (aa === "STOP" || nextPos >= codons.length) {
        setSolved(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setPosition(nextPos);
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      shakeMap[aa].value = withSequence(
        withTiming(8, { duration: 60 }),
        withTiming(-8, { duration: 60 }),
        withTiming(6, { duration: 60 }),
        withTiming(0, { duration: 60 })
      );
      setFeedbackTone("warn");
      setFeedback(
        expected
          ? `${codonKey(codon)} codes for ${AMINO_ACIDS[expected].short}, not ${AMINO_ACIDS[aa].short}. Check the table.`
          : `${codonKey(codon)} is not in the codon table.`
      );
      draftRef.current = recordError(draftRef.current, "wrong-codon" as ErrorKind);
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

  const meter = solved ? 1 : position / Math.max(codons.length, 1);

  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.modeLabel}>Ribosome workshop</Text>
          <Text style={styles.briefText}>{level.brief}</Text>
        </View>
        <View style={styles.meterWrap}>
          <StabilityMeter
            value={meter}
            label="Translation progress"
            hint={
              solved
                ? "Polypeptide complete."
                : `Codon ${Math.min(position + 1, codons.length)} of ${codons.length}.`
            }
            width={undefined as unknown as number}
          />
        </View>
      </View>

      <View style={styles.body}>
        <Card style={styles.ribosomeCard}>
          <Text style={styles.cardLabel}>mRNA</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.codonRow}>
              {codons.map((c, i) => {
                const isCurrent = i === position && !solved;
                const isDone = i < position || (solved && i <= position);
                return (
                  <View
                    key={`codon-${i}`}
                    style={[
                      styles.codonCell,
                      isCurrent && styles.codonCurrent,
                      isDone && styles.codonDone,
                    ]}
                  >
                    <View style={styles.codonBases}>
                      {c.map((b, j) => (
                        <BaseGlyph
                          key={`codon-${i}-b-${j}`}
                          base={b}
                          size={32}
                          faded={isDone && !isCurrent}
                        />
                      ))}
                    </View>
                    <Text style={styles.codonText}>{codonKey(c)}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.proteinHeader}>
            <Text style={styles.cardLabel}>Polypeptide chain</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.proteinRow}>
              {protein.length === 0 ? (
                <Text style={styles.placeholderText}>(empty — start with Met)</Text>
              ) : (
                protein.map((aa, i) => (
                  <View key={`aa-${i}`} style={styles.proteinTile}>
                    <AminoAcidToken id={aa} size={48} />
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </Card>

        <View style={styles.sidebar}>
          <Card style={styles.tableCard}>
            <Text style={styles.cardLabel}>Codon table</Text>
            {TABLE_CODONS.map((row) => (
              <View key={row.codon} style={styles.tableRow}>
                <Text style={styles.tableCodon}>{row.codon}</Text>
                <Text style={styles.tableArrow}>→</Text>
                <Text
                  style={[
                    styles.tableAA,
                    { color: AMINO_ACIDS[row.aa].ink },
                  ]}
                >
                  {AMINO_ACIDS[row.aa].short}
                </Text>
              </View>
            ))}
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
        {TRAY_AMINO_ACIDS.map((aa) => (
          <ShakingTokenButton
            key={aa}
            id={aa}
            shake={shakeMap[aa]}
            disabled={solved}
            onPress={() => onPickAA(aa)}
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
        <View style={styles.continueScrim}>
          <View style={styles.continuePanel}>
            <Callout
              figure="Lab note"
              title="Polypeptide complete"
              body={level.successDebrief}
              tone="success"
            />
            <View style={styles.continueActions}>
              <PrimaryButton label="Continue" onPress={finish} />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const ShakingTokenButton: React.FC<{
  id: AminoAcidId;
  shake: SharedValue<number>;
  disabled?: boolean;
  onPress: () => void;
}> = ({ id, shake, disabled, onPress }) => {
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
        <AminoAcidToken id={id} size={48} showFull />
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
    position: "relative",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  meterWrap: {
    width: 240,
  },
  modeLabel: {
    ...typography.caption,
    color: palette.accent,
    backgroundColor: palette.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  briefText: {
    ...typography.body,
    fontSize: 13,
    color: palette.inkSoft,
  },
  body: {
    flex: 1,
    flexDirection: "row",
    gap: 14,
  },
  ribosomeCard: {
    flex: 1,
    paddingVertical: 14,
    gap: 12,
  },
  cardLabel: {
    ...typography.caption,
    color: palette.inkSoft,
  },
  codonRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 4,
  },
  codonCell: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.rule,
    backgroundColor: palette.bg,
    alignItems: "center",
    gap: 4,
    minWidth: 110,
  },
  codonCurrent: {
    borderColor: palette.accent,
    backgroundColor: palette.accentSoft,
  },
  codonDone: {
    borderColor: palette.success,
    backgroundColor: palette.successSoft,
  },
  codonBases: {
    flexDirection: "row",
    gap: 3,
  },
  codonText: {
    ...typography.caption,
    fontFamily: "Menlo",
    fontSize: 12,
    color: palette.ink,
  },
  proteinHeader: {
    marginTop: 6,
  },
  proteinRow: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 4,
    minHeight: 60,
    alignItems: "center",
  },
  placeholderText: {
    ...typography.caption,
    color: palette.inkSoft,
  },
  proteinTile: {
    alignItems: "center",
  },
  sidebar: {
    width: 220,
  },
  tableCard: {
    paddingVertical: 12,
    gap: 6,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    gap: 8,
  },
  tableCodon: {
    ...typography.caption,
    fontFamily: "Menlo",
    fontSize: 12,
    color: palette.ink,
    flex: 1,
  },
  tableArrow: {
    ...typography.caption,
    color: palette.inkSoft,
  },
  tableAA: {
    ...typography.title,
    fontSize: 13,
    minWidth: 48,
    textAlign: "right",
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
    flexWrap: "wrap",
    gap: 8,
    paddingVertical: 6,
  },
  trayBtn: {
    backgroundColor: palette.panel,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.rule,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
    minWidth: 100,
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
  continueScrim: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(31,42,54,0.35)",
    padding: 24,
    zIndex: 50,
    elevation: 10,
  },
  continuePanel: {
    backgroundColor: palette.panel,
    borderRadius: layout.cardRadius,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: palette.rule,
    width: "100%",
    maxWidth: 720,
  },
  continueActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
