import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { palette, typography } from "../theme";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { useSession } from "../store";
import { LEVELS } from "../content/levels";
import { CONCEPTS } from "../content/concepts";

const conceptIdsForLevel = (def: (typeof LEVELS)[number]): string[] => def.conceptIds;

export const DebriefScreen: React.FC = () => {
  const results = useSession((s) => s.results);
  const reset = useSession((s) => s.reset);
  const setFeedback = useSession((s) => s.setFeedback);
  const feedback = useSession((s) => s.feedback);

  const [conceptCheck, setConceptCheck] = useState<Record<string, string>>(
    feedback.conceptCheck ?? {}
  );
  const [notes, setNotes] = useState(feedback.notes ?? "");
  const [fun, setFun] = useState<number | undefined>(feedback.fun);
  const [clarity, setClarity] = useState<number | undefined>(feedback.clarity);
  const [wouldPlay, setWouldPlay] = useState<boolean | undefined>(
    feedback.wouldPlayMore
  );

  const totalDuration = results.reduce((acc, r) => acc + r.durationMs, 0);
  const totalAttempts = results.reduce((acc, r) => acc + r.attempts, 0);
  const totalHints = results.reduce((acc, r) => acc + r.hintsUsed, 0);
  const totalMistakes = results.reduce(
    (acc, r) =>
      acc + Object.values(r.errorsByKind).reduce((a, b) => a + (b ?? 0), 0),
    0
  );
  const completed = results.filter((r) => r.completed).length;

  const allConceptIds = Array.from(
    new Set(LEVELS.flatMap((l) => conceptIdsForLevel(l)))
  );

  const handleSaveAndReset = () => {
    setFeedback({
      conceptCheck,
      notes,
      fun,
      clarity,
      wouldPlayMore: wouldPlay,
    });
    // For prototype: print to console for the dev to capture
    // eslint-disable-next-line no-console
    console.log("[play-bio] feedback", {
      results,
      conceptCheck,
      notes,
      fun,
      clarity,
      wouldPlayMore: wouldPlay,
    });
    reset();
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.kicker}>End of session debrief</Text>
        <Text style={styles.title}>Lab notebook</Text>
        <Text style={styles.subtitle}>
          A short summary of what you did, the concepts you encountered, and a
          few questions to help us improve the game.
        </Text>
      </View>

      <View style={styles.row}>
        <Stat label="Levels solved" value={`${completed} / ${LEVELS.length}`} />
        <Stat
          label="Total time"
          value={`${Math.round(totalDuration / 1000)}s`}
        />
        <Stat label="Drops" value={String(totalAttempts)} />
        <Stat label="Hints" value={String(totalHints)} />
        <Stat label="Mistakes" value={String(totalMistakes)} />
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Concepts you worked with</Text>
        <View style={styles.conceptGrid}>
          {allConceptIds.map((id) => {
            const c = CONCEPTS[id];
            if (!c) return null;
            return (
              <View key={id} style={styles.conceptCell}>
                <Text style={styles.conceptName}>{c.name}</Text>
                <Text style={styles.conceptRef}>{c.campbellRef}</Text>
                <Text style={styles.conceptBody}>{c.explanation}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Quick concept check</Text>
        <Text style={styles.helper}>
          One short answer each. There are no wrong answers; we just want to
          see how you describe these in your own words.
        </Text>
        <ConceptInput
          prompt="What does complementary base pairing make possible?"
          value={conceptCheck.basePairing ?? ""}
          onChange={(v) => setConceptCheck((c) => ({ ...c, basePairing: v }))}
        />
        <ConceptInput
          prompt="Why does RNA use uracil (U) instead of thymine (T)?"
          value={conceptCheck.rna ?? ""}
          onChange={(v) => setConceptCheck((c) => ({ ...c, rna: v }))}
        />
        <ConceptInput
          prompt="In your own words, what is a codon and how does the ribosome use it?"
          value={conceptCheck.codon ?? ""}
          onChange={(v) => setConceptCheck((c) => ({ ...c, codon: v }))}
        />
        <ConceptInput
          prompt="What is the difference between a missense and a nonsense mutation?"
          value={conceptCheck.mutation ?? ""}
          onChange={(v) => setConceptCheck((c) => ({ ...c, mutation: v }))}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Interaction bugs</Text>
        <Text style={styles.helper}>
          Anything misbehave on the iPad? Floating tiles, stuck overlays,
          gestures that did not respond?
        </Text>
        <ConceptInput
          prompt="Any bugs you noticed?"
          value={conceptCheck.bugs ?? ""}
          onChange={(v) => setConceptCheck((c) => ({ ...c, bugs: v }))}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Pace and repetition</Text>
        <Text style={styles.helper}>
          Did anything feel too long, too short, or too similar to another
          level?
        </Text>
        <ConceptInput
          prompt="Which level felt most like a game? Which (if any) felt repetitive?"
          value={conceptCheck.variety ?? ""}
          onChange={(v) => setConceptCheck((c) => ({ ...c, variety: v }))}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>RNA and translation</Text>
        <Text style={styles.helper}>
          Quick check on the new content.
        </Text>
        <ConceptInput
          prompt="Did the RNA arc and the ribosome workshop make sense to you?"
          value={conceptCheck.rnaTranslation ?? ""}
          onChange={(v) =>
            setConceptCheck((c) => ({ ...c, rnaTranslation: v }))
          }
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>What next</Text>
        <Text style={styles.helper}>
          Where do you want the game to go?
        </Text>
        <ConceptInput
          prompt="Should the next phase be gene regulation (operons), genetic engineering (CRISPR/cloning), or something else?"
          value={conceptCheck.nextPhase ?? ""}
          onChange={(v) => setConceptCheck((c) => ({ ...c, nextPhase: v }))}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>How did it feel</Text>
        <RatingRow
          label="How fun was this session"
          value={fun}
          onChange={setFun}
        />
        <RatingRow
          label="How clear were the rules and feedback"
          value={clarity}
          onChange={setClarity}
        />
        <View style={styles.yesNoRow}>
          <Text style={styles.ratingLabel}>Would you play another set</Text>
          <View style={styles.yesNoButtons}>
            <PrimaryButton
              label="Yes"
              variant={wouldPlay === true ? "primary" : "secondary"}
              onPress={() => setWouldPlay(true)}
            />
            <PrimaryButton
              label="No"
              variant={wouldPlay === false ? "primary" : "secondary"}
              onPress={() => setWouldPlay(false)}
            />
          </View>
        </View>
        <Text style={[styles.helper, { marginTop: 12 }]}>
          Anything that felt confusing, boring, or like homework? Anything that
          felt great?
        </Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Write a few sentences..."
          placeholderTextColor={palette.inkSoft}
          multiline
          style={styles.notes}
        />
      </Card>

      <View style={styles.cta}>
        <PrimaryButton
          label="Save feedback and play again"
          onPress={handleSaveAndReset}
        />
      </View>
    </ScrollView>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.statBlock}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ConceptInput: React.FC<{
  prompt: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ prompt, value, onChange }) => (
  <View style={styles.conceptInput}>
    <Text style={styles.conceptPrompt}>{prompt}</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder="A sentence or two..."
      placeholderTextColor={palette.inkSoft}
      multiline
      style={styles.shortInput}
    />
  </View>
);

const RatingRow: React.FC<{
  label: string;
  value: number | undefined;
  onChange: (v: number) => void;
}> = ({ label, value, onChange }) => (
  <View style={styles.ratingRow}>
    <Text style={styles.ratingLabel}>{label}</Text>
    <View style={styles.ratingButtons}>
      {[1, 2, 3, 4, 5].map((n) => (
        <PrimaryButton
          key={n}
          label={String(n)}
          variant={value === n ? "primary" : "secondary"}
          onPress={() => onChange(n)}
          style={{ minWidth: 48, paddingHorizontal: 12 }}
        />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  scroll: {
    paddingHorizontal: 36,
    paddingVertical: 28,
    gap: 18,
  },
  header: {
    gap: 4,
  },
  kicker: {
    ...typography.caption,
    color: palette.accent,
  },
  title: {
    ...typography.display,
    fontSize: 32,
  },
  subtitle: {
    ...typography.body,
    color: palette.inkSoft,
    maxWidth: 720,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  statBlock: {
    flex: 1,
    backgroundColor: palette.panel,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: palette.rule,
  },
  statValue: {
    ...typography.title,
    fontSize: 22,
  },
  statLabel: {
    ...typography.caption,
    color: palette.inkSoft,
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 18,
    marginBottom: 10,
  },
  conceptGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  conceptCell: {
    flexBasis: "48%",
    flexGrow: 1,
    padding: 10,
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
  conceptBody: {
    ...typography.body,
    fontSize: 13,
  },
  conceptInput: {
    marginTop: 10,
  },
  conceptPrompt: {
    ...typography.title,
    fontSize: 15,
    marginBottom: 6,
  },
  shortInput: {
    minHeight: 60,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.rule,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: palette.bg,
    ...typography.body,
    fontSize: 14,
  },
  helper: {
    ...typography.body,
    fontSize: 13,
    color: palette.inkSoft,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  ratingLabel: {
    ...typography.body,
    fontSize: 14,
    flex: 1,
  },
  ratingButtons: {
    flexDirection: "row",
    gap: 6,
  },
  yesNoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  yesNoButtons: {
    flexDirection: "row",
    gap: 8,
  },
  notes: {
    minHeight: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.rule,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: palette.bg,
    ...typography.body,
    fontSize: 14,
  },
  cta: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 8,
  },
});
