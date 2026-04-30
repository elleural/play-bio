import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import {
  Base,
  ErrorKind,
  LevelResult,
  MutationEffectLevelDef,
} from "../types";
import { layout, palette, typography } from "../theme";
import { Card } from "../components/Card";
import { Callout } from "../components/Callout";
import { PrimaryButton } from "../components/PrimaryButton";
import { BaseGlyph } from "../components/BaseGlyph";
import { AminoAcidToken } from "../components/AminoAcidToken";
import { newLevelDraft, recordError } from "../store";
import {
  AMINO_ACIDS,
  AminoAcidId,
  chunkCodons,
  classifyMutation,
  codonKey,
  findChangedCodon,
  MutationOutcome,
  translateMRNA,
} from "../game/codonTable";

interface Props {
  level: MutationEffectLevelDef;
  onComplete: (result: LevelResult) => void;
  hintIndex: number;
  variantIndex: number;
}

const OUTCOME_LABELS: { id: MutationOutcome; label: string; help: string }[] = [
  {
    id: "silent",
    label: "Silent",
    help: "Same protein. The new codon still codes for the same amino acid.",
  },
  {
    id: "missense",
    label: "Missense",
    help: "One amino acid is swapped for another in the protein.",
  },
  {
    id: "nonsense",
    label: "Nonsense",
    help: "A stop codon appears early. The protein is truncated.",
  },
];

export const MutationEffectLevel: React.FC<Props> = ({
  level,
  onComplete,
  hintIndex,
  variantIndex,
}) => {
  const variant = level.variants[variantIndex % level.variants.length];

  const originalCodons = useMemo(
    () => chunkCodons(variant.originalMRNA),
    [variant.originalMRNA]
  );
  const mutatedCodons = useMemo(
    () => chunkCodons(variant.mutatedMRNA),
    [variant.mutatedMRNA]
  );
  const changedIdx = useMemo(
    () => findChangedCodon(variant.originalMRNA, variant.mutatedMRNA),
    [variant.originalMRNA, variant.mutatedMRNA]
  );
  const expectedOutcome: MutationOutcome = useMemo(
    () => classifyMutation(variant.originalMRNA, variant.mutatedMRNA),
    [variant.originalMRNA, variant.mutatedMRNA]
  );

  const [origRun, setOrigRun] = useState<AminoAcidId[] | null>(null);
  const [mutRun, setMutRun] = useState<AminoAcidId[] | null>(null);
  const [pickedOutcome, setPickedOutcome] = useState<MutationOutcome | null>(null);
  const [solved, setSolved] = useState(false);

  const draftRef = useRef<LevelResult>(newLevelDraft(level.id));
  const startedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    setOrigRun(null);
    setMutRun(null);
    setPickedOutcome(null);
    setSolved(false);
    draftRef.current = newLevelDraft(level.id);
    startedAtRef.current = Date.now();
  }, [level.id, variantIndex]);

  const runOriginal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOrigRun(translateMRNA(variant.originalMRNA));
  };
  const runMutated = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMutRun(translateMRNA(variant.mutatedMRNA));
  };

  const pickOutcome = (o: MutationOutcome) => {
    if (solved) return;
    setPickedOutcome(o);
    draftRef.current = {
      ...draftRef.current,
      attempts: draftRef.current.attempts + 1,
    };
    if (o === expectedOutcome) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSolved(true);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      draftRef.current = recordError(
        draftRef.current,
        "wrong-mutation-label" as ErrorKind
      );
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

  const bothRun = origRun !== null && mutRun !== null;

  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.modeLabel}>Mutation lab</Text>
          <Text style={styles.briefText}>{level.brief}</Text>
        </View>
        <Text style={styles.subtitle}>{variant.label}</Text>
      </View>

      <View style={styles.body}>
        <Card style={styles.lane}>
          <View style={styles.laneHeader}>
            <Text style={styles.cardLabel}>Original mRNA</Text>
            <PrimaryButton
              label={origRun ? "Re-run" : "Translate"}
              onPress={runOriginal}
              variant={origRun ? "secondary" : "primary"}
            />
          </View>
          <CodonStrip
            codons={originalCodons}
            highlightIndex={changedIdx}
            variant="original"
          />
          <ProteinRow protein={origRun} />
        </Card>

        <Card style={styles.lane}>
          <View style={styles.laneHeader}>
            <Text style={styles.cardLabel}>Mutated mRNA</Text>
            <PrimaryButton
              label={mutRun ? "Re-run" : "Translate"}
              onPress={runMutated}
              variant={mutRun ? "secondary" : "primary"}
            />
          </View>
          <CodonStrip
            codons={mutatedCodons}
            highlightIndex={changedIdx}
            variant="mutated"
          />
          <ProteinRow protein={mutRun} />
        </Card>
      </View>

      <Card style={styles.outcomeCard}>
        <Text style={styles.cardLabel}>What did this mutation do?</Text>
        <View style={styles.outcomeRow}>
          {OUTCOME_LABELS.map((o) => {
            const isPicked = pickedOutcome === o.id;
            const isCorrect = solved && o.id === expectedOutcome;
            const isWrong = pickedOutcome === o.id && o.id !== expectedOutcome;
            return (
              <Pressable
                key={o.id}
                onPress={() => pickOutcome(o.id)}
                disabled={!bothRun || solved}
                style={({ pressed }) => [
                  styles.outcomeBtn,
                  isCorrect && styles.outcomeCorrect,
                  isWrong && styles.outcomeWrong,
                  pressed && { opacity: 0.85 },
                  !bothRun && { opacity: 0.5 },
                ]}
              >
                <Text style={styles.outcomeLabel}>{o.label}</Text>
                <Text style={styles.outcomeHelp}>{o.help}</Text>
              </Pressable>
            );
          })}
        </View>
        {!bothRun && (
          <Text style={styles.helperNote}>
            Translate both transcripts first, then label the outcome.
          </Text>
        )}
        {pickedOutcome && pickedOutcome !== expectedOutcome && !solved && (
          <Text style={styles.wrongNote}>
            Not quite. Compare the two protein chains carefully and try again.
          </Text>
        )}
      </Card>

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
              title={`${expectedOutcome.charAt(0).toUpperCase()}${expectedOutcome.slice(1)} mutation`}
              body={`${level.successDebrief}\n\n${OUTCOME_LABELS.find((o) => o.id === expectedOutcome)?.help ?? ""}`}
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

