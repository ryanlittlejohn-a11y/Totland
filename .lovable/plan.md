# Repair the Codemagic signing key

## Goal
Replace the invalid Codemagic value with a verified Base64 encoding of the existing private key.

## Steps
1. In GitHub Codespaces, validate the original file:
   ```sh
   openssl rsa -in totland_ios_signing_key -check -noout
   ```
   Continue only if it reports `RSA key ok`.
2. Create a clean one-line Base64 value and copy it directly to the clipboard:
   ```sh
   base64 -w 0 totland_ios_signing_key | xclip -selection clipboard
   ```
   If `xclip` is unavailable, run `base64 -w 0 totland_ios_signing_key`, then copy the entire single output line.
3. In Codemagic, open the `appstore` environment group. Replace the complete value of `CERTIFICATE_PRIVATE_KEY_BASE64` with the copied line, mark it secure, and save it.
4. Ensure the value has no quotes, spaces, command text, Markdown markers, or leading/trailing characters. Do not use `totland_ios_signing_key.pub`.
5. Rerun the **Totland iOS** workflow. The signing step should print `Certificate private key validated.` before requesting Apple signing files.
6. After a successful signing setup, delete the key files from Codespaces while retaining a secure recovery copy:
   ```sh
   rm -f totland_ios_signing_key totland_ios_signing_key.pub
   ```

## If validation fails at step 1
Do not re-encode that file. Generate a fresh RSA PEM key, validate it, encode it, and replace the Codemagic secret. A new Apple distribution certificate will then be created from that key.

## Project changes
No repository change is required. The workflow already decodes and validates `CERTIFICATE_PRIVATE_KEY_BASE64` correctly; the decoded Codemagic value is currently not an RSA private key.
