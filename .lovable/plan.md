# Kids Category (1.3) data-flow audit and draft reply to Apple

Read-only audit. No files changed. Items marked **[UNVERIFIED]** need confirmation before you send. Approving this plan starts only the follow-up checks in the last section. It does not change code.

## 1. SDKs and native plugins in the iOS build

| Component | What it does | Sends data off device? |
|---|---|---|
| Capacitor core, App, SplashScreen, StatusBar | Native shell, deep links, splash, status bar | No |
| Capacitor Preferences | Stores this app's own data on the device | No |
| Capacitor Network | Checks whether the device is online | No. The app separately pings our own `/api/public/diag` |
| Capacitor Browser | Opens the sign-in sheet and Apple's subscription management page | Only to the pages it opens |
| RevenueCat Purchases 12.3.2 | App Store purchases, restores and entitlement checks | Yes, to RevenueCat |
| supabase-js | Parent sign-in and family sync | Yes, to our backend (Lovable Cloud) |

The app has no analytics, advertising, attribution or crash SDKs (no Firebase, Sentry, Meta or Google Analytics).
**[UNVERIFIED]** `Podfile.lock` is not in the repo, and the committed `Podfile` does not yet list the Browser, Network or Preferences pods. `cap sync` adds them in the cloud build. Check the pod list in the latest build log.

## 2. Network destinations

**Child play area**
- **Google Fonts (fonts.googleapis.com / fonts.gstatic.com), a third party.** The app's shared page setup loads two web fonts from Google. It most likely happens on every launch, including while a child plays. Google receives the device IP address, user agent and font request. **[UNVERIFIED that the packaged app includes this; highly likely]**. This is the most important finding for Guideline 1.3.
- **Our server (totland.lovable.app), speech lines.** When a narration clip is not already on the device, the app sends the text and language to our server. The server either returns a stored clip or asks ElevenLabs to create one. ElevenLabs receives only the text and a voice ID, never user or device data. For rate limiting, our server stores a SHA-256 hash of the caller's IP address (`voice_generation_events`, with no set expiry).
- **Our server, diagnostics.** A GET reachability ping (carries nothing), plus crash, freeze and rejection reports (see section 3).
- **Our server, music fallback.** Music is bundled in the app. It streams from our host only if the bundled copy fails.

**Parent area (behind the gate)**
- **Our backend (Lovable Cloud).** Email and password sign-in, or Google or Apple sign-in through our own `/~oauth` page in the in-app browser. Also family sync, account deletion and the contact form.
- **RevenueCat.** When signed out, RevenueCat's own anonymous ID is used (`$RCAnonymousID:…`). When signed in, `logIn` uses the parent's backend account UUID. The app never sets subscriber attributes such as email, name or phone. It never calls `collectDeviceIdentifiers` or ad-ID APIs, and it does not use AdSupport or App Tracking Transparency. **[UNVERIFIED]** RevenueCat's own SDK sends device metadata (such as OS, app version, locale and IP) with receipt requests, as its documentation describes.
- **Apple.** App Store purchases, and the subscription management page.
- **RevenueCat to our server.** A webhook writes the subscription status against the account UUID.

**Paddle is web-only.** On native, the subscription page shows the App Store purchase panel. `paddle.js` loads only from the website checkout path.

## 3. Telemetry and error reporting
- `crash-report.ts` sends up to 12 reports per session to our own `/api/public/diag`. Each report contains the type (error, rejection or freeze), up to 500 characters of message, up to 1,500 characters of stack trace, the screen path and the platform. The server writes it to the server log and discards it. Nothing is stored in the database. The request's IP reaches our hosting provider's logs.
- `lovable-error-reporting.ts` only forwards to `window.__lovableEvents` or `__lovableReportRuntimeError` if those exist. They exist only inside the Lovable editor preview. **[UNVERIFIED]** Whether the published web bundle or the packaged app contains any script injected by Lovable. Confirm by searching the built `dist-app/` for external script tags.

