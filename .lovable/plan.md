# Hannah's voice for Totland

Replace the built-in robotic device voice with your chosen ElevenLabs Hannah voice (`ZSNL4hPqCnqoMPaI4jGX`) everywhere the app talks to kids: games, flash cards, storybooks, tracing, rewards, and the welcome screens.

## How it will work

- The app asks our server for the spoken line, the server asks ElevenLabs with Hannah's voice, and the audio plays back to the child.
- Every line that gets spoken is saved on the device the first time it's heard, so repeats are instant and cost nothing.
- Common lines (letters A–Z, numbers 1–20, colors, shapes, praise like "Great job!", game instructions) are quietly downloaded ahead of time the first time a family opens the app online, so offline play already sounds like Hannah.
- Offline: any saved line plays in Hannah's voice. If a brand-new line has never been heard before and there's no internet, the app falls back to the built-in device voice so a child is never left in silence.
- Emoji are still stripped out before speaking, and the narration on/off switch keeps working exactly as today.

## Spanish

Spanish will use its own native-sounding voice. Send me that voice ID from your ElevenLabs library and I'll wire it in. Until then, Spanish will use Hannah through the multilingual model so nothing breaks.

## Connecting your ElevenLabs account

Your ElevenLabs connection exists in the workspace but isn't linked to this project yet, so I'll open a short connect card for you to approve. That's the only step you need to do.

## Cost note

Speech is generated once per unique line and then reused forever on that device, so ongoing usage stays low after the first play sessions.

## Technical details

- Link the `elevenlabs` standard connector (connection "Ryan's ElevenLabs", API-key auth, direct API — no gateway) so `ELEVENLABS_API_KEY` is available server-side.
- New `src/lib/tts.functions.ts`: `createServerFn` POST that takes `{ text, lang }`, validates with Zod (length cap ~500 chars), calls `https://api.elevenlabs.io/v1/text-to-speech/{voiceId}?output_format=mp3_44100_128` with `eleven_multilingual_v2`, voice settings tuned warm (stability 0.5, similarity 0.75, style 0.4, speaker boost on, speed ~0.95), and returns base64 MP3.
- Rewrite `src/lib/speech.ts` `say()` to be async-safe and non-blocking: hash `text+lang+voiceId`, look up a Cache Storage entry (`totland-voice-v1`), play via a single reused `HTMLAudioElement`; on miss and online, fetch from the server fn, store in cache, play; on miss and offline (or any error), fall back to the existing `speechSynthesis` path. Keep `stripEmoji`, `setNarration`, and the `chime` API unchanged so no call sites change.
- Prewarm: a small background routine that walks a fixed phrase list from `src/lib/content.ts` / `src/lib/i18n.ts` and caches clips with limited concurrency, triggered once online after first load.
- Voice IDs in one config: `en: ZSNL4hPqCnqoMPaI4jGX`, `es: <pending>` (falls back to the English ID).
- The generated service worker keeps ignoring the TTS endpoint; audio caching is handled explicitly by the Cache Storage layer above.
