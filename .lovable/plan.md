# Animal Jigsaw — bespoke drag puzzle (plan)

## What exists today
- Catalog row 82 "Animal Jigsaw" (🐨, engine `choice`, kind `jigsawPiece`, puzzles skill, "Six-piece jigsaw", Premium).
- Siblings on the same `jigsawPiece` kind + ChoiceGame: row 68 **Shape Puzzle** and row 81 **Simple Jigsaw**. The generator is also reused by `completePicture` (Alphabet/Number Jigsaw-style games). All of these stay unchanged.
- The current "jigsaw" is not a picture at all: `jigsawPiece()` in rounds.ts picks a word+emoji and asks "Which piece completes the {word}?" with emoji choice tiles. So there are no existing jigsaw images to reuse.

## The open question: where the animal pictures come from

Pieces only need one picture per animal. Cutting happens in the browser: every piece shows the same image, cropped to its own jigsaw-shaped region with an SVG clip path. No image-cutting tool is needed with any option below.

| Option | How | Pros | Cons |
|---|---|---|---|
| **A. AI-drawn illustrations (recommended)** | Generate 6 matching cartoon animal pictures (lion, elephant, koala, turtle, fox, owl) in one flat, bold, toddler-friendly style, square, plain background, bundled in the app | Looks like a real jigsaw; recognizable animals; works offline; each piece clearly shows part of the animal (ear, eye, tail) so matching makes sense | About 6 small images (~60–120 KB each, ~0.5 MB total) added to the app download; I review each for style and leave out any that come out wrong |
| B. Code-drawn animals | Simple shapes (circles, ovals) drawn in code | Tiny, crisp at any size, easy to recolor for high contrast | Animals look basic and abstract; pieces are mostly blobs of one color, so children can't tell which piece goes where; lots of hand work per animal |
| C. Giant emoji cut up | One big 🦁 cut into pieces | No assets | Emoji look different on iPhone, Android and web; pieces are mostly flat color; cropped emoji often look blurry or broken |

Recommendation: **A**. B and C make the pieces too alike to be a fair puzzle for ages 2–6.

Silhouette: no extra image. The target outline is the same picture shown as a faint dark shape with dashed piece borders, so it always lines up exactly with the pieces.

## Piece count
- Six pieces in a 3x2 grid with rounded jigsaw tabs, which matches the catalog description. Pieces are about 110–140 px on a phone, well above the usual minimum touch size.
- The game already has age modes and levels, so easier play could start at 4 pieces (2x2) and step up to 6. **Your call:** always 6 (matches the description), or 4 then 6 as the child progresses.
- One animal per round, 3 animals per game (6 pieces x 5 rounds is too long for toddlers). I can make it 5 if you prefer.

## Interaction (same rules as the other three)
- Pieces sit scattered in a tray below the silhouette and can be dragged. Each has one correct slot.
- Wrong slot or dropped outside: the piece bounces back to the tray with a gentle "Hmm, try another spot." No recorded miss, no effect on stars or accuracy.
- Correct slot: the piece snaps in with a small "click" scale animation and a chime; that slot stops accepting drops (`isTargetEnabled`).
- Whole puzzle done: dashed borders fade, the full animal pops with praise and the animal name line ("You made a lion! 🦁"). After the last animal: full reward, `recordGameComplete`, then the normal finish screen.
- Tap fallback (Word Rocket pattern): tap a piece to select it (announced "Lion piece 3 selected"), then tap a slot. Slots are buttons with labels like "Top left spot" / "Arriba a la izquierda".
- Spoken bilingual instruction each round ("Put the lion back together!" / "¡Arma el león!") through the existing narration path. No new audio gets generated.
- No timers; `touch-action: none` on the play area; a second finger is ignored while dragging; reduced motion turns off tray wobble and snap/celebrate animations but keeps everything playable; high contrast gives pieces and slots thick outlines and makes the silhouette darker.

## Scope limits
- Only row 82 changes engine, to a new `jigsaw` engine with drag interaction. It stays Premium.
- ChoiceGame.tsx, rounds.ts `jigsawPiece`/`completePicture`, Shape Puzzle, Simple Jigsaw and every other game are left alone.
- The shared drag hook should need **no changes**: keyed handles plus `isTargetEnabled` already cover many pieces and many slots (the same shape as Word Rocket). If a gap turns up, it will be a small add-on only, and all three existing drag games get regression-tested.

## Technical details
- New files: `src/components/game/AnimalJigsawGame.tsx` (rounds, scoring, narration, completion), `src/components/game/JigsawPuzzleScene.tsx` (silhouette slots as `DragTarget`s `slot-0..5`, pieces via `getHandleProps(pieceId)`, SVG `clipPath` jigsaw shapes generated from the grid, picture shown via `<image>` with offsets), `src/lib/jigsaw-animals.ts` (animal list: id, EN/ES names, image import, emoji).
- Assets: `src/assets/jigsaw/{lion,elephant,koala,turtle,fox,owl}.jpg` (~768 px square, generated in one consistent style), imported like other bundled images so they work offline and in the native build.
- Edits: `src/lib/catalog.ts` (add `jigsaw` to EngineId, row 82 engine, drag interaction mapping), `src/routes/game.$gameId.tsx` (jigsaw branch), `src/styles.css` (tray, snap, celebrate, reduced-motion, high-contrast), `roadmap.md`, and the `i18n` strings the scene uses.
- Pieces match by piece id → slot id (each piece is unique, unlike repeated letters in Word Rocket).

## Verification
- Animal Jigsaw: a full game by drag with full reward; wrong-slot and off-target drops plus wrong taps bounce with no recorded answer and no star/accuracy change; a round completed with taps only; keyboard works; second pointer ignored; no page scroll or text selection; reduced motion and high contrast visible and playable; images load offline (no network requests for pictures).
- Regressions: Letter Fishing, Feed the Letter Monster and Word Rocket (drag, tap fallback, ignored second pointer, penalty-free wrong try).
- Spot-checks: Shape Puzzle and Simple Jigsaw are still tap-choice.
- Typecheck, build and runtime logs clean. Phone testing needs `bun run sync:app` plus a new Codemagic build.
