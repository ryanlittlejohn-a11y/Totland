# Real visual variety for reskinned games

## Confirmed scope

- The catalog contains **22 repeated engine/kind families covering 63 of the 100 game records**.
- The repeated families span the Choice, Order, Hunt, and Memory renderers, so fixing only the six `findUpper` entries inside `ChoiceGame` would leave most reskins unchanged.
- Keep every round generator, answer check, retry, score, difficulty, completion threshold, reward, and premium flag unchanged.

## Approach

### 1. Add one presentation-only theme registry

Create a typed theme registry keyed by **game ID**, not catalog number. Every title in a repeated family gets its own entry containing only presentation choices:

- matching mascot or themed object;
- scene treatment and semantic tint;
- lightweight decorations around the play area;
- option/card shape treatment;
- a short bilingual theme cue where useful;
- an optional synthesized sound motif that respects the existing sound-effects setting.

Theme entries will use existing design tokens and CSS classes. They will not alter generated questions, answer IDs, option counts, timing, scoring, or progression. A neutral default will preserve untargeted games and area-based quick play.

### 2. Pass the selected theme through the existing game host

Replace `CHARACTERS[game.number % CHARACTERS.length]` on the catalog game route with `themeForGame(game.id)`. Pass that theme into the reusable Choice, Order, Hunt, and Memory renderers.

Each renderer will use the same small set of theme fields, adapted to its layout:

- **Choice:** themed prompt character, option frames, scene decoration, and optional correct-answer flourish.
- **Order:** themed destination row and pieces, such as train cars, bridge stones, garden plots, or rocket fuel cells.
- **Hunt:** themed search board and found marker.
- **Memory:** themed card backs, board treatment, and match flourish.

The existing number-based mascot behavior will be removed from catalog games. The unrelated area quick-play and daily-adventure mascot behavior will remain unchanged because those screens do not represent a specifically titled catalog game.

## Representative treatment and mascot mapping

### Six `findUpper` games

| Game | Mascot / guide | Visual treatment | Sound / phrase treatment |
|---|---|---|---|
| **Letter Pop** | Balloon `🎈` | Airy sky scene; round balloon answer tiles with strings; correct tile gives a small pop sparkle | Soft synthesized pop; “Pop the letter!” / “¡Revienta la letra!” cue |
| **Feed the Letter Monster** | Monster `👾` | Plum monster-face frame; answers sit like snacks near a friendly mouth; correct answer gets a brief munch flourish | Two-note friendly munch sound; “Feed the monster!” / “¡Alimenta al monstruo!” |
| **Letter Bubbles** | Bubbles `🫧` | Watery blue scene; translucent circular answer bubbles; tiny bubble decorations | Light rising bubble plink; “Find the letter bubble!” / “¡Busca la burbuja con la letra!” |
| **Letter Fishing** | Fern Fox `🦊` | Pond scene; answer tiles become floating lily-pad/bobber shapes with reeds and ripples | Gentle splash/pluck; “Catch the letter!” / “¡Atrapa la letra!” |
| **Letter Rocket** | Bolt `🤖` | Night launch scene; answer tiles sit on launch pads with stars; correct choice gets a brief rising trail | Short rising launch tone; “Launch the letter!” / “¡Lanza la letra!” |
| **Letter Rain** | Umbrella friend `☂️` | Rain-cloud scene; rounded raindrop answer tiles and puddle accents | Soft descending raindrop notes; “Catch the rainy letter!” / “¡Atrapa la letra de lluvia!” |

These cues will frame the unchanged “find the letter” prompt rather than describe a different interaction.

### Five `buildWord` games

