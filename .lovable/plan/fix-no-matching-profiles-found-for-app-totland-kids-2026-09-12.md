# Fix "No matching profiles found" for app.totland.kids

The Codemagic signing step failed because App Store Connect has no App Store provisioning profile for `app.totland.kids`. The `fetch-signing-files ... --create` command can create the profile automatically, but only when two things already exist on the Apple account: the registered bundle ID and an iOS Distribution certificate. One (or both) is missing.

## What I'll change in the repo

Make the signing step in `codemagic.yaml` self-healing — create the missing Apple resources before fetching them:

```text
Set up signing
  keychain initialize
  app-store-connect bundle-ids create app.totland.kids   (ignore "already exists" error)
  app-store-connect certificates create --type IOS_DISTRIBUTION   (skip if one exists)
  app-store-connect fetch-signing-files app.totland.kids --type IOS_APP_STORE --create
  keychain add-certificates
  xcode-project use-profiles
```

Then verify `codemagic.yaml` parses and the web bundle still builds.

## What you need to check in Apple Developer / App Store Connect (2 minutes)

1. **App record exists** — App Store Connect → Apps → "Totland" with bundle ID `app.totland.kids` (Stage 2 of the TestFlight checklist). `fetch-signing-files` cannot register the bundle ID against an app record that doesn't exist; create it manually if you haven't yet.
2. **API key permission** — the App Store Connect API key you gave Codemagic ("Totland") must have the **Admin** or **App Manager** role. A lesser role can read but cannot create certificates/profiles. Check in App Store Connect → Users and Access → Integrations → App Store Connect API. If the role is lower, either raise it or generate a new key with App Manager and update the Codemagic integration.

## Then

Re-run the **Totland iOS** workflow. Expected outcome:
- Bundle ID registered (or already present)
- Distribution certificate created and imported to the build keychain
- App Store provisioning profile created and applied
- `.ipa` builds and uploads to TestFlight

If it still fails, paste the new log lines from the "Set up signing" step and I'll adjust.

## Technical details

- File changed: `codemagic.yaml` (iOS workflow, "Set up signing" script only). Android workflow untouched.
- `app-store-connect bundle-ids create` failing with "already exists" is harmless; the script tolerates it (`|| true` style guard).
- Codemagic's `CERTIFICATE_PRIVATE_KEY` in the `appstore` group is only needed when importing a certificate generated in the Codemagic UI; creating the cert via the API avoids that dependency.
