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
          You will look at the building blocks of DNA, discover which pieces
          stick together, build a strand, and clean up replication errors.
        </Text>
      </View>

      <View style={styles.row}>
        <Card style={styles.col}>
          <Text style={styles.cardLabel}>1. Briefing</Text>
          <Text style={styles.cardBody}>
            Look at a single nucleotide. Tap its parts to learn what each one
            does. No quiz, just observation.
          </Text>
        </Card>
        <Card style={styles.col}>
          <Text style={styles.cardLabel}>2. Discovery</Text>
          <Text style={styles.cardBody}>
            Use the bond chamber to find out which bases stick together. The
            chamber tells you when a pair is stable and when it is not.
          </Text>
        </Card>
        <Card style={styles.col}>
          <Text style={styles.cardLabel}>3. Build and repair</Text>
          <Text style={styles.cardBody}>
            Operate a polymerase to build a new strand using what you
            discovered, then run a proofreading station to fix mismatches.
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
        The game references Campbell Biology, 12e. Visuals are inspired by
        textbook diagrams and are placeholder for prototype testing only.
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
