# Fix bundle ID case mismatch: App.totland.kids vs app.totland.kids

The signing step fails because the bundle ID registered on your Apple account appears to be `App.totland.kids` (capital A), while the app project and Codemagic use `app.totland.kids` (lowercase). Bundle IDs are case-sensitive, so Apple sees them as two different apps and finds no profile.

## Decision: standardize on lowercase `app.totland.kids`

Lowercase is the convention, it's already used everywhere in the repo (Capacitor config, codemagic.yaml, iOS project), and the App Store Connect app record was created with `app.totland.kids`. Rather than rewriting the whole project, we make Apple's records match the lowercase ID.

## Step 1 — Confirm the exact case (you, 1 minute)

1. Apple Developer → Certificates, Identifiers & Profiles → Identifiers.
2. Find the Totland identifier. Note whether it's `App.totland.kids` or `app.totland.kids`.
3. Also check App Store Connect → Apps → Totland → App Information → Bundle ID.

## Step 2 — Fix on the Apple side

- **If the App Store Connect app record is already `app.totland.kids` (lowercase):** you can't change an existing app's bundle ID — but that's fine, we want lowercase anyway. Just delete or ignore the stray `App.totland.kids` identifier in the Developer portal so Codemagic doesn't get confused, and make sure the lowercase identifier exists under Identifiers.
- **If ONLY `App.totland.kids` (capital A) exists and the App Store Connect app record uses it too:** register a new identifier `app.totland.kids` (lowercase) in the Developer portal. If the app record itself is tied to the capitalized ID and can't be switched, tell me and I'll flip the repo (`capacitor.config.ts`, `codemagic.yaml`, iOS project) to `App.totland.kids` instead.

## Step 3 — Re-run

The self-healing signing step already in `codemagic.yaml` (register bundle ID, create distribution certificate, fetch/create profile) will then succeed:

```text
app-store-connect bundle-ids create app.totland.kids   (now matches)
app-store-connect fetch-signing-files app.totland.kids --type IOS_APP_STORE --create
```

Expected result: profile found/created, `.ipa` builds, uploads to TestFlight.

## Notes

- No code changes needed unless we discover the App Store Connect app record itself is stuck on the capitalized ID.
- Provisioning profiles and certificates for `App.totland.kids` (capital) are irrelevant to the lowercase app — safe to leave or delete.
