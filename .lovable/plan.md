# Fix the false "no provisioning profile" failure

## What the log proves

Apple did everything right. The signing step downloaded both profiles:

```text
Saved Profile ... Totland ... -> ~/Library/Developer/Xcode/UserData/Provisioning Profiles/
Saved Profile ... Clip     ... -> ~/Library/Developer/Xcode/UserData/Provisioning Profiles/
```

The failure came from my own counter, which only looks in
`~/Library/MobileDevice/Provisioning Profiles`. That folder stayed empty, so the
count read `0 -> 0` and the step aborted even though both profiles were on disk.

The certificate and both bundle IDs (`App.totland.kids`, `App.totland.kids.Clip`)
are registered and active. No Apple-side action is needed.

## Changes to `codemagic.yaml`

1. Count profiles across every directory the Codemagic CLI writes to, not just one:
   - `~/Library/MobileDevice/Provisioning Profiles`
   - `~/Library/Developer/Xcode/UserData/Provisioning Profiles`
   Fail only when both are empty after a fetch.
2. Run `fetch-signing-files` once per bundle ID as today, but treat the whole set
   of downloaded profiles as the result, since one call can return several.
3. Keep the existing validation step (it already searches both directories) as the
   single authority on whether each bundle ID has a matching App Store profile.
4. Leave the certificate handling, `keychain add-certificates`, and
   `xcode-project use-profiles` steps untouched.

## Verification

- Parse `codemagic.yaml` and syntax-check the embedded shell/Python blocks.
- Re-run **Totland iOS**. Expected: both profiles listed, validation passes,
  archive proceeds to `.ipa` and TestFlight upload.

## Scope

Codemagic iOS workflow only. No app code, no publishing.
