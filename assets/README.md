# assets

This folder is split into two purposes. Keep them separate so we can swap assets later without changing app code.

## `assets/game/`

Original or licensed art that ships with the app. Anything used in production must live here.

For the first prototype, the game does not yet ship with raster art. All molecules, strands, slots, and callouts are rendered procedurally in React Native using the components under `src/components/` and the design tokens in `src/theme.ts`. The visual grammar deliberately mirrors Campbell Biology textbook diagrams:

- color-coded nucleotides with shape and pattern redundancy
- horizontal sugar-phosphate backbone
- explicit 5' to 3' direction labels
- figure-style callouts with italic captions
- soft biological palette rather than arcade colors

This makes the prototype look textbook-native on day one without copying or distributing any Campbell figure.

## `assets/reference/`

Local-only reference material. Pages or figures from Campbell Biology (or other texts) that we use for layout and color study while building original art. **Do not commit copyrighted material to this folder.** It is gitignored.

When we want to ship a real image asset, redraw it as an original under `assets/game/` or replace it with a properly licensed asset.
