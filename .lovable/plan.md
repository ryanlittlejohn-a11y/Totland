# Audit: Hannah's 30 rejected lines, plus Spanish Tier 2 and Tier 3

This is a count and review only. No audio has been generated and no code has changed. Approving this plan approves only the wording fixes below. Any recording still needs its own approval.

## 1. The 30 English lines Hannah's voice setup rejects

All 30 are the same hint from the shape-pattern game. The cause is the single "…" character (one ellipsis symbol) at the end. The voice setup doesn't allow that symbol.

Current wording: "The pattern goes A, B, A, B…"

Suggested fix (smallest change): replace "…" with a period, giving "The pattern goes A, B, A, B."

That gives these 30 lines (made from the 5 shapes plus the star, in every ordered pair):

```text
square, heart, square, heart.         circle, star, circle, star.
diamond, star, diamond, star.         star, diamond, star, diamond.
circle, heart, circle, heart.         square, diamond, square, diamond.
diamond, triangle, diamond, triangle. star, square, star, square.
heart, circle, heart, circle.         square, star, square, star.
square, triangle, square, triangle.   triangle, diamond, triangle, diamond.
triangle, star, triangle, star.       heart, square, heart, square.
diamond, square, diamond, square.     triangle, circle, triangle, circle.
star, circle, star, circle.           heart, diamond, heart, diamond.
heart, triangle, heart, triangle.     triangle, heart, triangle, heart.
square, circle, square, circle.       circle, square, circle, square.
diamond, heart, diamond, heart.       triangle, square, triangle, square.
circle, triangle, circle, triangle.   diamond, circle, diamond, circle.
star, heart, star, heart.             star, triangle, star, triangle.
heart, star, heart, star.             circle, diamond, circle, diamond.
```

(Each line starts with "The pattern goes ".) Recording them later would cost about 1,500 characters. The Spanish version has the same "…" problem, and the same fix applies: "El patrón es A, B, A, B."

## 2 and 3. Spanish Tier 2 and Tier 3: counts

I compared every Spanish line the games can say with what Lucy has already recorded.

| | Missing lines | Characters |
|---|---|---|
| Tier 2: prompts, ordering games, Word Finds | 1,395 | 34,418 |
| Tier 3: teaching lines and hints | 2,077 | 45,723 |
| Both | 3,472 | 80,141 |

- Another 30 Spanish Tier 3 lines are the pattern hint with the same "…" problem. They aren't counted above.
- **Balance:** 47,308 credits left this billing cycle (77,542 of 124,850 used).
- **Cost:** in the last three batches, ElevenLabs charged about 44% of the character count. At that rate, both tiers would cost about 35,000 credits and would fit. Charged at the full character count (80,141), they would not fit.

## The Spanish has serious problems: about half shouldn't be recorded as it is

Many letter and phonics games teach with English words and English letters. The Spanish lines swap in the Spanish word but keep the English letter, so what they teach is wrong. Wording fixes can't solve that.

| Problem | Example (current Spanish, from English) | Lines |
|---|---|---|
| Starting letter no longer matches the word | "¡paraguas empieza con U!" (umbrella), "¡ballena empieza con W!" (whale) | about 390 |
| Sound hint letter doesn't match | "La D suena D. Escucha: perro." (dog), "cerdo — P." (pig) | about 118 |
| "Letter is for word" doesn't match | "¡C es de gato!", "¡H es de sombrero!", "¡T es de árbol!" | 59 |
| Spelling prompt names the Spanish word, but the tiles spell the English one | "Deletrea la palabra gato." while the tiles spell C-A-T | 15 |
| Missing-letter prompt: same mismatch | "¿Qué letra completa la palabra vaca?" while the word shown is C_W | 96 |
| Word Finds word said in English | "¡Encontraste cow!", "¡Encontraste pig!" (every Word Finds word) | 515 |
| English left in the sentence | "Which shape fits this shadow?", "¡A whale es big!", "¿Qué grupo tiene more?", "Piensa en home.", "ice cream" | 9 |
| Wrong gender | "la cesta morado / rojo / amarillo" (should be morada / roja / amarilla), "es un estrella" (should be una) | 4 |
| Blank where a picture was | "¡ es morado!", "Un cuadrado se ve así: ." | 50 |
| Awkward or missing article | "¡aguacate era diferente!" (should be ¡El aguacate era diferente!), "¡Sigue 4!" (should be ¡Sigue el 4!) | 110 |

Note: the English versions of the "blank where a picture was" lines have the same problem ("purple looks like ."). Some of them were recorded in English Tier 3. They're worth fixing and re-recording in English too, at under 1,000 characters.

## What's safe to record now

| | Clean lines | Characters |
|---|---|---|
| Tier 2 | 646 | 17,092 |
| Tier 3 | 1,169 | 23,640 |

The clean lines are counting, comparing, number sequences, colors, shapes, "Encuentra: ..." prompts, and the fixed Word Finds start and finish lines. About 18,000 credits at the usual rate, or 40,700 at most. Either way it fits the remaining balance.

## Recommendation

1. **Now:** fix the "…" in both languages, the 4 gender errors, the 9 English leftovers, the 50 blanks where a picture was, and the 110 missing articles. These are small text-only fixes.
2. **Then record:** the clean Spanish lines plus the fixed ones, about 2,000 lines, and the 30 English pattern hints. If only one tier fits, do Tier 3 first. It fixes exactly what the tester hears on every correct answer.
3. **Hold:** the Spanish phonics, spelling, missing-letter and Word Finds lines, about 1,190 lines. Like the rhyme game, they need a Spanish word bank of their own, which changes game content. That's a separate decision to plan, so don't record them until then.

## Technical notes

- Pattern hint: `src/lib/rounds.ts` line 452 and `src/lib/i18n.ts` line 184 — change "…" to ".".
- Gender, articles and English leftovers: add or fix sentence patterns in `src/lib/i18n.ts`. The basket needs a color-agreement form. "Which shape fits this shadow?" and "Which group has more/fewer?" have no Spanish pattern yet. The size and "home" reveals partly fall back to English.
- Blanks: the reveals and hints that end in a picture symbol lose it when the picture symbol is stripped for speech. Reword to drop the trailing symbol slot (e.g. "morado se parece a ." becomes "Así es el morado."), in both languages.
- Word Finds narrates `match.word` without translating it. The grid itself is English letters, so a proper fix needs Spanish word lists, which goes with the held phonics work.
- Line counts come from running every choice, Daily Adventure/Quick Play and ordering game at levels 1–5 thousands of times. A second full pass found no new lines. Library check: hash of "es:" plus the line, compared against the 6,760 stored clips.
