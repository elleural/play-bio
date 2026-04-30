# Playtest guide — fourth prototype (0.4, translation arc)

This is the fourth iPad prototype of `play-bio`. It addresses the lingering "floating base" bug from the assembly screen and adds the next playable phase: translation from mRNA to a small polypeptide, including a mutation effect challenge.

## What changed since 0.3

- Fixed: in Level 1 (Build a nucleotide), the base tray draggables are now removed when the lab note overlay appears, and the success panel is rendered above everything else. No more bases visually floating over the success panel.
- Added: a translation arc with three new levels (codon chunking, ribosome workshop, mutation lab).
- Added: per-level variant rotation. Tapping **Try again** on a translation level rotates to a different sequence so replays do not repeat exactly the same content.

## What this build contains

- A short Campbell-inspired session called **Molecular Systems Lab**.
- 10 levels grouped into 3 stages:
  1. **Build & replicate**
     - Build a nucleotide.
     - Bond chamber (multi-step: A and G).
     - DNA polymerase build run.
     - Proofreading run with two mismatches.
  2. **Transcribe to RNA**
     - RNA bond chamber (uracil).
     - RNA polymerase transcription run.
     - Mutation transcript change.
  3. **Translate to protein**
     - Codon chunking: tap boundaries to find the reading frame.
     - Ribosome workshop: translate codons into amino acids using a small codon table; STOP ends translation.
     - Mutation lab: translate an original and a mutated mRNA, then label the result as silent, missense, or nonsense.

The biology content targets **incoming college freshman** level (Campbell 12e Ch 5, 16, 17). The translation phase deliberately uses a small subset of the genetic code so the player learns the concept without memorizing 64 codons.

## How to run on iPad

1. `npm install` (already done if you cloned this repo).
2. `npx expo start` (or `npx expo start --clear` after pulling new code).
3. Open Expo Go (SDK 54) on the iPad on the same Wi-Fi.
4. Scan the QR.
5. Hold the iPad in landscape.

If Expo Go can't reach your Mac, use `npx expo start --tunnel`.

## How to play the new phase

- **Codon chunking**: the mRNA is shown as a row of bases. Between each pair of bases is a small dot. Tap a dot to insert a frame cut. Goal: every codon must have exactly 3 bases. There is an **Auto-chunk** button that places cuts every 3 bases if you want to skip ahead.
- **Ribosome workshop**: the mRNA is already chunked. The current codon is highlighted. The codon table on the right tells you what each codon codes for. Tap the matching amino acid token at the bottom to add it to the polypeptide chain. STOP ends the level.
- **Mutation lab**: two mRNAs are shown side by side, with the differing codon highlighted. Tap **Translate** on each to run the ribosome. Compare the resulting protein chains. Then tap one of three outcome buttons: Silent, Missense, or Nonsense.

## What feedback we want this round

- Does the floating-base bug actually feel fixed in Level 1?
- Does the codon chunking level make the reading frame click?
- Does the ribosome workshop feel like operating a machine, or like another quiz?
- Does the mutation lab connect "DNA changes" to "protein changes" in a satisfying way?
- Did variant rotation help on replays?
- Did the session feel about the right length (10 levels, ~15 minutes)?
- What concept feels weakest after play and should be expanded next?

## Variability for replay

Each translation level has multiple sequence variants. Each time you tap **Try again** in the success panel (or **Reset** in the HUD), the level rotates to the next variant. The first playthrough always uses the deterministic "first" variant so the learning sequence stays predictable.

## Known limitations of this build

- No persistent storage; closing the app loses session results.
- Only a tiny subset of the genetic code is implemented (Met, Phe, Ala, Leu, Ser, Gly, STOP). Other codons would be flagged as "not in table".
- The codon chunking level relies on simple tap interactions instead of free drag, to keep it clear.
- No tRNA visuals yet, no protein-folding consequences, no regulation/CRISPR yet.
- Placeholder art only.
