# Bundle the three music tracks into the app

Premium families are promised full offline play. Narration is already covered; the three soundtracks still stream. This puts the music inside the iPhone/iPad and Android app so it plays with no internet. The website keeps streaming exactly as today.

## 1. The three tracks today

| Track | Length | Quality | Size |
|---|---|---|---|
| Little Steps, Big Dreams (main screens) | 2:00 | 193 kbps stereo, 44.1 kHz | 2.9 MB |
| Curious Steps (activities) | 1:00 | 194 kbps stereo | 1.5 MB |
| Forest of Wonder (storybooks) | 2:30 | 193 kbps stereo | 3.6 MB |
| **Total** | 5:30 | | **8.0 MB** |

Recommendation: re-encode the bundled copies at 96 kbps stereo, 44.1 kHz. For quiet looping background music played under narration at roughly 7% volume, this is not audibly different, and it halves the size to about **3.9 MB**. The hosted originals stay untouched at full quality for the website.

## 2. How the app picks a track

Native app: play the bundled file first. If a bundled file is ever missing (for example a new track added later), fall back to the hosted address automatically — the player already has an error handler for exactly this, so the fallback is a one-line extension, not new machinery.

Website: unchanged — hosted address only.

## 3. Packaging

- Compressed copies committed at `native-assets/music/*.mp3` (outside `public/`, so the website build output stays byte-identical).
- `scripts/prepare-native-bundle.mjs` copies that folder into `dist-app/music/` after the build, so `cap sync` carries it into `ios/` and `android/`.
- A build-time check fails loudly if a file the native build expects is missing.

## 4. Settings respected

Nothing about playback control changes. The on/off switch, the volume slider, the dip while Hannah speaks, silence on grown-up and legal pages, and pausing when the app is backgrounded all run in the same place as today — only where the audio file comes from changes. There is no reduced-motion rule tied to music today, and none is added.

## 5. Untouched

The offline gate, premium checks, parental gate, purchases and narration logic are not edited.

## 6. Size impact

App download grows by about **3.9 MB** (8.0 MB if you prefer to bundle the originals uncompressed). Everything else is unchanged.

## Technical notes

- `src/lib/music-track.ts`: each track becomes `{ local, remote }`; `local` is `/music/<name>.mp3` on native only, `remote` stays the hosted CDN address (still passed through `assetUrl`).
- `src/lib/music.ts`: `sourceFor()` returns the local path on native and records the remote as the fallback used by the existing `handleLoadError` retry.
- `scripts/prepare-native-bundle.mjs`: copy `native-assets/music` -> `dist-app/music`, verify the three files exist.
- Re-encode with `ffmpeg -i in.mp3 -c:a libmp3lame -b:a 96k -ar 44100 out.mp3` in the sandbox; only the compressed copies are committed.
- Verify: `bunx tsgo --noEmit`, `bun run build`, `bun run build:app`, and a browser check that the web app still loads the hosted URLs.

## Outside Lovable

After I finish, run `bun run sync:app` (or `bunx cap sync`) locally/in Codemagic before the next build so the new `music/` folder lands in the iOS and Android projects. No App Store Connect or RevenueCat changes.