| Game | Mascot / guide | Visual treatment | Sound / phrase treatment |
|---|---|---|---|
| **Word Builder** | Bolt `🤖` | Workshop scene; destination row is a building foundation and letters are chunky blocks | Gentle wooden tap; “Build the word!” / “¡Construye la palabra!” |
| **Word Puzzle** | Ollie Owl `🦉` | Puzzle-table scene; destination cells resemble puzzle slots and letters use puzzle-piece edging | Soft click-fit motif; “Complete the word puzzle!” / “¡Completa el rompecabezas de palabras!” |
| **Word Rocket** | Rocket pilot `🚀` | Starfield scene; destination cells form a rocket and letters look like fuel cells | Rising launch notes; “Fuel the word rocket!” / “¡Carga el cohete de palabras!” |
| **Word Train** | Bramble Bear `🐻` | Rail scene; placed letters become connected train cars and unused letters sit at the station | Soft chug/bell motif; “Build the word train!” / “¡Arma el tren de palabras!” |
| **First Word Builder** | Fern Fox `🦊` | Friendly classroom/playroom scene; large alphabet-block slots with the calmest decoration | Warm two-note block sound; “Make your first word!” / “¡Forma tu primera palabra!” |

The sequence remains tap-the-next-letter for all five; only the scene, framing, guide, and feedback character change.

## Remaining repeated families

Give every title in the other 20 repeated families a distinct theme entry using its title as the source of truth. Examples include animals/stars/monster/train/fruit for `countObjects`; pop/bubbles/fishing/rocket for `findNumber`; train/garden/bridge/race for ordered letters; train/maze/rain/path for ordered numbers; and safari/maze/detective for letter hunts.

For titles without a natural character, use the catalog’s themed object as the guide rather than forcing one of the five recurring characters. This keeps mascots intentional and removes arbitrary rotation.

## Copy and metadata audit

No live copy needs changing for mechanical-uniqueness claims:

- **“Browse all 100 games”** is generated from `GAMES.length` and accurately describes 100 catalog entries.
- **“Game X of 100”** accurately identifies the current entry’s catalog position.
- **“100 games to play”** on the worlds screen is also a catalog count, not a claim of 100 mechanics.
- The home and per-game JSON-LD describe the product/categories or one individual game; neither claims 100 unique mechanics.
- “Hundreds of bite-sized…” is supportable as activity/content variety, but it does not say there are hundreds of unique interactions, so it will remain unchanged.

The internal README contains older “100+ original mini-games” planning language, but it is not shipped user-facing copy. This presentation task will not rewrite internal product history. External store-console copy cannot be verified from the repository; no outside setting change is planned.

## Expected files

- `src/lib/game-themes.ts` — typed per-game presentation registry and neutral fallback.
- `src/routes/game.$gameId.tsx` — select the theme by game ID and pass it to the active renderer; remove number-based mascot rotation.
- `src/components/game/ChoiceGame.tsx` — themed scene, option treatment, cue, and flourish without touching answer/scoring logic.
- `src/components/game/OrderGame.tsx` — themed sequence presentation without touching order/scoring logic.
- `src/components/game/HuntGame.tsx` — themed search presentation without touching hunt/scoring logic.
- `src/components/game/MemoryGame.tsx` — themed card presentation without touching matching/scoring logic.
- `src/lib/speech.ts` — only if needed for a small reusable synthesized theme motif; narration routing and voice selection remain unchanged.
- `src/styles.css` — semantic theme utilities, responsive safeguards, reduced-motion handling, and high-contrast-compatible variants.

No catalog rows, round generators, purchase paths, parental gate, subscription logic, premium flags, or metadata copy will change.

## Verification

- Run the TypeScript check and production build.
- Use Playwright on phone and tablet/desktop sizes to compare every title in the `findUpper` and `buildWord` groups, plus samples from each remaining repeated family.
- Confirm each sibling has a visibly relevant treatment and intended mascot, while prompts, option data, scoring, difficulty, and completion behavior remain unchanged.
- Verify theme sounds obey the sound-effects toggle; decorations stop under reduced motion; high contrast remains readable; English and Spanish cues fit without overlap.
- Confirm free/premium locks and routes are unchanged.
