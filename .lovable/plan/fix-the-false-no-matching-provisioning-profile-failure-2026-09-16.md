# Fix the false "no matching provisioning profile" failure

## What the log actually shows

The Apple Distribution certificate installed correctly, and the signing step ran `fetch-signing-files` for both `App.totland.kids` and `App.totland.kids.Clip`. The build then stopped in the separate check step, which reported that *neither* profile was found — including the main app profile that previous builds used successfully.

Two profiles disappearing at once points at the checker, not at Apple. The check only looks in one folder and silently discards any profile it cannot decode, so an empty or unreadable read looks identical to "Apple has no profile".

## Plan

1. **Make the signing step report what it downloaded**
   - Print the profile files written by `fetch-signing-files` (name, bundle id, expiry) right after each fetch, so the log proves whether Apple returned profiles at all.
   - Fail immediately in that step if a fetch produced no profile, instead of passing the problem to a later step.

2. **Make the check look where profiles really are**
   - Search every location the Codemagic CLI may use, not just `~/Library/MobileDevice/Provisioning Profiles`.
   - Decode profiles with a fallback method when the primary one fails, and report decode failures explicitly rather than skipping them.
   - List every profile found with its bundle id before judging, so a mismatch names the actual value seen.

3. **Only then judge the match**
   - Keep the existing requirement that both bundle ids resolve to an App Store profile with the expected entitlements.
   - When a profile genuinely is missing, say which Apple-side step is needed (register `App.totland.kids.Clip`, or grant the API key permission to create profiles) instead of a bare error line.

4. **Verify**
   - Parse `codemagic.yaml` and check the embedded shell/Python blocks.
   - Run the web bundle build and project checks available here.
   - Final confirmation is a fresh **Totland iOS** run: the log should list both downloaded profiles and continue into the archive.

## Scope

Only the Codemagic iOS workflow's signing and validation steps change. No app code, no publishing.
