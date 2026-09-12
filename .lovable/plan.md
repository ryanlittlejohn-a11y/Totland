# Fix the unknown `totland` variable group error

## Cause
`codemagic.yaml` lists a `totland` environment group for both workflows, but no group with that name exists in Codemagic's team/app settings, so Codemagic rejects the configuration before building.

## Changes
- Remove `- totland` from the `environment.groups` list in both the `ios` and `android` workflows.
- Keep the `appstore` group on iOS (it holds the Apple signing variables) and `google_play` on Android.
- Update `MOBILE.md` so it no longer instructs creating a `totland` group; note that the API origin defaults to the live site and the RevenueCat iOS key is already set in the repo's build env files.

## Why this is safe
- `VITE_NATIVE_API_ORIGIN` defaults to `https://totland.lovable.app` when unset.
- `VITE_REVENUECAT_IOS_KEY` (`appl_...`) is already committed in the build env files, so the iOS build gets it without a Codemagic group.

## Validation
- Parse `codemagic.yaml` to confirm valid YAML.
- Run `bun run build:app` and `bunx cap sync ios` to confirm the app bundle still builds.
- Rerun the **Totland iOS** workflow in Codemagic afterward.
