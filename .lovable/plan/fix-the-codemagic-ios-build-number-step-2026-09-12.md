# Fix the Codemagic iOS build-number step

## Goal
Make every iOS archive use Codemagic’s unique build counter without calling an unsupported `xcode-project` command.

## Changes
1. Replace the failing `xcode-project build-version` command in `codemagic.yaml` with a small Python script that updates every `CURRENT_PROJECT_VERSION` entry in the Xcode project to `CM_BUILD_NUMBER`.
2. Validate that `CM_BUILD_NUMBER` is a positive integer and fail with a clear message if it is unavailable.
3. Verify that both Debug and Release build settings were updated before the archive starts.
4. Keep the existing signing, IPA creation, and TestFlight publishing steps unchanged.

## Verification
- Parse `codemagic.yaml` to confirm valid YAML.
- Run the app bundle build and Capacitor iOS synchronization.
- Confirm no unsupported `build-version` command remains.
- Check the latest build diagnostics.

After this change, rerunning **Totland iOS** will stamp the archive with Codemagic’s current build number, preventing duplicate-build uploads to Apple.