## 4. Third-party runtime loads in the native app
- Google Fonts, as above. Nothing else was found. No CDN scripts or images load in the native app (Paddle's CDN is web-only).

## 5. Backend storage when a parent signs in
- Sign-in records: email, password hash or Apple/Google identity, and names or email from the Apple/Google profile where provided.
- `child_profiles`: the child's display name as typed, age, emoji outfit, avatar colour, and a `data` field (progress, stars, settings).
- `subscriptions`: store or Paddle IDs, product, status and billing period.
- `contact_inquiries` (only if the contact form is used): name, email and message.
- **Region [UNVERIFIED]**: confirm the backend region in Cloud settings.
- **Retention**: kept while the account is active. There is no automatic expiry.
- **Deletion**: the in-app "Delete account" removes child profiles, subscriptions and the login. **Gaps:** contact messages are kept, with only the account link removed. The hashed-IP voice rate-limit rows have no expiry. RevenueCat's copy of the account is not deleted.

## 6. Mismatches with the privacy manifest and Privacy Notice
1. Google Fonts is not disclosed anywhere. It is a third-party request while children play.
2. The Privacy Notice says deletion "permanently removes" your data, but contact messages and RevenueCat records remain.
3. The Notice lists "Service providers" generically. It does not name Lovable Cloud (hosting and database), ElevenLabs ("our speech provider") or Google.
4. The hashed-IP rate-limit record is not mentioned, and it has no retention period.
5. The manifest declares Email, Name, User ID, Product Interaction, Purchase History, Other data, Other User Content, Crash Data and Performance Data. This broadly matches. "Name" (the child's typed display name and the parent's name from Apple/Google) is correctly marked as linked. The manifest has no entry for the device IP sent to Google Fonts.

## Draft reply to Apple (only valid once the Google Fonts issue is resolved or disclosed)

> **1. Third-party analytics:** No. Totland includes no third-party analytics SDK or service. The app sends anonymous crash and freeze reports (error text, stack trace, screen name, platform) only to our own server. They are written to server logs and are not shared with anyone.
>
> **2. Third-party advertising:** No. There are no ads, ad SDKs or tracking. The app does not access the IDFA and does not use App Tracking Transparency.
>
> **3. Sharing with third parties:** Only with the processors needed to run the service, never for advertising or marketing:
> (a) RevenueCat, to validate App Store purchases. It uses an anonymous RevenueCat ID, or, if a parent has signed in, our random account ID. We send no email, name or other attributes.
> (b) Apple, which processes the purchase.
> (c) Lovable Cloud, our hosting, authentication and database provider, which stores parent account data. [REGION: confirm]
> (d) ElevenLabs, which receives only the text of narration lines, sent from our server, to produce the spoken audio. It receives no user or device data.
> [(e) Google Fonts: remove before sending, or disclose if still present.]
>
> **4. Other data collected:** Children's play works with no account. Progress stays on the device. A parent may optionally create an account behind a parental gate, using email, Apple or Google sign-in. That account stores the parent's email, the child profile nickname, age, avatar choice and game progress (to sync between the family's devices), plus subscription status. Parents can delete the account in the app. Contact-form messages (name, email, message) are used only to reply. Our server keeps a one-way hash of the IP address to rate-limit narration requests. None of this is used for advertising, profiling or tracking.

## Follow-up checks to run next (read-only)
1. Build `dist-app/` in a temporary folder and search it for `fonts.googleapis`, other external hosts and any Lovable-injected scripts.
2. Look up the backend region.
3. Check the latest Codemagic log for the resolved pod list.

Separately, I can propose fixes (fonts bundled inside the app, deletion gaps, Privacy Notice wording). I will only make those after you approve.

Terms of Use issue: add the link to the App Store description yourself, using `https://totland.app/terms` or Apple's standard EULA. No code change is needed.
