# Totland iOS App Clip and app icon

## Goal
Add a child-safe App Clip that launches directly into one short learning game, and replace the current placeholder iOS icon with artwork that matches Totland’s warm, playful visual style.

## App icon
- Create an original square Totland icon using the app’s existing warm cream, clay-orange, sunny yellow, green, and sky-blue character.
- Keep the design bold and readable at small sizes, without tiny text or details.
- Export a full 1024×1024 opaque iOS icon and install it in the existing iOS asset catalog.
- Create the matching App Clip icon asset with Apple’s required treatment, while keeping the full app and clip visually recognizable as the same product.
- Preview the icon at App Store and home-screen sizes before finalizing it.

## App Clip experience
- Add a dedicated iOS App Clip target linked to the existing Totland app.
- Use a compact native screen rather than loading the complete packaged website, keeping launch fast and the clip small.
- Open directly into a no-sign-in mini learning game for ages 2–6: a friendly picture-and-number counting question with large tap targets, a few replayable rounds, gentle correct/try-again feedback, and a completion celebration.
- Match Totland’s colors, rounded play pieces, child-friendly spacing, and plain-language tone.
- Keep the clip privacy-first: no account, advertising, tracking, purchase flow, or personal information.
- End with a clear Apple-provided full-app invitation so the grown-up can install Totland.

## iOS and build setup
- Add the App Clip bundle, Info settings, entitlements, icon catalog, launch configuration, and parent-app relationship to the Xcode project.
- Use the bundle identifier `App.totland.kids.Clip`, following the existing Apple bundle identifier’s capitalization.
- Add the App Clip invocation domain for `totland.app` and the matching parent-app associated-domain entitlement.
- Add the Apple App Site Association response needed for verified App Clip links, without changing existing website pages.
- Update the Codemagic iOS workflow so signing files are fetched for both the full app and App Clip, and the uploaded archive contains both targets.
- Document the remaining one-time App Store Connect actions: register the App Clip bundle ID, create its experience URL/card, upload the header image, and test the invocation before submission.

## Validation
- Confirm the full app and App Clip icons are opaque, correctly sized, and render cleanly at small sizes.
- Confirm the native project contains both targets with the correct parent/clip relationship and signing settings.
- Run the packaged web build and iOS project checks available in this environment.
- Verify the existing full app still launches normally and that the App Clip mini-game can be opened, completed, replayed, and handed off to the full app.

## Required account detail
Apple’s website association file requires the Apple Developer Team ID. If it is not available from the build environment, the App Clip code and target can still be completed, but final URL invocation will remain blocked until that Team ID is supplied and the App Store Connect App Clip record is created.
