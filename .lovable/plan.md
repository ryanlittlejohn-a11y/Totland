# Fix Codemagic provisioning for `App.totland.kids`

The repository now uses the capitalized Apple bundle ID consistently, but the workflow currently configures signing twice: Codemagic’s automatic `environment.ios_signing` lookup and a later script that can create missing Apple signing resources. The automatic lookup happens before scripts, so the build can fail with “No matching profiles found” before the self-healing script runs.

## Changes

1. Remove the early `environment.ios_signing` lookup from the iOS workflow.
2. Keep one signing path in the existing **Set up signing** step:
   - initialize the temporary keychain;
   - confirm/register `App.totland.kids`;
   - create or reuse an Apple Distribution certificate;
   - fetch or create the App Store provisioning profile;
   - import the signing certificate and apply the profile to the Xcode project.
3. Stop hiding bundle-registration failures. Treat “already exists” as harmless, but surface permission, team, or identifier errors clearly instead of allowing the workflow to continue to the misleading profile error.
4. Keep the Codemagic App Store Connect integration named `Totland` for signing and TestFlight upload.
5. Validate the YAML structure and confirm every iOS project/configuration still uses `App.totland.kids`; leave Android’s lowercase package and custom URL scheme unchanged.

## Apple-side prerequisite

The `Totland` App Store Connect key must belong to the same Apple team that owns the explicit identifier `App.totland.kids` and needs permission to manage signing assets. If profile creation still fails after the workflow fix, the new log will identify whether the remaining blocker is the API-key role, identifier ownership/capabilities, or certificate limit rather than masking it as a missing profile.

## Verification

- Parse `codemagic.yaml`.
- Build the packaged iOS web bundle and sync the iOS project.
- Re-run **Totland iOS** in Codemagic and confirm **Set up signing** creates/downloads a profile before **Build ipa**.
- Confirm the resulting `.ipa` uploads to TestFlight.
