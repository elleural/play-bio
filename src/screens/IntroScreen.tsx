import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { palette, typography } from "../theme";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { useSession } from "../store";
import { LEVELS } from "../content/levels";

export const IntroScreen: React.FC = () => {
  const startGame = useSession((s) => s.startGame);

  const totalDurationMin = Math.round(
    LEVELS.reduce((acc, l) => acc + l.estSeconds, 0) / 60
  );

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      style={styles.root}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.kicker}>play-bio prototype 0.2</Text>
        <Text style={styles.title}>Molecular Systems Lab</Text>
        <Text style={styles.subtitle}>
          You are running a small molecular lab. No biology background needed.
          You will assemble a nucleotide, discover base pairing, replicate
          and proofread DNA, transcribe a gene into RNA, and finally translate
          mRNA into a small protein.
        </Text>
      </View>

      <View style={styles.row}>
        <Card style={styles.col}>
          <Text style={styles.cardLabel}>1. Build & replicate</Text>
          <Text style={styles.cardBody}>
            Assemble a nucleotide. Discover the A-T and G-C pairing rules in
            the bond chamber. Run DNA polymerase and proofread to fix
            mismatches.
          </Text>
        </Card>
        <Card style={styles.col}>
          <Text style={styles.cardLabel}>2. Transcribe to RNA</Text>
          <Text style={styles.cardBody}>
            Meet uracil (U): the base RNA uses where DNA uses thymine. Run RNA
            polymerase to transcribe a gene, then see how a single mutation
            changes the transcript.
          </Text>
        </Card>
        <Card style={styles.col}>
          <Text style={styles.cardLabel}>3. Translate to protein</Text>
          <Text style={styles.cardBody}>
            Lock the reading frame, run the ribosome, and watch a polypeptide
            grow. Then label what a mutation does: silent, missense, or
            nonsense.
          </Text>
        </Card>
      </View>

      <View style={styles.principles}>
        <Text style={styles.principlesLabel}>How to play</Text>
        <Text style={styles.principleItem}>
          Tap things to interact. Anything labeled or outlined is meant to be
          tapped or chosen.
        </Text>
        <Text style={styles.principleItem}>
          Wrong choices are part of how you learn. The lab will explain in one
          line what just happened.
        </Text>
        <Text style={styles.principleItem}>
          About {totalDurationMin} minutes for {LEVELS.length} short levels.
          Stop after any level if you need to.
        </Text>
      </View>

      <View style={styles.cta}>
        <PrimaryButton label="Start session" onPress={startGame} />
      </View>

      <Text style={styles.footnote}>
        The game references Campbell Biology, 12e (Ch 5, 16, 17). Visuals are
        inspired by textbook diagrams and are placeholder for prototype
        testing only.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  scroll: {
    paddingHorizontal: 36,
    paddingVertical: 32,
    gap: 24,
  },
  header: {
    alignItems: "flex-start",
    gap: 6,
  },
  kicker: {
    ...typography.caption,
    color: palette.accent,
  },
  title: {
    ...typography.display,
    fontSize: 36,
  },
  subtitle: {
    ...typography.body,
    fontSize: 16,
    color: palette.inkSoft,
    maxWidth: 720,
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  col: {
    flex: 1,
    gap: 8,
  },
  cardLabel: {
    ...typography.caption,
    color: palette.inkSoft,
  },
  cardBody: {
    ...typography.body,
    fontSize: 14,
  },
  principles: {
    gap: 6,
  },
  principlesLabel: {
    ...typography.caption,
    color: palette.inkSoft,
    marginBottom: 4,
  },
  principleItem: {
    ...typography.body,
    fontSize: 14,
    color: palette.ink,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  footnote: {
    ...typography.figure,
    fontSize: 12,
    color: palette.inkSoft,
    marginTop: 8,
  },
});
