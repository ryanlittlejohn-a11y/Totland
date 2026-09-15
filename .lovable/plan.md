# Fix the Codemagic iOS archive failure

## What the current log proves

- The `[CP] Embed Pods Frameworks` message is a warning and does not explain status 65.
- The main Totland app and App Clip targets, embedding relationship, property lists, entitlements, and icon catalogs are present and structurally valid.
- Codemagic currently reduces the failed archive to a short summary, hiding the actual Xcode `error:` line needed to identify whether the main app, App Clip, signing profile, entitlement, or Swift compilation failed.

## Plan

1. **Make the archive failure visible**
   - Update the iOS build step to retain the complete Xcode archive output and result bundle.
   - Print a concise failure section containing the real `error:`, provisioning, entitlement, and signing messages when archiving fails.
   - Save the full archive log and result bundle as Codemagic artifacts for future diagnosis.

2. **Validate both signed products before archiving**
   - Confirm Codemagic fetched and installed separate App Store profiles for `App.totland.kids` and `App.totland.kids.Clip`.
   - Confirm each target resolves to its matching profile, Team ID, distribution certificate, and required associated-domain/App Clip entitlements.
   - Stop before the archive with a clear message if either profile is absent or assigned to the wrong target.

3. **Fix the actual archive blocker**
   - Use the newly exposed Xcode error to correct the affected target only.
   - If signing is the blocker, make the profile assignment explicit for both targets while keeping manual App Store signing.
   - If the App Clip metadata or source is the blocker, correct that target without removing the clip from the app.
   - Leave the CocoaPods warning alone unless it is promoted to an actual script failure; it is not the current root cause.

4. **Verify the release path**
   - Validate the Xcode project and workspace after dependency installation.
   - Run the normal web bundle and project checks available here.
   - The final confirmation is a fresh Codemagic archive producing an `.ipa`; if Apple-side registration or profile creation blocks it, report the exact missing Apple setup instead of another generic code 65.

## Scope

This changes only iOS/Codemagic build diagnostics and the specific archive blocker revealed by Xcode. It does not publish the app or alter the child-facing experience.
