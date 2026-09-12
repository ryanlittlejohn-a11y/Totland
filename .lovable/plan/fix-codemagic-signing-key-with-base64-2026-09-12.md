# Fix Codemagic signing key with Base64

## Changes
- Replace the multiline `CERTIFICATE_PRIVATE_KEY` input with a secure, single-line `CERTIFICATE_PRIVATE_KEY_BASE64` value.
- Decode the Base64 value into a temporary PEM file during the Codemagic signing step.
- Validate the decoded RSA private key before requesting Apple signing files, then securely remove the temporary file.
- Update the mobile build instructions with the exact GitHub Codespaces command to create the Base64 value and the Codemagic variable name.

## One-time Codemagic setup
1. In the GitHub Codespaces terminal, encode the existing private key without line wrapping:
   ```sh
   base64 -w 0 totland_ios_signing_key
   ```
2. Copy the complete single-line output.
3. In Codemagic’s `appstore` environment group, add it as a secure variable named `CERTIFICATE_PRIVATE_KEY_BASE64`.
4. Remove the old `CERTIFICATE_PRIVATE_KEY` variable after the new value is saved.
5. Delete the private-key files from Codespaces and rerun **Totland iOS**.

## Validation
- Validate the Codemagic YAML.
- Build the bundled app and run iOS Capacitor synchronization locally.
- Confirm project diagnostics remain clean.
