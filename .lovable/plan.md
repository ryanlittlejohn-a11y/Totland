# Make the iOS signing key self-validating in Codemagic

## Cause
Codemagic's `app-store-connect fetch-signing-files` rejects the value in `CERTIFICATE_PRIVATE_KEY`: `argument --certificate-key: Provided value "********" is not valid`. The variable exists but its contents are not a usable PEM RSA private key — typically because pasting into Codemagic collapsed the line breaks, part of the key is missing, or the OpenSSH-format file (not `-m PEM`) was pasted.

## Changes

### codemagic.yaml — Set up signing step
1. Write `CERTIFICATE_PRIVATE_KEY` to a temp file.
2. If it starts with `-----BEGIN OPENSSH PRIVATE KEY-----`, convert it in place to PEM with `ssh-keygen -p -P "" -N "" -m PEM -f <file>` (the Codespaces/`ssh-keygen` default format is a common cause of this failure).
3. Validate the result with `openssl rsa -in <file> -check -noout`; if it fails, print a clear error telling the user to re-paste the full PEM (all lines, `BEGIN`/`END` included, not the `.pub` file) and exit.
4. Re-export the normalized file contents as `CERTIFICATE_PRIVATE_KEY` so `fetch-signing-files` receives a guaranteed-valid key, then delete the temp file.
5. Keep the rest unchanged: `keychain initialize`, `fetch-signing-files App.totland.kids --type IOS_APP_STORE --create`, `keychain add-certificates`, `xcode-project use-profiles`, IPA build, TestFlight upload.

### MOBILE.md
- Add a troubleshooting note for this exact error: the variable must contain the full private key (every line, including the `-----BEGIN ...-----` / `-----END ...-----` markers), not the `.pub` file; Codemagic secure variables preserve newlines, so paste the raw `cat` output.

## Validation
- Parse `codemagic.yaml` for valid YAML.
- Run `bun run build:app` and `bunx cap sync ios`.
- Rerun **Totland iOS** in Codemagic; if the stored value is malformed beyond repair, the step now says exactly what to fix instead of the cryptic usage error.
