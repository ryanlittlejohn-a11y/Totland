# Correct the Apple capabilities and App Clip signing relationship

## What the latest log proves

Both App Store profiles download and decode correctly, but Apple generated them without the capabilities requested by the targets:

- `App.totland.kids` is missing Associated Domains.
- `App.totland.kids.Clip` is missing Associated Domains, App Clip installation, and its parent-app relationship.
- The project’s clip entitlement file requests those three values.
- The parent entitlement file currently requests Associated Domains, but it does not yet declare the reciprocal relationship to `App.totland.kids.Clip`.

This is no longer a Codemagic profile-discovery problem. Continuing with these profiles would only move the same mismatch into Xcode’s archive step.

## Apple Developer setup

1. Open **Certificates, Identifiers & Profiles → Identifiers**.
2. For `App.totland.kids`, enable **Associated Domains** and confirm the App Clip relationship points to `App.totland.kids.Clip`.
3. Confirm `App.totland.kids.Clip` was registered as an **App Clip identifier belonging to `App.totland.kids`**, not as an unrelated normal App ID. If it was created incorrectly, remove/recreate that identifier using Apple’s App Clip registration flow.
4. Enable **Associated Domains** for the clip identifier where Apple exposes that option, then save both identifiers.
5. Do not manually reuse the current profiles. The next Codemagic run will request refreshed App Store profiles after Apple saves the capabilities.

## Project corrections

1. Add the reciprocal App Clip identifier entitlement to the parent app, using Team ID `ZGHUXQGJJ9` and clip bundle ID `App.totland.kids.Clip`.
2. Keep the clip’s existing associated-domain, on-demand-install, and parent-app entitlements.
3. Update the Codemagic validator to check both halves of the parent/clip relationship and report whether a stale profile or an incorrectly registered identifier caused the mismatch.
4. Keep the certificate, bundle IDs, profile search paths, and manual signing flow unchanged.

## Verification

- Validate both entitlement files and the Xcode project structure locally.
- Run **Totland iOS** again after the Apple capability changes.
- Confirm the refreshed profiles contain the required entitlements.
- Confirm the archive embeds `TotlandClip.app`, produces the `.ipa`, and proceeds to TestFlight upload.

## Scope

This corrects App Clip signing only. It does not publish the website or submit a release for review.
