# Spanish Letter Word Bank — Findings and Proposal

Read-only findings, then a proposal. Nothing changes until approved.

## 1. How Spanish letter content is made today

There is **no Spanish word list for letters**. One English list (93 picture words, A–Z) drives everything:

```text
English word list (content.ts)  ->  letter = first English letter ("umbrella" -> U)
        |
round built in English: "U is for umbrella!"
        |
translated at display time (i18n.ts): sentence template "{} is for {}" -> "¡{} es de {}!"
        + noun lookup "umbrella" -> "paraguas"
        =  "¡U es de paraguas!"
```

The letter comes from the English spelling; only the noun is swapped. So whenever the Spanish word starts with a different letter, the line is wrong. Same problem in:
- "Which one starts with…", "Which letter starts…", "Which word starts like…" (phonics games)
- Spelling and missing-letter games: the tiles spell **C-A-T** while the voice says "gato".
- Flash cards: "C es de gato".

Spanish word tracing is **not** affected — it already has its own authored Spanish words.

## 2. All 26 letters today (93 words: 34 correct, 59 wrong in Spanish)

| Letter | English words → Spanish | Correct in Spanish |
|---|---|---|
| A | apple→manzana, ant→hormiga, avocado→aguacate, airplane→avión, acorn→bellota | 2 of 5 |
| B | ball→pelota, bear→oso, banana→plátano, bus→autobús, bee→abeja, boat→barco | 1 of 6 |
| C | cat→gato, cake→pastel, car→coche, cow→vaca, cloud→nube, carrot→zanahoria | 1 of 6 |
| D | dog→perro, duck→pato, drum→tambor, donut→dona, dinosaur→dinosaurio | 2 of 5 |
| E | egg→huevo, elephant→elefante, eye→ojo | 1 of 3 |
| F | fox→zorro, fish→pez, frog→rana, flower→flor, fire→fuego | 2 of 5 |
| G | goat→cabra, grapes→uvas, gift→regalo, guitar→guitarra | 1 of 4 |
| H | hat→sombrero, horse→caballo, house→casa, honey→miel | **0 of 4** |
| I | ice cream→helado, igloo→iglú, insect→insecto | 2 of 3 |
| J | jam→mermelada, jellyfish→medusa, juice→jugo | 1 of 3 |
| K | kite→cometa, key→llave, koala→koala | 1 of 3 |
| L | lion→león, leaf→hoja, lemon→limón, ladybug→mariquita | 2 of 4 |
| M | moon→luna, mouse→ratón, milk→leche, monkey→mono | 1 of 4 |
| N | nest→nido, nose→nariz, night→noche | 3 of 3 |
| O | owl→búho, orange→naranja, octopus→pulpo | **0 of 3** |
| P | pig→cerdo, pear→pera, panda, pizza, penguin→pingüino | 4 of 5 |
| Q | queen→reina, quilt→colcha | **0 of 2** |
| R | rabbit→conejo, rainbow→arcoíris, robot, rocket→cohete | 1 of 4 |
| S | sun→sol, star→estrella, snake→serpiente, strawberry→fresa, socks→calcetines | 2 of 5 |
| T | tree→árbol, tiger→tigre, train→tren, turtle→tortuga | 3 of 4 |
| U | umbrella→paraguas, unicorn→unicornio | 1 of 2 |
| V | van→furgoneta, violin→violín | 1 of 2 |
| W | whale→ballena, watermelon→sandía, wagon→camioneta | **0 of 3** |
| X | xylophone→xilófono | 1 of 1 |
| Y | yarn→lana, yo-yo→yoyó | 1 of 2 |
| Z | zebra→cebra, zipper→cremallera | **0 of 2** |

The 15 spelling words (cat, dog, sun, hat, bus, pig, cow, bee, fox, cup, net, van, bed, key, egg) are all spelled in English even in Spanish mode.

## 3. Spanish alphabet handling today

- The app uses the **English 26 letters only**. There is no Ñ anywhere in the letter games, alphabet order games, letter tracing or the word list.
- CH and LL are not treated as letters (correct — the RAE dropped them in 2010).
- Tricky letters for this kind of game:
  - **H** is silent in Spanish, so "which letter makes this first sound?" doesn't work for H.
  - **K, W, X** have very few words toddlers know, and they're mostly borrowed words.
  - **Q** only appears as "que/qui", so the only toddler word is queso.
  - **Ñ** is a real letter in Spanish but has almost no starting words a toddler would know.
  - **C and G** have two sounds each (casa/cebra, gato/gemelo). Picking only hard-sound words keeps the sound games honest.

## 4. Proposed Spanish word list (27 letters, about 95 words)

Simple nouns a 2–6 year old knows: animals, food, toys, body, home. I avoided words that change by country (no coche/carro, plátano/banana, furgoneta).

