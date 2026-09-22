# Lucy as the Spanish narration voice + 10-line test batch

## What I found

The app already has a reliable language signal, so nothing is missing:

- Every spoken line goes through `say()` in `src/lib/speech.ts`, which reads the current app language (`getLang()`, English or Spanish) and passes it along with the text.
- The server side (`src/lib/tts.functions.ts`) already keeps a voice per language — today both English and Spanish point at Hannah.

So adding Lucy is a one-line change to that voice table. Nothing about English narration, music, the offline screen or Premium is touched.

## The change

- Spanish requests use Lucy (`Bh4tkGuEEIADxUACafG5`), English keeps Hannah. Same model, same voice settings.
- Clips are stored per language, so existing English audio is untouched and any Spanish clips already recorded in Hannah's voice would need re-recording later (they are not deleted, just superseded when we bump the Spanish clip key). For this test batch I will use a separate test path so nothing in the shared library changes yet.

## The 10 Spanish test lines

Real lines the app already says: a game prompt, a "which picture" prompt, two numbers, two colors, a shape, and three praise phrases.

1. ¿Puedes encontrar la letra B?
2. ¿Cuál imagen es: gato?
3. cinco
4. tres
5. rojo
6. azul
7. círculo
8. ¡Muy bien!
9. ¡Buen intento!
10. ¡Maravilloso!

## Credit cost

About **115 characters total ≈ 115 ElevenLabs credits** (one credit per character). No other generation happens.

## How you'll listen

After you approve, I generate the 10 clips and put them on a temporary page at `/voice-test` — a simple list with a play button per line, showing the Spanish text. Nothing is wired into gameplay, and the page is removed once you've decided. Files land under `public/voice-test/01.mp3` … `10.mp3` so you can also download them.

## Technical details

- `src/lib/tts.functions.ts`: `VOICES.es = "Bh4tkGuEEIADxUACafG5"`; English entry unchanged.
- Test generation runs once from a throwaway script that calls ElevenLabs directly with the same model/settings (`eleven_multilingual_v2`, stability 0.5, similarity 0.75, style 0.4, speaker boost, speed 0.95) and writes the MP3s into `public/voice-test/`. It does not write to the shared clip library, so no gameplay audio changes.
- `src/routes/voice-test.tsx`: a plain list of the 10 lines with `<audio controls>`, no layout or game dependencies.
- Unchanged: `src/lib/speech.ts`, music, `OfflineGate`, entitlement/premium logic, parental gate.

## Files that will change

- `src/lib/tts.functions.ts` (Spanish voice ID)
- `src/routes/voice-test.tsx` (new, temporary)
- `public/voice-test/01.mp3` … `10.mp3` (new, temporary)
