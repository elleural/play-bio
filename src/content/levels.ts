import { LevelDef } from "../types";

export const LEVELS: LevelDef[] = [
  {
    kind: "briefing",
    id: "brief-1",
    title: "Build a nucleotide",
    brief:
      "Drag a phosphate, a sugar, and a base into the assembly pad to build one nucleotide.",
    conceptIds: ["nucleotide", "backbone"],
    successDebrief:
      "A nucleotide is sugar + phosphate + base. The sugar and phosphate form the backbone; the base carries the information. Swapping the base changes what the nucleotide says without changing the backbone.",
    estSeconds: 90,
  },
  {
    kind: "discovery",
    id: "discover-pairing",
    title: "Bond chamber",
    brief:
      "Test each candidate base against the fixed one. Lock in the partner that forms a stable bond.",
    steps: [
      {
        fixedBase: "A",
        candidates: ["G", "C", "T"],
        partnerCaption:
          "Adenine and thymine form 2 hydrogen bonds. No other base partners with adenine cleanly.",
      },
      {
        fixedBase: "G",
        candidates: ["A", "T", "C"],
        partnerCaption:
          "Guanine and cytosine form 3 hydrogen bonds. G-C pairs are slightly stronger than A-T because of that extra bond.",
      },
    ],
    conceptIds: ["basePairing", "hydrogenBond"],
    successDebrief:
      "Two pairing rules emerge from the chemistry: A pairs with T, and G pairs with C. These are the only stable pairs in DNA.",
    hints: [
      "Try each candidate. Stable pairs lock in; unstable ones bounce away.",
      "Watch the small dashes between bases. They are hydrogen bonds.",
    ],
    estSeconds: 120,
  },
  {
    kind: "build",
    id: "build-dna",
    title: "Polymerase run: build DNA",
    brief:
      "Feed the polymerase the right base for each template position. Wrong bases bounce off.",
    template: ["G", "A", "T", "C", "A", "G"],
    trayPool: ["A", "T", "G", "C"],
    productKind: "DNA",
    conceptIds: ["templateProduct", "polymerase", "basePairing"],
    successDebrief:
      "Each position of the new DNA strand is the complement of the template. The polymerase only advances when a base correctly pairs.",
    hints: [
      "Use what you discovered: A pairs with T, G pairs with C.",
      "Polymerase will not advance until you feed it a base that pairs.",
    ],
    estSeconds: 120,
    guided: true,
  },
  {
    kind: "repair",
    id: "repair-mismatches",
    title: "Proofreading run",
    brief:
      "Find each mismatched position on the new strand and replace it with the base that actually pairs.",
    template: ["G", "C", "T", "A", "G", "T", "C"],
    startingProduct: ["C", "G", "T", "T", "C", "A", "G"],
    errorPositions: [2, 4],
    trayPool: ["A", "T", "G", "C"],
    conceptIds: ["mismatch", "proofreading", "mutation"],
    successDebrief:
      "Proofreading catches mismatches before they become permanent. A mismatch left in place becomes a mutation that can change the meaning of a gene.",
    hints: [
      "Use the template as ground truth. Walk left to right and check each pair.",
      "If a position breaks the rule (A-T, G-C), the base sitting there is the mismatch.",
    ],
    estSeconds: 150,
  },
  {
    kind: "discovery",
    id: "discover-rna",
    title: "RNA lab: meet uracil",
    brief:
      "Find the RNA partner for each fixed base. Watch for the new base that replaces thymine.",
    steps: [
      {
        fixedBase: "A",
        candidates: ["T", "U", "G"],
        partnerCaption:
          "In RNA, adenine pairs with uracil (U), not thymine (T). RNA does not contain T at all.",
      },
      {
        fixedBase: "G",
        candidates: ["A", "U", "C"],
        partnerCaption:
          "G still pairs with C in RNA. Only the A-T rule changes; A pairs with U instead.",
      },
    ],
    conceptIds: ["rnaUracil", "basePairing"],
    successDebrief:
      "RNA uses uracil where DNA uses thymine. A pairs with U, and G still pairs with C. This small chemical difference distinguishes RNA from DNA.",
    hints: [
      "There is no thymine in this tray, on purpose.",
      "If a candidate forms hydrogen bonds, it is the RNA partner.",
    ],
    estSeconds: 120,
  },
  {
    kind: "build",
    id: "build-rna",
    title: "Transcription run: build RNA",
    brief:
      "Feed RNA polymerase the right RNA base for each DNA template position to synthesize the transcript.",
    template: ["T", "A", "C", "G", "A", "A", "T"],
    trayPool: ["A", "U", "G", "C"],
    productKind: "RNA",
    conceptIds: ["transcription", "rnaUracil", "templateProduct"],
    successDebrief:
      "You synthesized an RNA transcript from a DNA template. The transcript carries the message of the gene out of the nucleus to where proteins are built.",
    hints: [
      "RNA pairs A on the template with U on the transcript.",
      "G still pairs with C; only the A-T rule changes for RNA.",
    ],
    estSeconds: 150,
  },
  {
    kind: "build",
    id: "build-rna-mutation",
    title: "A mutation changes the message",
    brief:
      "Transcribe this mutated DNA template into RNA and compare it to the previous transcript.",
    template: ["T", "A", "C", "G", "A", "G", "T"],
    trayPool: ["A", "U", "G", "C"],
    productKind: "RNA",
    conceptIds: ["transcription", "mutation", "rnaUracil"],
    successDebrief:
      "One base substitution in the DNA produces a different RNA transcript. That single change can flow downstream and alter the protein the cell makes.",
    hints: [
      "Compare to the previous transcript. One base on the template is different.",
      "The matching tray has been adjusted; pair A with U, G with C.",
    ],
    estSeconds: 150,
  },
  // ----- Translation arc (Ribosome Workshop) -----
  {
    kind: "codon",
    id: "codon-chunking",
    title: "Find the reading frame",
    brief:
      "Tap the dots between bases to slice this mRNA into codons. Every codon must be 3 bases long.",
    variants: [
      { mRNA: ["A", "U", "G", "U", "U", "U", "G", "C", "U", "U", "G", "A"] },
      { mRNA: ["A", "U", "G", "G", "C", "C", "U", "U", "C", "U", "G", "A"] },
      { mRNA: ["A", "U", "G", "U", "C", "U", "G", "G", "C", "U", "G", "A"] },
    ],
    conceptIds: ["codon", "readingFrame"],
    successDebrief:
      "mRNA is read in non-overlapping triplets. Each triplet is a codon. Inserting or deleting a base that is not a multiple of three would shift the reading frame and change every codon downstream.",
    hints: [
      "Group every 3 bases into one codon, starting from the left.",
      "If the count of bases is not a multiple of 3, the frame is wrong.",
    ],
    estSeconds: 120,
  },
  {
    kind: "ribosome",
    id: "ribosome-run",
    title: "Ribosome workshop",
    brief:
      "Translate each codon into the right amino acid. Use the codon table on the right; STOP ends the chain.",
    variants: [
      { mRNA: ["A", "U", "G", "U", "U", "U", "G", "C", "U", "U", "G", "A"] },
      { mRNA: ["A", "U", "G", "G", "C", "C", "U", "U", "C", "U", "G", "A"] },
      { mRNA: ["A", "U", "G", "U", "C", "U", "G", "G", "C", "U", "G", "A"] },
    ],
    conceptIds: ["ribosome", "aminoAcid", "polypeptide", "codon"],
    successDebrief:
      "Translation builds a polypeptide one amino acid at a time. The first AUG starts the protein with methionine; a stop codon (UGA, UAA, or UAG) ends translation.",
    hints: [
      "AUG is always the start. Find it first.",
      "Look up each codon in the table on the right and tap the matching amino acid.",
    ],
    estSeconds: 180,
  },
  {
    kind: "mutation-effect",
    id: "mutation-effect",
    title: "What did this mutation do",
    brief:
      "Run both transcripts through the ribosome, compare the chains, then label the outcome.",
    variants: [
      {
        label: "Substitution near the middle",
        originalMRNA: ["A", "U", "G", "U", "U", "U", "G", "C", "U", "U", "G", "A"],
        // UUU -> UUC, both code for Phe -> silent
        mutatedMRNA:  ["A", "U", "G", "U", "U", "C", "G", "C", "U", "U", "G", "A"],
      },
      {
        label: "Substitution swaps an amino acid",
        originalMRNA: ["A", "U", "G", "G", "C", "U", "U", "U", "U", "U", "G", "A"],
        // GCU -> UCU = Ser -> missense
        mutatedMRNA:  ["A", "U", "G", "U", "C", "U", "U", "U", "U", "U", "G", "A"],
      },
      {
        label: "Substitution creates an early stop",
        originalMRNA: ["A", "U", "G", "U", "C", "U", "G", "C", "U", "U", "G", "A"],
        // UCU -> UAA = STOP -> nonsense
        mutatedMRNA:  ["A", "U", "G", "U", "A", "A", "G", "C", "U", "U", "G", "A"],
      },
    ],
    conceptIds: [
      "mutation",
      "silentMutation",
      "missenseMutation",
      "nonsenseMutation",
    ],
    successDebrief:
      "Not all mutations change the protein. Silent mutations leave it untouched. Missense mutations swap one amino acid for another. Nonsense mutations introduce a premature stop and truncate the protein.",
    hints: [
      "Run both transcripts and compare the resulting amino-acid chains.",
      "If the chain is shorter, you probably hit a new stop codon.",
    ],
    estSeconds: 180,
  },
];