const CodonStrip: React.FC<{
  codons: Base[][];
  highlightIndex: number | null;
  variant: "original" | "mutated";
}> = ({ codons, highlightIndex }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    <View style={styles.codonRow}>
      {codons.map((c, i) => {
        const isChanged = highlightIndex === i;
        return (
          <View
            key={`codon-${i}`}
            style={[
              styles.codonCell,
              isChanged && styles.codonChanged,
            ]}
          >
            <View style={styles.codonBases}>
              {c.map((b, j) => (
                <BaseGlyph key={`base-${i}-${j}`} base={b} size={28} />
              ))}
            </View>
            <Text style={styles.codonText}>{codonKey(c)}</Text>
          </View>
        );
      })}
    </View>
  </ScrollView>
);

const ProteinRow: React.FC<{ protein: AminoAcidId[] | null }> = ({
  protein,
}) => (
  <View>
    <Text style={[styles.cardLabel, { marginTop: 4 }]}>Polypeptide</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.proteinRow}>
        {protein === null ? (
          <Text style={styles.placeholderText}>(translate to see)</Text>
        ) : protein.length === 0 ? (
          <Text style={styles.placeholderText}>(no protein produced)</Text>
        ) : (
          protein.map((aa, i) => (
            <AminoAcidToken key={`aa-${i}`} id={aa} size={40} />
          ))
        )}
      </View>
    </ScrollView>
  </View>
);

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
  subtitle: {
    ...typography.caption,
    color: palette.inkSoft,
    maxWidth: 280,
    textAlign: "right",
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
    flexDirection: "row",
    gap: 12,
  },
  lane: {
    flex: 1,
    paddingVertical: 12,
    gap: 8,
  },
  laneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabel: {
    ...typography.caption,
    color: palette.inkSoft,
  },
  codonRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  codonCell: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.rule,
    backgroundColor: palette.bg,
    alignItems: "center",
    gap: 4,
  },
  codonChanged: {
    borderColor: palette.warn,
    backgroundColor: palette.warnSoft,
  },
  codonBases: {
    flexDirection: "row",
    gap: 2,
  },
  codonText: {
    ...typography.caption,
    fontFamily: "Menlo",
    fontSize: 11,
    color: palette.ink,
  },
  proteinRow: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 4,
    minHeight: 56,
    alignItems: "center",
  },
  placeholderText: {
    ...typography.caption,
    color: palette.inkSoft,
  },
  outcomeCard: {
    paddingVertical: 12,
    gap: 8,
  },
  outcomeRow: {
    flexDirection: "row",
    gap: 10,
  },
  outcomeBtn: {
    flex: 1,
    backgroundColor: palette.panel,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.rule,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  outcomeCorrect: {
    borderColor: palette.success,
    backgroundColor: palette.successSoft,
  },
  outcomeWrong: {
    borderColor: palette.warn,
    backgroundColor: palette.warnSoft,
  },
  outcomeLabel: {
    ...typography.title,
    fontSize: 15,
  },
  outcomeHelp: {
    ...typography.caption,
    color: palette.inkSoft,
  },
  helperNote: {
    ...typography.caption,
    color: palette.inkSoft,
  },
  wrongNote: {
    ...typography.body,
    fontSize: 13,
    color: palette.warn,
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