| Letter | Proposed words |
|---|---|
| A | abeja 🐝, avión ✈️, araña 🕷️, árbol 🌳 |
| B | barco ⛵, ballena 🐳, bebé 👶, burro 🫏 |
| C | casa 🏠, conejo 🐰, cama 🛏️, cohete 🚀 (hard C only) |
| D | dedo ☝️, dado 🎲, dinosaurio 🦖, delfín 🐬 |
| E | elefante 🐘, estrella ⭐, erizo 🦔, escoba 🧹 |
| F | flor 🌻, fresa 🍓, foca 🦭, fuego 🔥 |
| G | gato 🐱, gallina 🐔, globo 🎈, guitarra 🎸 (hard G only) |
| H | helado 🍦, huevo 🥚, hoja 🍃, hormiga 🐜 — **judgment call:** H is silent, so use it for letter-recognition only, not "first sound" questions |
| I | iglú 🧊, isla 🏝️, insecto 🐞, imán 🧲 |
| J | jirafa 🦒, jugo 🧃, jabón 🧼, jaguar 🐆 |
| K | koala 🐨, kiwi 🥝 — **judgment call:** only two realistic words |
| L | luna 🌙, león 🦁, limón 🍋, leche 🥛 |
| M | mono 🐵, manzana 🍎, mano ✋, mariposa 🦋 |
| N | nube ☁️, nariz 👃, nido 🪹, naranja 🍊 |
| Ñ | ñu — **judgment call:** the only common word, there's no emoji for it and it's unfamiliar. Recommend letter recognition and tracing for Ñ, with the reveal "¡Ñ, como en piña! 🍍" instead of "es de" |
| O | oso 🐻, ojo 👁️, oveja 🐑, oreja 👂 |
| P | pato 🦆, perro 🐶, pez 🐟, pelota ⚽, pera 🍐 |
| Q | queso 🧀 — **judgment call:** the only toddler word |
| R | ratón 🐭, rana 🐸, robot 🤖, reina 👑 |
| S | sol ☀️, sandía 🍉, serpiente 🐍, sombrero 🎩 |
| T | tortuga 🐢, tigre 🐯, tren 🚂, tambor 🥁 |
| U | uvas 🍇, unicornio 🦄 |
| V | vaca 🐄, vela 🕯️, violín 🎻, volcán 🌋 |
| W | wafle 🧇 — **judgment call:** an accepted borrowed word; the alternative is to leave W out of Spanish sound games |
| X | xilófono 🎹 — **judgment call:** only one word, and the X sound varies; letter recognition only |
| Y | yoyó 🪀, yate 🛥️ |
| Z | zorro 🦊, zapato 👟, zanahoria 🥕 |

Spanish spelling and missing-letter words would come from the short Spanish words already used in Spanish tracing (sol, oso, pez, pan, mar, luz, gato, casa, luna…), so tiles and voice match.

## 5. Blast radius

Games that depend on this word list (Spanish mode only):
- Letter games that end with a "… is for …" line: Letter Pop, Feed the Letter Monster, Letter Bubbles, Letter Fishing, Letter Rocket, Letter Rain (6).
- Sound games: What Starts With B?, Beginning Sound Train, Sound Match, Sound Detective, Same Sound (5).
- Spelling: Missing Letter Word, Word Fishing, Word Builder, Word Puzzle, Word Train, First Word Builder, Word Rocket (7).
- Also: Flash Cards (93 cards; Spanish would get its own ~95), the Letters/Sounds/Puzzles quick-play pages, and Daily Adventure.
- Not affected: Spanish word tracing, picture-matching and memory games (they only show the picture and say the word, which is already correct).

Spanish lines: about **790 of the 2,177 missing Spanish lines** come from this list ("es de", "empieza con", "empiezan con", "¿Qué letra empieza…?", "empieza como", spelling prompts). The fix replaces them with roughly the same number of new correct lines (~20,000 credits, generated later with approval). A handful of wrong Spanish lines already in the library simply stop being used. Nothing is deleted.

Fixing only the "es de" lines isn't enough. The sound and spelling games would still ask about the English first letter, so the word list itself has to change.

Also needs a decision: should Ñ be added to Spanish letter games, alphabet order games and letter tracing? It's recommended, because it's part of the real Spanish alphabet. This changes Spanish alphabet order (N, Ñ, O).

## If approved: what gets built

1. Add an authored Spanish word list (the table above, after your edits). English stays exactly as it is.
2. Spanish rounds pick letters and words from the Spanish list. "Starts with" answers come from the Spanish spelling.
3. Spanish spelling games use the short Spanish word list, so tiles match the voice.
4. Spanish Flash Cards use the Spanish list.
5. Optional (your call): add Ñ to Spanish letter games, alphabet order and tracing.
6. Tests: every Spanish word starts with its letter; English list unchanged; no "first sound" questions for H, Ñ or X.
7. Re-run the narration scan to give the new Spanish line count and credit estimate. No audio is generated.

## Technical details

- New `WORDS_ES` in `content.ts` with `letter` set explicitly. Add `wordsFor(lang)` / `wordsForLetter(letter, lang)` and use them in `rounds.ts` (findUpper, startsWith, letterSound, sameSound, missingLetterWord, buildWord) and `games.ts` (letterRound, phonicsRound, puzzleRound).
- Spanish rounds skip `translateRound` noun swapping for these words, since they're already Spanish. The sentence templates still apply.
- `LETTERS_ES` (27 letters with Ñ) only if item 5 is approved.
- `FLASH_CARD_COUNT` stays based on the English list unless you want counts per language. The displayed "93 flash cards" copy would be checked.
