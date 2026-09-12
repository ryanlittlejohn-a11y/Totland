# Add Apple export-compliance exemption to Info.plist

## Goal
Answer Apple's App Store Connect encryption questionnaire and bypass the export-compliance documentation requirement by declaring that Totland uses only the encryption built into iOS.

## Current state
- The iOS app is a Capacitor web-view wrapper; all network traffic uses HTTPS/TLS provided by iOS/WebKit.
- Server-side code uses standard SHA-256 HMAC verification for Paddle/RevenueCat webhooks and cron authentication, but these run on the hosted backend, not inside the app binary.
- No custom, proprietary, or non-standard encryption is implemented in the app.
- `ios/App/App/Info.plist` does not yet contain `ITSAppUsesNonExemptEncryption`.

## Correct questionnaire answer
**None of the algorithms mentioned above** — the app only uses or accesses encryption within Apple's operating system (iOS TLS/WebKit HTTPS).

## Work to do
1. Add `ITSAppUsesNonExemptEncryption` set to `NO` in `ios/App/App/Info.plist`.
2. Validate the plist remains well-formed XML.
3. Update `MOBILE.md` with a short note about the export-compliance exemption.
4. Run `bunx cap sync ios` so the updated plist is reflected in the native project.
5. Verify the app still builds and the iOS sync succeeds.

## Why this works
Apple allows apps that only use standard OS-provided encryption (TLS/HTTPS) to set `ITSAppUsesNonExemptEncryption` to `NO`, which exempts them from the annual export-compliance documentation requirement under the mass-market encryption exemption.
