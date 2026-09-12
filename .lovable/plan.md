# Fix the missing iOS signing private key

## Confirmed cause
Codemagic can access the Apple team, but the `appstore` variable group is not supplying a usable `CERTIFICATE_PRIVATE_KEY`. The workflow then tries to create an iOS Distribution certificate without its required private key and stops.

## Changes
- Update the signing step to check for `CERTIFICATE_PRIVATE_KEY` first and show a concise setup error if it is absent.
- Remove the separate certificate-list/create commands, which only inspect Apple’s certificates and cannot know whether Codemagic holds the corresponding private key.
- Use `app-store-connect fetch-signing-files App.totland.kids --type IOS_APP_STORE --create`, which handles the certificate and provisioning profile together using the stored key.
- Preserve the `Totland` Apple integration, capitalized bundle identifier, keychain import, profile application, IPA build, and TestFlight upload.
- Add the exact one-time Codemagic setup instructions to the mobile build guide.

## One-time Codemagic setup
1. On a trusted computer, generate a dedicated unencrypted 2048-bit RSA private key in PEM format, following Codemagic’s documented signing-key method.
2. In Codemagic, open **Teams → Team settings → Global variables and secrets** (or the app’s environment variables area).
3. Open the `appstore` group and add the full PEM text as a secure variable named exactly `CERTIFICATE_PRIVATE_KEY`.
4. Keep the group available to the Totland app, then rerun **Totland iOS**.

The private key must remain only in Codemagic. It will not be committed to GitHub or stored in Lovable.

## Validation
- Validate the updated YAML and signing command sequence.
- Confirm the workflow references the `appstore` group and `App.totland.kids`.
- Run the app bundle build and Capacitor iOS sync.
- Check project diagnostics.
