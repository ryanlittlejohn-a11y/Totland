# Read-only audit: third-party loads, ad link tags, landing page

No code was changed. This is the report only.

## 1. Third-party scripts and hosts

There are no ad pixels, tag managers, analytics SDKs, chat widgets or social embeds anywhere in `src/`, `public/` or the root head.

| Host / item | Added in | Website | Native app |
|---|---|---|---|
| cdn.paddle.com (checkout script, injected on demand) | `src/lib/paddle.ts:23` | Yes, only when checkout opens | No |
| connector-gateway.lovable.dev (Paddle calls from the server) | `src/lib/paddle.server.ts:11` | Server only | Server only |
| api.elevenlabs.io (voice) | `src/lib/tts.functions.ts:155` | Server only | Server only |
| Lovable Cloud backend (data, sign-in, voice clip storage) | `src/integrations/supabase/client.ts` | Yes | Yes |
| Lovable sign-in helper (`@lovable.dev/cloud-auth-js`) | `src/integrations/lovable/index.ts` | Yes, sign-in only | Yes, sign-in only |
| Lovable email (`@lovable.dev/email-js`) | `src/lib/email-templates/send-email.ts` | Server only | Server only |
| RevenueCat | native plugin | No | Yes |
| Crash/freeze reports sent to our own `/api/public/diag` | `src/lib/crash-report.ts:20` | Same site | Sent to totland.app |

Not on your list, but harmless:
- `voice.totland.local` (`src/lib/speech.ts:173`) is a made-up cache key that is never fetched.
- `lovable.dev` in `previewAuthStorage.ts:69` only applies inside the Lovable editor preview.
- The root head (`src/routes/__root.tsx:95-111`) loads only local files: stylesheet, manifest, icons. It also has a Google site-verification meta tag, which is just text and loads nothing.
- Fonts are self-hosted (@fontsource). `public/` has only local icons, the og-image, robots.txt and sitemap.
- Store and legal links (apps.apple.com, play.google.com, paddle.com/net, reportaproblem.apple.com) are plain links that load nothing until a grown-up taps them.
- I fetched the live totland.app home page and found no outside script or stylesheet added by hosting.

Not checked: whether Lovable's own hosting adds a visitor counter on some responses. I saw no outside script in the home page, so any counting is probably done on the server side. I did not inspect Android or iOS native plugin code beyond what is listed.

## 2. Ad link tags (UTM)

- `https://www.totland.app/?utm_source=facebook` returns a 302 to `https://totland.app/?utm_source=facebook`, so the tags survive the switch from www to the main address.
- `https://totland.app/game/connect-the-dots?utm_source=facebook` loads directly (200), with no redirect.
- No code reads, stores or forwards `utm_*`. A search of `src` for "utm" finds nothing, and no language or route redirect drops the query string.
- Lovable's built-in analytics already listed 224 visits as "ads". I could not confirm whether it shows a per-campaign or per-utm_source breakdown. Treat that as unverified until a tagged link has run for a day.

## 3. Marketing-only landing page later

This would be easy: about 2–4 hours.
- Add one new page file, for example `src/routes/try.tsx`, with its own title, description and social preview. Do not link it from any child screen.
- Leave it out of the app bundle. Check how `scripts/prepare-native-bundle.mjs` and the `CAP_BUILD` flag in `vite.config.ts` handle web-only pages, the same way the printables page is treated as web-only.
- Use only original art and gameplay screenshots, with no trackers, and a single "Play free" button that opens the game.
- Decide whether to add it to `sitemap.xml` or keep it hidden as an ad-only page.
