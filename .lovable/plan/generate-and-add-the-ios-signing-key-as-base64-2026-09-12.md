# Generate and add the iOS signing key as Base64

## Goal
Create a new 2048-bit RSA private key in GitHub Codespaces, encode it as one-line Base64, and add it to Codemagic's `appstore` environment group as `CERTIFICATE_PRIVATE_KEY_BASE64`.

## Steps

1. In a GitHub Codespaces terminal, generate an unencrypted 2048-bit PEM RSA key:
   ```sh
   ssh-keygen -t rsa -b 2048 -m PEM -f totland_ios_signing_key -q -N ""
   ```

2. Encode the private key as one line:
   ```sh
   base64 -w 0 totland_ios_signing_key
   ```
   Copy the complete single-line output.

3. In Codemagic, open **Teams → Team settings → Global variables and secrets**.

4. Open the `appstore` environment group.

5. Add a secure variable named exactly `CERTIFICATE_PRIVATE_KEY_BASE64` and paste the full output from step 2.

6. Save the variable.

7. Remove the old `CERTIFICATE_PRIVATE_KEY` variable if it still exists.

8. Back in Codespaces, delete the temporary key files:
   ```sh
   rm totland_ios_signing_key totland_ios_signing_key.pub
   ```

9. Rerun the **Totland iOS** workflow in Codemagic.

## Verification
- The workflow decodes `CERTIFICATE_PRIVATE_KEY_BASE64` and validates it with `openssl rsa -check`.
- If validation passes, Codemagic fetches or creates the App Store signing files for `App.totland.kids`.
- If validation fails, the error message points to re-pasting the complete Base64 output.
