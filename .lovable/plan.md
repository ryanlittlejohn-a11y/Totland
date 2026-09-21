# Two App Store readiness fixes: privacy manifest + bundled audio

Plan only. No code changes, no audio generated, no credits spent until you approve.

---

## Part D — Apple privacy manifest

### D1. What Totland actually collects (audit)

| Area | Data | Leaves the device? | Linked to identity? |
|---|---|---|---|
| Grown-up account (optional) | Email address, user ID | Yes, to our backend | Yes |
| Child profile | Nickname, age band, progress, stickers | Only if the parent signs in to sync | Yes (to the parent account) |
| Purchases | Store transaction + entitlement via RevenueCat | Yes | Anonymous until sign-in |
| Contact form | Name, email, message | Yes (email delivery) | Yes |
| Crash/diag reports | Anonymous error text, freeze notices, a connectivity ping | Yes | No |
| Narration | The short line of text to be spoken (e.g. "apple") | Yes, to the speech provider | No |
| Play progress | All game progress | No (device only unless syncing) | No |

No advertising, no tracking, no analytics SDKs. Nothing about the child is sent unless the grown-up signs in, and no audio of the child is ever recorded.

Third-party code in the iOS build: Capacitor core, App, Splash Screen, Status Bar, Preferences, Network, and RevenueCat Purchases. Capacitor already ships its own privacy manifests (confirmed in the installed package); RevenueCat ships one in its SDK. I will re-verify each pod's manifest during implementation.

### D2. Required-reason APIs

- **UserDefaults** — used by Capacitor Preferences (our new device storage). Reason `CA92.1` (access limited to the app itself).
- **File timestamp / disk space / boot time / keyboard** — not used by our code. I will grep the pods before finalising; if a pod uses one, its own manifest declares it and ours does not need to repeat it.

I will verify the key names and reason codes against Apple's current "Describing use of required reason API" and "Privacy manifest files" documentation at implementation time and cite the exact pages in my summary, rather than relying on memory.

### D3. Proposed manifest content

`ios/App/App/PrivacyInfo.xcprivacy`:
- `NSPrivacyTracking` = false
- `NSPrivacyTrackingDomains` = empty
- `NSPrivacyAccessedAPITypes` = UserDefaults with reason `CA92.1`
- `NSPrivacyCollectedDataTypes`:
  - Email address — app functionality + customer support, linked, not used for tracking
  - Name (contact form / child nickname) — app functionality, linked, not tracking
  - Purchase history — app functionality, linked, not tracking
  - Crash data and performance data — app functionality, **not** linked, not tracking
  - Other user content (the short line of text sent for narration) — app functionality, not linked, not tracking

### D4. Getting the file into the app

Editing `project.pbxproj` by hand is the risky part — it is the same file that carries the App Clip target and signing settings, and a bad edit breaks the Codemagic archive. Two options:

- **Preferred (low risk):** add the manifest as a Capacitor-copied resource, so `cap sync` places it without touching the project file. If Capacitor cannot place an app-level manifest, fall back to the option below.
- **Fallback (manual, one time):** you open Xcode once, drag `PrivacyInfo.xcprivacy` into the App target, tick "Copy Bundle Resources", and commit the resulting project change. I will give you the exact clicks.

I will only edit `project.pbxproj` myself if you explicitly prefer that, and if so I will add a check to the Codemagic validator that the file is in the bundle.

### D5. App Store Connect answers

A plain-language table for the App Privacy section and the Kids Category questions (data types, purposes, linked/not-linked, tracking = No everywhere), with anything uncertain clearly marked "verify before submitting" — delivered in my summary, not as code.

### Website impact
None. Everything in Part D lives under `ios/`.

---

## Part E — Bundled audio

### E1. Inventory (measured today)

Per language: 26 letters, 21 number words, 93 picture words, 8 colours, 6 shapes, 15 first-reading words, 10 rhymes, 5 story titles + 25 story pages, 10 praise lines, and roughly 40 fixed activity prompts.

**≈ 260 lines per language, ≈ 520 lines total (English + Spanish).**
Most lines are one or two words; story pages are the longest.
**≈ 4,000 characters per language, ≈ 8,000–9,000 characters in total.**

### E2. Cost estimate — approve before anything is generated

- ElevenLabs charges roughly one credit per character with the current voice and model, so **≈ 9,000 credits** for the full set, one time. Lines already in the shared library cost nothing, so the real spend will be lower.
- Audio size: mono, 32 kbps MP3, most clips under two seconds → **≈ 4–6 MB** for all 520 clips.

**I will stop here and report the exact figure before generating a single clip.**

### E3. Lookup order (native only)

bundled file → device cache → live speech service → device voice.
Web keeps exactly today's order (cache → live → device voice). The change is one extra first step, behind the native check.

### E4. How the files are produced and packaged

A build-time script reads the same string lists the app uses, generates one MP3 per line with a stable hash-based name (same hashing scheme the cache already uses), and writes them into the static bundle that `cap sync` copies into the iOS and Android apps. The script never runs during a normal website build, so the website bundle is unchanged.

### E5. Music

The three soundtracks (≈ 1.4 MB each, **≈ 4.3 MB**) get bundled the same way, with the hosted address kept as a fallback. The existing on/off switch, volume slider, narration ducking, and reduced-motion behaviour are untouched.

**Total app-size increase: roughly 9–11 MB.**

### E6. What is not touched

OfflineGate, premium gating, and the parental gate are unchanged. This only makes offline audio complete for people who already have offline access.

### Confirming the website is unaffected
Typecheck and build after each part; every new path behind the existing native check; a browser pass over home, worlds, word finds, a puzzle, rewards, and the grown-up pages confirming narration, music, and the offline screen behave exactly as today.

---

## Files expected to change

Part D: `ios/App/App/PrivacyInfo.xcprivacy` (new), possibly `ios/App/App.xcodeproj/project.pbxproj` (only with your go-ahead), `roadmap.md`.
Part E: `scripts/generate-voice-bundle.mjs` (new), `scripts/prepare-native-bundle.mjs`, `src/lib/speech.ts`, `src/lib/music-track.ts`, a new bundled-audio index module, `package.json` scripts, `roadmap.md`.

## Outside Lovable (you)
- Xcode: one-time drag of the privacy manifest into the App target, if we take the fallback route.
- App Store Connect: fill the App Privacy and Kids Category answers from my table.
- Codemagic: no workflow change expected; first build after Part E will be larger.
