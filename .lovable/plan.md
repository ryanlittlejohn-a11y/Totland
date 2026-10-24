# Findings: word tracing layout + printables inventory (no changes made)

## 1. Word tracing layout

**(a) What happens now.** The word game shows a row of letter chips (done = green, current = clay, upcoming = grey) and one full-size tracing frame showing **only the current letter**. When the child taps Done with at least 55% coverage, a new frame loads for the next letter. When the last letter passes, the word is saved as done. Three words make one session.

**(b) 3, 4 and 5 letters.** It works the same way for every length. Only the word list changes.

**Two things found while tracing the code:**
- Letters traced inside words are **never added to the big/small letter counts**. Only the single-letter game adds to them. So the Words stage does nothing to help the child open the longer-word stages.
- No stroke guides exist anywhere. "Tracing" means painting over a big faint letter until enough of a rough 20px grid is covered. There is no stroke order, direction, start dot or baseline. A rough scribble inside the box also passes.

**(c) What one-frame word tracing would take**
- **Layout:** draw the whole word as faint letters along one shared baseline, with 4-line handwriting guides (top, midline, baseline, descender). Letter size comes from the frame width and the longest word: about 0.75 x height per letter, so 5 letters fit in a 5:2 frame. On a 360px-wide phone that gives letters about 60px wide (about 90px tall). On an iPad around 1,000px wide, cap them at about 160px. Frames for 2–3 letter words would be shorter, or the letters centred.
- **Order across letters:** each letter gets its own area. Only the current letter is active and highlighted; the others are dimmed. Ink from finished letters stays visible. Coverage is counted only inside the active letter's area, so painting over a neighbour doesn't count. Real stroke order would need new stroke-path data for about 52 English forms plus Ñ ñ and accented vowels. That is a separate, larger job. First version: left-to-right per letter, using area coverage.
- **Progress:** keep the current letter chips above the frame and add a tick under each finished letter in the frame. Option: let the 55% check finish each letter automatically, without a Done tap per letter.
- **Completion:** the same flow as today (one check per letter, then word saved, then 3 words, then finish). Decision for Ryan: should traced word letters also call the save-letter step so they count toward unlocking? Today they don't.
- **Spanish:** the 2–5 letter Spanish lists have **no ñ words**; the ñ words are only in the main word bank. They do include accented letters (tú, sí, búho, avión, limón, ratón, árbol). The accent sits above the cap line, so the guides need extra headroom. Splitting words must keep each accented letter whole as one piece; the current code already does this. If ñ words are added (e.g. "niño", "piña", "baño"), the tilde needs the same headroom. Also the Spanish 2-letter list has only 6 words, so it repeats sooner.

**(d) Risks**
- Small letters on phones (about 60px for 5 letters) are harder for 2–4 year olds. A possible fallback for 5-letter words on narrow phones is to zoom on the active letter.
- The canvas is drawn at a fixed 600x600 internal size. A wide frame needs a new size and new coverage numbers, and the current 55% bar would need re-tuning for each letter's area.
- Font rendering differs between devices, so letter areas must be measured at run time (from the self-hosted Baloo font) after the font has loaded.
- The round must stay frozen once dealt (an existing project rule). That doesn't change here.
- No new narration is needed if the same spoken lines are kept.

**(e) Unlock levels (10/14/18/22 different letters).** No change is needed for the layout itself. Two separate decisions remain open:
- Should repeats count toward the 10? This is still unanswered from the earlier fix.
- Should letters traced inside words count? Today they don't, so a child can only reach the 3/4/5-letter stages by going back to single letters. That is probably the bigger surprise for Ryan. The levels could stay as they are if word letters count.

## 2. Printables inventory

**Content that could be reused**
| Asset | Where | Print readiness |
|---|---|---|
| Letter glyphs EN (26) / ES (27 with Ñ), digits 0–9 | content.ts | Text in Baloo font only. No stroke guides or start dots; these would need to be drawn |
| English word bank, 93 words + emoji + letter | content.ts WORDS | Ready as a list |
| Spanish word bank, 89 words / 27 letters | content.ts WORDS_ES | Ready as a list |
| Tracing word tiers 2–5 (EN 15/15+/22/24, ES 6/9/22/26) | content.ts TRACING_WORDS | Ready |
| Short CVC spelling words EN/ES | content.ts | Ready |
| Word Finds: 100 themes, grid builder (fixed per seed, across/down only, 6/8/10 grids) | wordfinds.ts, wordfind-puzzle.ts | **Best fit**: builds a grid plus word list for a page, ready to print. Fill letters come from A–Z only (no Ñ) and accents are stripped |
| Flash cards (picture + word + letter) | WORDS / FlashCards | Ready as data. Pictures are emoji |
| Shapes (6, drawn from outlines) | SHAPES + outline data | Prints cleanly at any size |
| Colours | COLORS | Ready (print colour depends on the printer) |
| Counting objects | emoji sets in rounds/scenes | Emoji only |
| Number mazes | number-maze.ts, hand-made layouts by level | Easy to turn into dot-to-dot sheets |
| Jigsaw art: 6 animals + 6 vehicles (JPG) | src/assets/jigsaw* | Usable photo-style art. Check rights in docs/content-rights-register.md first |
| Illustrations | almost none beyond jigsaw, icon and feature graphic | Most visuals are emoji |

**Print/PDF capability today:** none. No print styles, no PDF library, no server-side PDF tool, and no `window.print` use. Choices: (1) a print-styled page plus the browser's print (simplest; works on the web; on iOS/Android in-app printing is limited); (2) building the PDF in the browser on the device (works offline, adds a few hundred KB); (3) building the PDF on the server (needs network; the worker server can't run a headless browser).

**Emoji font issue:** yes, it affects printing. The project has no emoji font of its own and uses the device's system emoji (the headless test browser showed blank boxes). Browser printing on a normal device prints colour emoji, but they look different on each system. A PDF builder can't draw system emoji at all without embedding emoji images. For reliable printables, use packaged emoji images (e.g. an openly licensed set, self-hosted to respect the no-third-party rule and logged in the rights register) or original drawings.

**Gating options for a teacher area**
- It must sit **behind the parental gate** (under /parent). It would have file downloads and maybe external links, and child screens must never link to pages like that (Apple Kids rule already in place).
- Free vs Premium could follow existing rules: Word Finds already have "first 30 free"; the catalog split could match. Premium checks must stay on the server (never trust Premium stored on the device).
- Requiring a grown-up account (sign-in) for teacher printables is possible, but it means touching sign-in and subscription access. That needs Ryan's approval under the sensitive-areas rule.

**Accessibility settings that already exist** (per child, in the profile, set from the parent dashboard): narration on/off, sound effects on/off, music on/off with volume, reduced motion (moving games use a still alternative), high contrast. There is also tap/VoiceOver input as an option instead of dragging, and the parental gate. Not present: a calmer/low-stimulation mode (fewer reward effects), extra-large text, visual schedules, or session timers. These are worth considering for autistic children.

## Decisions needed from Ryan
1. Build the one-frame word layout? Auto-advance per letter or keep Done?
2. Should word letters count toward unlocking, and should repeats count?
3. Printables: print-friendly page vs on-device PDF; emoji-image source; Free/Premium/account for the teacher area.
