# Fix "attribute with a value that has already been used" on upload

## Cause

The `.ipa` uploaded fine through signing and archiving, but App Store Connect rejected it at publish because its **build number (CFBundleVersion) is `1`** — and build `1` was already uploaded earlier (build `61a4e8db...`). Apple never accepts two uploads with the same build number, even if the previous one was only processed.

## Fix: auto-increment the build number on every Codemagic build

Instead of manually bumping the number each time, we set the iOS build number from Codemagic's own ever-increasing build counter. Every future build then uploads cleanly with no manual steps.

### Changes

1. **`codemagic.yaml`** — add a step in the iOS workflow, right before **Build ipa**:
   ```text
   xcode-project build-version --build-number $CM_BUILD_NUMBER
   ```
   (`CM_BUILD_NUMBER` is Codemagic's built-in per-build counter, always increasing.)
2. **`ios/App/App.xcodeproj/project.pbxproj`** — bump `CURRENT_PROJECT_VERSION` from `1` to `2` in both Debug and Release configs, so local/Xcode builds are also ahead of the uploaded build 1.

### No other changes

- Marketing version stays `1.0` (that's the user-facing App Store version; only the internal build number changes).
- Android workflow untouched (Google Play is on hold anyway).
- Signing setup untouched.

## Verify

1. Validate the YAML parses and `bun run build:app` + `bunx cap sync ios` pass.
2. User reruns the **Totland iOS** workflow in Codemagic — the upload and TestFlight submission should now succeed (TestFlight beta test info was already filled in last time; if the external-review info warning reappears, the info added in App Store Connect persists).

## Technical details

- Files: `codemagic.yaml`, `ios/App/App.xcodeproj/project.pbxproj`
- The upload error comes from App Store Connect's duplicate `CFBundleVersion` check, not from signing or the archive itself.
