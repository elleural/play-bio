# Playtest guide — first prototype (0.2 redesign)

This is the redesigned first iPad prototype of `play-bio`, built per [README.md](README.md). It teaches the same concepts as before, but it now scaffolds them so a player with no biology background can succeed by experimenting, not by recalling.

## What this build contains

- A short Campbell-inspired session called **Molecular Systems Lab**.
- 7 levels grouped into 4 stages:
  1. **Briefing — Build a nucleotide** (1 level). Drag a phosphate, a sugar, and a base from the tray onto the dashed targets in the assembly pad. Try a different base after the molecule is complete to see how the backbone stays the same while the information changes.
  2. **Discovery** (2 levels). Free-experiment bond chamber. Try candidate bases against a fixed base; bond lines and a stability meter show what is happening. Discover A-T pairing, then G-C pairing.
  3. **Build run** (2 levels). Operate a simplified polymerase. Tap a base to feed it; correct pairs form bonds and the polymerase advances; wrong pairs shake and reduce strand stability.
  4. **Repair** (2 levels). A proofreading station. The product strand has mismatches; tap a position to select it, then tap a replacement base.
- An end-of-session debrief with stats, a short concept check, and a feedback form.
- All-original placeholder visuals styled after textbook diagrams. No Campbell figures are bundled with the app.

The biology content targets **incoming college freshman** level. Concepts referenced (Campbell 12e):

- Ch 5.5: nucleotides, sugar-phosphate backbone, the four bases
- Ch 16.1–16.2: complementary base pairing, hydrogen bonds, DNA polymerase, proofreading
- Ch 17.5 (preview): how a missed mismatch becomes a mutation

## How to run on iPad

You need a Mac (or any computer with Node 18+) and an iPad.

1. Install dependencies (already done if you cloned this repo):
   ```bash
   npm install
   ```
2. Start the Expo dev server in this directory:
   ```bash
   npx expo start
   ```
3. On the iPad, install **Expo Go** from the App Store. Make sure it matches the Expo SDK shown in the terminal (currently SDK 54).
4. Make sure the iPad and your Mac are on the same Wi-Fi network.
5. Open Expo Go on the iPad and scan the QR code shown in the terminal (or in the browser tab the dev server opens).
6. Hold the iPad in **landscape**. The app locks to landscape automatically.

If Expo Go cannot reach your Mac (e.g., on guest Wi-Fi), run `npx expo start --tunnel` instead.

## How to play

- The bar at the top shows the level title, the level number, and the stage (Briefing, Discovery, Build run, Repair).
- The body of the screen changes per stage:
  - **Briefing**: drag parts from the right tray onto the dashed targets on the left assembly pad. Wrong drops bounce back with an explanation. After the nucleotide is fully assembled, drag a different base onto the base target to see the swap. The "Continue to the lab" button appears after a swap.
  - **Discovery**: tap a candidate on the right to test it against the fixed base on the left. If a stable pair forms you will see hydrogen bond lines and a green stability meter; if not, you will see a wobble and a "no bond" caption. Try freely.
  - **Build run**: tap A, T, G, or C at the bottom to feed it to the polymerase. Correct bases bond; wrong ones shake. Stability drops with wrong tries but the level is recoverable.
  - **Repair**: tap a position on the lower strand to select it (mismatched ones are highlighted in warm orange). Then tap a base to replace it. The proofreading station closes when all positions pair correctly.
- Tap **Hint** for a nudge. Hints do not penalize you.
- After finishing a level, a panel summarizes what just happened, names the Campbell concepts you encountered, and shows your stats.
- The session ends after the last level with a debrief, a short concept check, and a feedback form.

## What feedback we want

The redesign is meant to fix one specific problem: the first version felt like a quiz that assumed background knowledge. Watch the player and capture both behavior and direct comments.

Specifically:

- Could the player figure out what to do without reading much?
- When did the player first understand why A pairs with T and G pairs with C?
- Did the bond visuals and stability meter help them feel they were operating a system?
- Did the polymerase build feel more game-like than the first prototype?
- Could the player make and recover from mistakes without frustration?
- Did anything still feel like homework?
- Could the player explain in their own words: what a nucleotide is, why bases pair selectively, what a mismatch is?
- Did the content feel college-appropriate, too easy, or too jargon-heavy?
- What felt fun enough to repeat?

The end-of-session screen captures three short concept-check answers, two ratings, a yes/no replay question, and free-form notes. When the player taps **Save feedback and play again**, the responses are also printed to the Expo dev console for capture.

## Known limitations of this build

- No persistent storage. Closing the app loses session results.
- No real audio. Haptics only.
- Simplified molecular visuals; the polymerase is implied by a highlight, not drawn as a full enzyme.
- Tray buttons are reusable; in real biology nucleotides are consumed by polymerase, but for the prototype we let the player experiment freely.
- Placeholder art only. The Campbell-style diagrams are procedural; we will redraw or license real figures once the core loop is validated.
- No transcription, regulation, CRISPR, or applied bioengineering yet. Those wait until the build/repair experience proves it can teach the basics.

After feedback, we will decide whether to deepen the discovery and repair loops, change interaction style, or move into transcription as the next biology arc.
