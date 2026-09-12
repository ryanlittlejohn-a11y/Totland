# Fix the iOS build failure

## What went wrong

The build stopped while installing the iOS purchase library. The RevenueCat purchase
plugin now requires iPhones running iOS 15 or newer, but the app project is still set
to iOS 14, so the two don't match and installation stops.

There is also a version mismatch: the installed RevenueCat plugin is built for the next
major version of the app-packaging framework, while this project uses the current one.

## The fix

1. Raise the minimum supported iPhone version for the app from iOS 14 to iOS 15
   (covers iPhone 6s and newer — effectively every device still in use).
2. Pin the RevenueCat purchase plugin to the release that officially matches the
   packaging framework this project uses, so future builds don't break.
3. Rebuild the packaged app locally and confirm the iOS project files are consistent.
4. You then rerun the **Totland iOS** workflow in Codemagic.

## Technical details

- `ios/App/Podfile`: `platform :ios, '14.0'` -> `'15.0'`.
- `ios/App/App.xcodeproj/project.pbxproj`: all four `IPHONEOS_DEPLOYMENT_TARGET = 14.0`
  entries -> `15.0`.
- `@revenuecat/purchases-capacitor` is `13.5.0`, whose podspec sets
  `ios.deployment_target = '15.0'` and whose peer dependency is `@capacitor/ios ^8`,
  while the project runs Capacitor 7. Pin it to the latest 12.x line (Capacitor 7
  compatible) and keep the iOS 15 target, which 12.x also satisfies.
- Verify with `bun run build:app` and `bunx cap sync ios` (pod install cannot run in
  this Linux sandbox, so verification is limited to the JS build plus a check that the
  Podfile and project deployment targets agree).
- `codemagic.yaml` itself needs no change.
