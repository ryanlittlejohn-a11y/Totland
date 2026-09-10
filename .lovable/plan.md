# Export-ready packaging for GitHub + Codemagic

The mobile packaging code is complete and the live site is ready. Before Codemagic can build from a GitHub export, two small repo-hygiene issues need fixing, plus a short checklist of account-side setup that only you can do.

## What I will fix in the project

1. **Remove `dist-app/` from git tracking**
   - The native bundle is a build output and is already listed in `.gitignore`, but it is currently committed. I will untrack it so GitHub only stores source code and Codemagic generates the bundle fresh on each build.

2. **Verify the native bundle build**
   - Run `bun run build:app` end-to-end to confirm `dist-app/` is produced cleanly from source.

3. **Confirm `capacitor.config.ts` and platform projects are consistent**
   - Run `bunx cap sync` (or the equivalent dry-run check) so the committed iOS/Android projects match the current plugins and bundle id.

## What you need to do in your dashboards

### GitHub
- In the Lovable editor, open the **Plus (+) menu → GitHub → Connect project**.
- Authorize the Lovable GitHub App and create/select the repository for Totland.
- After the sync, the source code (without `dist-app/`) will live on GitHub.

### Codemagic
- Sign up at **codemagic.io** and connect your new GitHub repository.
- Create these environment groups and secrets:

| Group | Variables |
| --- | --- |
| `totland` | `VITE_NATIVE_API_ORIGIN` = `https://totland.lovable.app` |
| | `VITE_REVENUECAT_IOS_KEY` = your RevenueCat public Apple key (`appl_...`) |
| | `VITE_REVENUECAT_ANDROID_KEY` = your RevenueCat public Google key (`goog_...`) |
| `appstore` | `APP_STORE_CONNECT_ISSUER_ID`, `APP_STORE_CONNECT_KEY_IDENTIFIER`, `APP_STORE_CONNECT_PRIVATE_KEY`, `CERTIFICATE_PRIVATE_KEY` |
| `google_play` | `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS` (JSON for Google Play API) |
| Android keystore | `totland_keystore` (upload in Codemagic UI) |

### Apple / Google / RevenueCat
- Create the App Store / Play Store products `totland_premium_monthly` and `totland_premium_yearly`.
- Configure RevenueCat with those products, the `premium` entitlement, and the webhook endpoint `https://totland.lovable.app/api/public/rc/webhook` using the secret already saved in the project.
- Paste the RevenueCat public keys into the Codemagic `totland` group.

## Acceptance criteria

- `dist-app/` is no longer tracked in git.
- `bun run build:app` completes without errors.
- GitHub sync is connected and Codemagic has the environment groups above.
- Codemagic can run the `Totland iOS` and `Totland Android` workflows and produce an `.ipa` and `.aab`.
