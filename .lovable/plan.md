# Fix the unknown `totland` variable group error

## Cause
`codemagic.yaml` lists a `totland` environment group for both the iOS and Android workflows, but no group with that name exists in Codemagic — only the `appstore` group you created for the signing key. Codemagic rejects the configuration before building.

## Changes
- Remove `- totland` from the `environment.groups` list in both the `ios` and `android` workflows.
- Keep the `appstore` group on iOS (holds your Apple signing variables, including `CERTIFICATE_PRIVATE_KEY`) and the `google_play` group on Android.
- Update `MOBILE.md`: remove the instruction to create a `totland` group and note that the app talks to the live site by default and the RevenueCat iOS key is already set in the repo's build env files.
- Update `roadmap.md` to drop the `totland` group requirement from the Codemagic setup task.

## Why this is safe
- `VITE_NATIVE_API_ORIGIN` defaults to `https://totland.lovable.app` when the variable is unset.
- The RevenueCat iOS public key (`appl_...`) is already committed in the build env files, so the iOS build gets it without a Codemagic group.

## Validation
- Parse `codemagic.yaml` to confirm valid YAML.
- Run `bun run build:app` and `bunx cap sync ios` to confirm the app bundle still builds.
- Afterward, rerun the **Totland iOS** workflow in Codemagic.
