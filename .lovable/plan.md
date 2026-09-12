# Fix the Codemagic iOS build number

## What is wrong
The workflow validates `CM_BUILD_NUMBER`, but Codemagic is not supplying that value as a positive integer. The iOS project itself currently has build number `2`, so the failure happens before the archive is created.

## Changes
1. Replace the `CM_BUILD_NUMBER` dependency with Codemagic’s `BUILD_NUMBER` when it is a positive integer.
2. Add a UTC Unix-timestamp fallback so manual or differently configured builds still receive a positive, increasing, App Store-safe build number.
3. Use the resolved value consistently when updating and verifying both iOS build configurations.
4. Update the mobile build documentation to describe the automatic numbering behavior.

## Verification
- Parse and validate `codemagic.yaml`.
- Test the numbering script once with a valid `BUILD_NUMBER` and once with it absent to confirm the fallback.
- Confirm both `CURRENT_PROJECT_VERSION` entries are updated.
- Run the app bundle build, iOS Capacitor sync, and project diagnostics.

After this change, rerunning **Totland iOS** should move past **Set unique build number** without requiring a new Codemagic variable.
