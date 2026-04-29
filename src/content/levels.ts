import { LevelDef } from "../types";

export const LEVELS: LevelDef[] = [
  {
    kind: "briefing",
    id: "brief-1",
    title: "Build a nucleotide",
    brief:
      "Drag the parts from the tray onto the matching dashed targets to build a nucleotide. Then try a different base to see what changes.",
    conceptIds: ["nucleotide", "backbone"],
    successDebrief:
      "A nucleotide is sugar + phosphate + base. The sugar and phosphate form the backbone; the base carries the information. Swapping the base changes what the nucleotide says without changing the backbone.",
    estSeconds: 90,
  },
  {
    kind: "discovery",
    id: "discover-at",
    title: "Which base bonds with A",
    brief:
      "An adenine base is fixed in the bond chamber. Drag the candidates over to it. Watch which one forms stable hydrogen bonds.",
    fixedBase: "A",
    candidates: ["G", "C", "T"],
    conceptIds: ["basePairing", "hydrogenBond"],
    successDebrief:
      "Adenine and thymine form two stable hydrogen bonds. No other base partners with adenine cleanly.",
    hints: [
      "Try each candidate. Stable bonds will lock in. Unstable ones will not hold.",
      "Look at the small dashes that appear between the bases. They are hydrogen bonds.",
    ],
    estSeconds: 90,
  },
  {
    kind: "discovery",
    id: "discover-gc",
    title: "Which base bonds with G",
    brief:
      "Guanine is fixed in the chamber. Try the candidates. The right one will form three stable bonds, not two.",
    fixedBase: "G",
    candidates: ["A", "T", "C"],
    conceptIds: ["basePairing", "hydrogenBond"],
    successDebrief:
      "Guanine and cytosine form three hydrogen bonds. G-C pairs are slightly stronger than A-T pairs because of that extra bond.",
    hints: [
      "Two bases form three hydrogen bonds. The other combinations form fewer or none.",
      "G pairs with the base whose shape and chemistry make three bonds possible.",
    ],
    estSeconds: 90,
  },
  {
    kind: "build",
    id: "build-1",
    title: "Build a complementary strand",
    brief:
      "A short DNA template is sitting in the polymerase. Use the candidate nucleotides at the bottom to build the new strand. Each new base must pair with the template above it.",
    template: ["A", "T", "G", "C"],
    trayPool: ["A", "T", "G", "C"],
    conceptIds: ["templateProduct", "polymerase", "basePairing"],
    successDebrief:
      "You read the template and built its complement. The polymerase only adds a nucleotide when its base pairs with the template position.",
    hints: [
      "Use what you discovered: A pairs with T, G pairs with C.",
      "The polymerase will not advance until you feed it a base that pairs.",
    ],
    estSeconds: 120,
    guided: true,
  },
  {
    kind: "build",
    id: "build-2",
    title: "Stabilize a longer strand",
    brief:
      "Same job, longer template. Keep the new strand stable as you go. Wrong bases will not stick.",
    template: ["G", "A", "A", "T", "C", "G"],
    trayPool: ["A", "T", "G", "C"],
    conceptIds: ["templateProduct", "polymerase", "basePairing"],
    successDebrief:
      "Each position of the new strand is determined by the template. Base pairing is what makes one strand a usable template for the other.",
    hints: [
      "Read the template base, then choose its partner.",
      "Two stable A-T bonds, three stable G-C bonds. Wrong pairings rattle and bounce off.",
    ],
    estSeconds: 150,
  },
  {
    kind: "repair",
    id: "repair-1",
    title: "Catch a mismatch",
    brief:
      "Replication finished, but the polymerase missed one error. Find the position where the new strand does not pair with the template, and replace it.",
    template: ["A", "T", "G", "C", "A", "T"],
    startingProduct: ["T", "A", "C", "G", "A", "A"],
    errorPositions: [4],
    trayPool: ["A", "T", "G", "C"],
    conceptIds: ["mismatch", "proofreading", "mutation"],
    successDebrief:
      "Proofreading catches mismatches before they become permanent. A mismatch left in place becomes a mutation that can change the meaning of a gene.",
    hints: [
      "Use the template as ground truth. Walk left to right and check each pair.",
      "Five of the six positions pair correctly. Find the one that does not.",
    ],
    estSeconds: 120,
  },
  {
    kind: "repair",
    id: "repair-2",
    title: "Two mismatches",
    brief:
      "This strand has two errors. Find them both and replace each with the base that actually pairs with the template.",
    template: ["G", "C", "T", "A", "G", "T", "C"],
    startingProduct: ["C", "G", "T", "T", "C", "A", "G"],
    errorPositions: [2, 4],
    trayPool: ["A", "T", "G", "C"],
    conceptIds: ["mismatch", "proofreading", "mutation"],
    successDebrief:
      "Two errors, two repairs. Real cells have multiple repair systems running in parallel because uncorrected mismatches accumulate as mutations over time.",
    hints: [
      "Compare each position to its template partner. A pairs with T; G pairs with C.",
      "If a position breaks the rule, the base sitting there is the mismatch.",
    ],
    estSeconds: 150,
  },
];
