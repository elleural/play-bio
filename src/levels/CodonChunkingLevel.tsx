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
  CodonLevelDef,
  LevelResult,
} from "../types";
import { layout, palette, typography } from "../theme";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { BaseGlyph } from "../components/BaseGlyph";
import { StabilityMeter } from "../components/StabilityMeter";
import { newLevelDraft } from "../store";

interface Props {
  level: CodonLevelDef;
  onComplete: (result: LevelResult) => void;
  hintIndex: number;
  variantIndex: number;
}

export const CodonChunkingLevel: React.FC<Props> = ({
  level,
  onComplete,
  hintIndex,
  variantIndex,
}) => {
  const variant = level.variants[variantIndex % level.variants.length];
  const mRNA: Base[] = variant.mRNA;
  const totalCodons = Math.floor(mRNA.length / 3);

  // Cuts are at boundary positions 1..mRNA.length - 1
  const [cuts, setCuts] = useState<Set<number>>(new Set());
  const [solved, setSolved] = useState(false);
  const draftRef = useRef<LevelResult>(newLevelDraft(level.id));
  const startedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    setCuts(new Set());
    setSolved(false);
    draftRef.current = newLevelDraft(level.id);
    startedAtRef.current = Date.now();
  }, [level.id, variantIndex]);

  const segments = useMemo(() => {
    const sortedCuts = Array.from(cuts).sort((a, b) => a - b);
    const out: { start: number; end: number; bases: Base[] }[] = [];
    let prev = 0;
    for (const c of sortedCuts) {
      out.push({ start: prev, end: c, bases: mRNA.slice(prev, c) });
      prev = c;
    }
    out.push({ start: prev, end: mRNA.length, bases: mRNA.slice(prev) });
    return out;
  }, [cuts, mRNA]);

  const codonCount = segments.length;
  const correctCount = segments.filter((s) => s.bases.length === 3).length;
  const allValid =
    segments.length === totalCodons &&
    segments.every((s) => s.bases.length === 3);

  useEffect(() => {
    if (allValid && !solved) {
      setSolved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Auto-advance to the level success panel (LevelScreen) without an
      // intermediate per-level overlay that the player has to dismiss.
      const t = setTimeout(() => {
        const r: LevelResult = {
          ...draftRef.current,
          durationMs: Date.now() - startedAtRef.current,
          hintsUsed: hintIndex + 1 > 0 ? hintIndex + 1 : 0,
          completed: true,
        };
        onComplete(r);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [allValid, solved, hintIndex, onComplete]);

  const toggleCut = (boundary: number) => {
    if (solved) return;
    Haptics.selectionAsync();
    const next = new Set(cuts);
    if (next.has(boundary)) {
      next.delete(boundary);
    } else {
      next.add(boundary);
    }
    setCuts(next);
    draftRef.current = {
      ...draftRef.current,
      attempts: draftRef.current.attempts + 1,
    };
  };

  const autoChunk = () => {
    if (solved) return;
    const next = new Set<number>();
    for (let i = 3; i < mRNA.length; i += 3) next.add(i);
    setCuts(next);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const meterValue = Math.min(1, correctCount / Math.max(totalCodons, 1));
  const status = solved
    ? "Reading frame complete."
    : `${correctCount} of ${totalCodons} codons valid.`;

  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.modeLabel}>Codon chunking</Text>
          <Text style={styles.briefText}>{level.brief}</Text>
        </View>
        <View style={styles.meterWrap}>
          <StabilityMeter
            value={meterValue}
            label="Reading frame"
            hint={status}
            width={undefined as unknown as number}
          />
        </View>
      </View>

      <Card style={styles.strandCard}>
        <Text style={styles.cardLabel}>mRNA transcript</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.strandRow}>
            {mRNA.map((b, i) => (
              <React.Fragment key={`base-${i}`}>
                <View style={styles.baseCell}>
                  <BaseGlyph base={b} size={48} />
                </View>
                {i < mRNA.length - 1 && (
                  <Pressable
                    onPress={() => toggleCut(i + 1)}
                    style={styles.boundaryWrap}
                    hitSlop={8}
                  >
                    <View
                      style={[
                        styles.boundaryLine,
                        cuts.has(i + 1) && styles.boundaryLineActive,
                      ]}
                    />
                    <Text
                      style={[
                        styles.boundaryGlyph,
                        cuts.has(i + 1) && styles.boundaryGlyphActive,
                      ]}
                    >
                      {cuts.has(i + 1) ? "│" : "·"}
                    </Text>
                  </Pressable>
                )}
              </React.Fragment>
            ))}
          </View>
        </ScrollView>
        <Text style={styles.helperText}>
          Tap a dot between two bases to insert a frame cut. Goal: every codon
          has exactly 3 bases.
        </Text>
      </Card>

      <Card style={styles.codonsCard}>
        <View style={styles.codonsHeader}>
          <Text style={styles.cardLabel}>Codons formed</Text>
          <PrimaryButton
            label="Auto-chunk"
            variant="ghost"
            onPress={autoChunk}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.codonRow}>
            {segments.map((seg, i) => {
              const isValid = seg.bases.length === 3;
              return (
                <View
                  key={`seg-${i}`}
                  style={[
                    styles.codonCard,
                    isValid ? styles.codonValid : styles.codonInvalid,
                  ]}
                >
                  <Text style={styles.codonIndex}>codon {i + 1}</Text>
                  <View style={styles.codonBases}>
                    {seg.bases.length === 0 ? (
                      <Text style={styles.codonEmpty}>—</Text>
                    ) : (
                      seg.bases.map((b, j) => (
                        <BaseGlyph
                          key={`seg-${i}-b-${j}`}
                          base={b}
                          size={32}
                        />
                      ))
                    )}
                  </View>
                  <Text
                    style={[
                      styles.codonStatus,
                      isValid
                        ? { color: palette.success }
                        : { color: palette.warn },
                    ]}
                  >
                    {seg.bases.length === 3
                      ? "ok"
                      : `${seg.bases.length} bases`}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </Card>

      {hintIndex >= 0 && level.hints[hintIndex] ? (
        <View style={styles.hintBubble}>
          <Text style={styles.hintLabel}>Hint</Text>
          <Text style={styles.hintText}>{level.hints[hintIndex]}</Text>
        </View>
      ) : null}

    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: layout.cardRadius,
    gap: 12,
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
  strandCard: {
    paddingVertical: 14,
    gap: 8,
  },
  cardLabel: {
    ...typography.caption,
    color: palette.inkSoft,
  },
  strandRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  baseCell: {
    width: 48,
    alignItems: "center",
  },
  boundaryWrap: {
    width: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  boundaryLine: {
    width: 2,
    height: 36,
    backgroundColor: "transparent",
    borderRadius: 2,
  },
  boundaryLineActive: {
    backgroundColor: palette.accent,
  },
  boundaryGlyph: {
    position: "absolute",
    color: palette.inkSoft,
    fontSize: 18,
  },
  boundaryGlyphActive: {
    color: palette.accent,
  },
  helperText: {
    ...typography.body,
    fontSize: 12,
    color: palette.inkSoft,
  },
  codonsCard: {
    flex: 1,
    paddingVertical: 14,
    gap: 8,
  },
  codonsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  codonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  codonCard: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: palette.bg,
    alignItems: "center",
    gap: 6,
    minWidth: 130,
  },
  codonValid: {
    borderColor: palette.success,
    backgroundColor: palette.successSoft,
  },
  codonInvalid: {
    borderColor: palette.warn,
    backgroundColor: palette.warnSoft,
  },
  codonIndex: {
    ...typography.caption,
    color: palette.inkSoft,
  },
  codonBases: {
    flexDirection: "row",
    gap: 4,
    minHeight: 36,
    alignItems: "center",
  },
  codonEmpty: {
    ...typography.caption,
    color: palette.inkSoft,
  },
  codonStatus: {
    ...typography.caption,
    fontSize: 11,
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
});
