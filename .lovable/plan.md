# Social artwork and reels: scope and cost

## 1. What I can produce
- Static cards: real PNG files, 1080x1350 (Instagram/Facebook portrait) and 1200x630 (Facebook link/landscape). Approach: an HTML template using your real fonts (Baloo 2, Nunito Sans) and colours, rendered to PNG in a headless browser. Text comes out exactly right with no AI spelling errors, and your artwork stays pixel-true.
- Reels: real silent MP4s, 1080x1920, 8–15 s, with captions built in. Made with simple motion (fades, gentle slides, a slow zoom on a still) or by putting captions over Ryan's own screen recordings. I won't make AI-generated "gameplay" or fake app screens.
- Not realistic: AI video of your mascot that stays on-model, or footage that looks like the app. Both break the rules.

## 2. Proposed 8 cards (copy for review)
| # | Theme | Headline | Small line |
|---|---|---|---|
| 1 | Storybooks | Story time, at their pace | Read-along stories in English and Spanish |
| 2 | Flash cards (Premium) | Flash cards for little learners | Part of Totland Premium |
| 3 | Puzzles | Little puzzles, big focus | Jigsaws made for small hands |
| 4 | Beginning sounds | What sound does it start with? | Beginning-sound games for early readers |
| 5 | Word finds | Find the word | Gentle word-finding games for new readers |
| 6 | Question for parents | What does learning play look like at your house? | Tell us in the comments |
| 7 | Grown-up check | Grown-ups first | Purchases and settings sit behind a grown-up check |
| 8 | Printables | Print a page, take a break from screens | Free sample sheets on the website |

Before rendering, I'll check every line against the app: that the stories have both languages, that word finds and the flash cards are Premium, and that the jigsaw wording is accurate.

Artwork I'd reuse (no new characters): the jigsaw pictures in `src/assets/jigsaw` and `src/assets/jigsaw-vehicles`, the Totland T icon/profile, the Facebook cover style, and the cleared gameplay crop from the dots ad. Cards 1, 2, 4 and 5 work best with your real screenshots. If those are missing, I'd use plain type-only cards rather than invent anything.

## 3. Where files live
- Output goes to Files under `/mnt/documents/social/2026-11/` (cards/, reels/, captions.md, plus a ZIP). It stays outside the project, so it can't reach the website or the app.
- Checked: the app bundle is copied only from the website build output (`scripts/prepare-native-bundle.mjs`), and `CAP_BUILD` in `vite.config.ts` controls the app build. Only `public/` and imported `src/` files ship. Nothing in Files gets bundled.
- Downloads: PNG cards, MP4 reels, and one ZIP.
- Risk to app code: none. No project files change.

## 4. Credit estimate (rough)
- (a) 8 cards with the HTML-to-PNG method: about 15–30 credits of agent work. No image-generation fees, and every card is checked by eye. Landscape versions add about 5–10.
- (b) 4 reels made from the cards with simple motion (FFmpeg): about 20–40 credits. With Ryan's recordings plus captions: about the same. Generated-video reels: much more (each clip costs extra) and riskier, so I don't recommend them.
- Cheapest sensible option: 8 HTML-rendered portrait cards, then 4 simple-motion reels from the same cards or Ryan's clips. Total about 35–70 credits.

## Decisions for Ryan
- Approve or edit the copy above.
- Will you send screen recordings and screenshots (storybook, flash cards, beginning sounds, word find)?
- Portrait only, or portrait plus landscape?
