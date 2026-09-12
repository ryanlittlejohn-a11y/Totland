# Fix Codemagic iOS signing

## What will change
- Remove the Bundle ID registration command that tries to recreate `App.totland.kids` and causes the 409 failure.
- Keep the existing Apple identifier unchanged, including its capital `A`.
- Have Codemagic use the existing identifier to fetch or create the App Store provisioning profile.
- Keep the existing certificate, keychain, IPA build, and TestFlight publishing steps.

## Validation
- Validate the updated Codemagic YAML structure.
- Confirm every iOS signing reference still uses `App.totland.kids`.
- Run the web-to-iOS bundle build and Capacitor iOS sync locally.
- Check project diagnostics for regressions.

## Expected next step
Rerun the **Totland iOS** workflow in Codemagic. Its signing step should skip identifier registration and proceed directly to certificate and provisioning-profile setup for the existing Apple record.
