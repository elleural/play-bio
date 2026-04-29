# doc/ (local-only reference)

This folder is intentionally empty in the public repo. During design, it
holds local-only reference material that is too large or not licensed for
distribution:

- `campbell_biology_12e.md` — Campbell Biology 12e, used as the curriculum
  source for the game's biology content (Pearson; not redistributed).
- `Artificial Intelligence for Games.md` — Ian Millington (CRC Press).
- `game-design-fundamentals.md` — Salen & Zimmerman, *Rules of Play*.
- `characteristics of games.md` — Garfield, Elias, Gutschera (MIT Press).
- `What-Video-Games-Have-to-Teach-us.md` — James Paul Gee.
- `the-art-of-game-design.md` — Jesse Schell, *A Book of Lenses*.

These files are listed in `.gitignore` and excluded from version control.
The README.md at the repo root summarizes the design ideas drawn from each
of them so the public history is still self-explanatory.

If you are setting up a development environment and want the same source
material for AI-assisted design, place the files in this folder locally;
nothing in the app code depends on them at runtime.
