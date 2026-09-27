# Fix Spanish rhymes and tracing wording

## Proposed Spanish rhyme content

Keep the existing 10 English pairs unchanged. Give Spanish its own 10-pair bank so the game selects genuine Spanish rhymes instead of translating English words independently:

| Pair | Meaning | Ending |
|---|---|---|
| gato / pato | cat / duck | -ato |
| rana / lana | frog / wool | -ana |
| ratón / botón | mouse / button | -ón |
| queso / beso | cheese / kiss | -eso |
| conejo / espejo | rabbit / mirror | -ejo |
| fresa / mesa | strawberry / table | -esa |
| ardilla / silla | squirrel / chair | -illa |
| limón / camión | lemon / truck | -ón |
| estrella / botella | star / bottle | -ella |
| caracol / sol | snail / sun | -ol |

Add matching child-friendly picture symbols for every Spanish word. Spanish prompts, answer choices, hints, and reveals will all use this Spanish bank; English keeps its current bank and behavior.

## Correct Spanish tracing wording

The actual tracing set contains six shapes. Use these translations and articles everywhere the tracing activity displays or speaks them:

- el círculo
- el cuadrado
- el triángulo
- la estrella
- el corazón
- el rombo

Use **el** for every numeral, for example:

- “Vamos a trazar el 5. Sigue la línea con tu dedo.”
- “Ahora traza el 5.”
- “¡Qué bonito el 5! ¡Muy bien!”

Apply the matching article and adjective to shapes, for example:

- “Vamos a trazar el círculo. Sigue la línea con tu dedo.”
- “Ahora traza la estrella.”
- “¡Qué bonito el triángulo! ¡Muy bien!”
- “¡Qué bonita la estrella! ¡Muy bien!”

Keep letter tracing’s existing feminine wording unchanged. Make retry wording neutral for non-letter tracing so it cannot use the wrong gender. Translate the visible shape instruction as well as narration, while retaining the English internal shape identifiers needed by the tracing canvas.

## Verification

- Exercise the Spanish rhyme generator repeatedly and confirm only the proposed pairs appear, every correct choice genuinely rhymes, distractors still work, and English output is byte-for-byte unchanged.
- Exercise all digits 0–9 and all six shapes through initial, next, success, and retry narration states; confirm correct nouns, accents, articles, and adjective agreement.
- Confirm letter tracing remains unchanged and the tracing canvas still receives its existing internal identifiers.
- Check the relevant game screens in Spanish and English, then check the app’s build result.
- Audit the shared clip library against the final Spanish text and report every new or replaced Lucy line, exact line count, exact character count, and credit estimate. Do not generate audio.

## Scope

Only Spanish rhyme data and Spanish number/shape tracing wording will change. No English content, scoring, game behavior, sign-in, payments, or audio files will be changed.
