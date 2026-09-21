# Totland on iPhone, iPad and Android

The website keeps working exactly as before. The phone and tablet app packages
the same screens inside a native shell (Capacitor) and talks to the live
Totland backend for sign-in, subscriptions, child progress and Hannah's voice.

## Build the app bundle

```bash
bun run build:app   # builds the packaged screens into dist-app/
bunx cap sync       # copies them into the iOS and Android projects
```

`bun run sync:app` does both in one step.

## Settings the app needs

No Codemagic environment group is needed for these — the defaults in the
repo's build env files are used:

| Name | What it is |
| --- | --- |
| `VITE_NATIVE_API_ORIGIN` | Where the app talks to. Defaults to `https://totland.lovable.app` |
| `VITE_REVENUECAT_IOS_KEY` | RevenueCat public key for Apple. Already set in the repo to `appl_HsZozLYeDxkkUyvOYIOgbtRrVvo`. |
| `VITE_REVENUECAT_ANDROID_KEY` | RevenueCat public key for Google (`goog_...`). Add this to the repo env files when the Play app is ready. |

On the backend, add a secret `REVENUECAT_WEBHOOK_SECRET` and paste the same
value into RevenueCat's webhook settings, pointing at
`https://totland.lovable.app/api/public/rc/webhook`.

## Custom URL scheme for deep links

The app registers the custom URL scheme `app.totland.kids://` on both iOS and
Android. Use it in RevenueCat for win-back links or promotional offers:

- `app.totland.kids://premium`
- `app.totland.kids://subscription`

Both open the Totland app and land on the parent subscription screen.

## Subscriptions

- On the website, families pay through Paddle (unchanged).
- Inside the iPhone/iPad/Android app, Apple and Google handle the payment, as
  their store rules require. RevenueCat tells our backend when a subscription
  starts, renews, or ends, so premium unlocks on every device the parent uses.
- Store product IDs to create: `totland_premium_monthly` ($2.99/month) and
  `totland_premium_yearly` ($19.99/year), both attached to the `premium`
  entitlement in RevenueCat.

## Store listings

- Apple bundle ID: `App.totland.kids` (capital A, matching the existing Apple record)
- Apple App Clip bundle ID: `App.totland.kids.Clip`
- Android package: `app.totland.kids`
- Apple: choose the Kids category (ages 5 and under / 6–8), declare no ads and
  no tracking, and point the privacy questionnaire at the existing
  `/privacy`, `/terms` and `/refund` pages.
- Google Play: complete the Families policy and Data safety forms the same way.
- The parental gate already protects everything involving money.

## Export compliance

The app only uses HTTPS/TLS through iOS/WebKit (encryption built into Apple's
operating system). `ITSAppUsesNonExemptEncryption` is set to `NO` in
`ios/App/App/Info.plist`, so no annual export-compliance documentation is
required. In App Store Connect, answer the encryption questionnaire with
**"None of the algorithms mentioned above."**

## Cloud builds

`codemagic.yaml` builds and uploads both apps, so no Mac is needed. Connect the
repository in Codemagic, add the environment groups listed above, add your Apple
App Store Connect API key and Google Play service account, then run the
`Totland iOS` and `Totland Android` workflows.

### One-time iOS signing key setup

The `appstore` environment group must contain a secure variable named exactly
`CERTIFICATE_PRIVATE_KEY_BASE64`. This is separate from the App Store Connect
API private key and is used to create the Apple Distribution certificate.

On a trusted Mac or Linux computer, generate a dedicated unencrypted PEM key:

```sh
ssh-keygen -t rsa -b 2048 -m PEM -f totland_ios_signing_key -q -N ""
```

In GitHub Codespaces, encode the private key as one line:

```sh
base64 -w 0 totland_ios_signing_key
```

Copy the complete output. In Codemagic, open **Teams → Team settings → Global
variables and secrets**, edit the `appstore` group, and add the copied value as
a secure `CERTIFICATE_PRIVATE_KEY_BASE64` variable. Do not encode the `.pub`
file. Remove the old `CERTIFICATE_PRIVATE_KEY` variable after saving the new
one. Keep both generated files out of GitHub and Lovable; store the private key
in a password manager as a recovery copy, then delete the local files when
setup is complete.

### Troubleshooting the certificate key

If decoding fails, rerun the Base64 command and replace the secure value with
the complete one-line output. If validation fails, confirm that you encoded
`totland_ios_signing_key`, not `totland_ios_signing_key.pub`. Do not add quotes
around the value. The workflow decodes and validates the key before requesting
Apple signing files.

After saving the variable, rerun **Totland iOS**. The workflow fetches or
creates the distribution certificate and App Store provisioning profiles for
`App.totland.kids` and `App.totland.kids.Clip`, imports them into its temporary
keychain, and builds the IPA for TestFlight.

### App Clip setup

The iOS archive includes a small no-sign-in counting game as an App Clip. Its
invocation URL is `https://totland.app/appclip`, and the website serves Apple's
association response from `/.well-known/apple-app-site-association`.

Before the first App Clip upload:

1. Register `App.totland.kids.Clip` in Apple Developer as an App Clip belonging
   to `App.totland.kids`, with Associated Domains enabled on both identifiers.
2. Save the 10-character Apple Developer Team ID as `APPLE_DEVELOPER_TEAM_ID`
   in Lovable so the association response can include the signed app IDs.
3. In App Store Connect, add the default App Clip experience using
   `https://totland.app/appclip`, the action **Play**, and a suitable header image.
4. Publish the site, confirm the association URL returns HTTP 200, then run the
   **Totland iOS** workflow and test the invocation on an iPhone or iPad.

### iOS build numbers

Each Codemagic run uses its positive `BUILD_NUMBER` as the App Store build
number. If that value is unavailable, the workflow uses the current UTC Unix
timestamp instead. This keeps every uploaded IPA newer than prior uploads and
does not require a custom build-number variable.

## Known limitation

Background music files stream from our media host, so in the packaged app the
music needs a connection the first time it plays. Games, narration cached
earlier, and progress all keep working offline for premium families.

## Privacy manifests (Apple)

Two manifests are in the repo:

- `ios/App/App/PrivacyInfo.xcprivacy` — the main app
- `ios/AppClip/PrivacyInfo.xcprivacy` — the App Clip (declares no data and no required-reason APIs)

They are **not** referenced from `project.pbxproj` on purpose — that file also carries the
App Clip target and signing settings, and a hand edit risks the Codemagic archive. Add each
file to its target once in Xcode:

1. `bunx cap open ios`
2. Drag `PrivacyInfo.xcprivacy` from Finder into the **App** group in the project navigator.
3. In the dialog: tick *Copy items if needed* is **off** (the file already lives there),
   choose *Create groups*, and tick only the **App** target.
4. Repeat for `ios/AppClip/PrivacyInfo.xcprivacy`, ticking only the **TotlandClip** target.
5. Select each target → Build Phases → Copy Bundle Resources and confirm the manifest is listed.
6. Commit the resulting `project.pbxproj` change.

Reason code used: `NSPrivacyAccessedAPICategoryUserDefaults` / `CA92.1` (Capacitor Preferences
stores only this app's own data). Capacitor and RevenueCat ship their own manifests.
