# Playtest guide — fifth prototype (0.5, bugfix + clean overlay flow)

This is the fifth iPad prototype. It addresses the two bugs found in the v0.4 session and keeps the translation arc that landed well, with cleaner end-of-level transitions.

## What changed since 0.4

- **Level 1 completion fixed.** Building the nucleotide (one phosphate, one sugar, one base) now ends the required objective. The lab note appears immediately and offers two options: *Continue to the lab* or *Optional: try a different base*.
- **No more phantom duplicate base.** When swap mode is active, the currently-placed base appears in the tray as an "in slot" indicator instead of as a draggable copy. The other three bases are draggable and only one swap is needed to demonstrate "backbone stays the same, information changes."
- **Codon level no longer traps you.** The per-level "Continue" overlay was removed from codon chunking, ribosome workshop, and mutation lab. When you finish a level, you go straight to the standard level success panel (with stats and the *Next level* button). One overlay per completion, no double dismissal.
- **Level success panel now scrolls.** On smaller iPads, the long stats + concept summary is reachable.

## What this build contains

10 levels in 3 stages:

1. **Build & replicate**
   - Build a nucleotide.
   - Bond chamber (multi-step: A then G).
   - DNA polymerase build run.
   - Proofreading run with two mismatches.
2. **Transcribe to RNA**
   - RNA bond chamber (uracil).
   - RNA polymerase transcription run.
   - Mutation transcript change.
3. **Translate to protein**
   - Find the reading frame (codon chunking).
   - Ribosome workshop (codon → amino acid; STOP ends).
   - Mutation lab (silent / missense / nonsense).

## How to run on iPad

1. `npm install` (already done if you cloned this repo).
2. `npx expo start --clear`.
3. Open Expo Go (SDK 54) on the iPad on the same Wi-Fi.
4. Scan the QR. Hold the iPad in landscape.

## What feedback we want this round

- Does Level 1 finish exactly when you place the third part?
- Does swap mode feel optional and clearly bounded? Any phantom duplicates left?
- Does each translation level exit cleanly into the level success panel? Any stuck overlays?
- Does the overall arc still feel engaging through level 10? Where (if anywhere) does it sag?
- Which concept feels weakest after play and should be expanded next?
- Any thoughts on what comes next: regulation (operons), CRISPR/genetic engineering, or something else?

## Known limitations

- No persistent storage; closing the app loses session results.
- Tiny codon table only (Met, Phe, Ala, Leu, Ser, Gly, STOP).
- No tRNA visuals, regulation, CRISPR yet.
- Placeholder art only.

## What's likely next (depending on this session)

If overlays are clean and translation lands, the next phase is most naturally **gene regulation**: operons (lac/trp), promoters/repressors as switches, and a small "is the gene expressed?" puzzle. After that, we have a strong base to build genetic-engineering scenarios (PCR, plasmids, CRISPR).
