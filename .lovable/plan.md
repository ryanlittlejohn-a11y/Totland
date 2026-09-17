# Fix the App Store upload rejection (error 90474)

## What happened
The build compiled and signed fine. Apple rejected the upload because the App Clip's iPad
orientation settings only list the two portrait options. Apple requires iPad bundles to list
all four orientations so multitasking works.

## The fix
In the App Clip's settings file (`ios/AppClip/Info.plist`), change the iPad orientation list
(`UISupportedInterfaceOrientations~ipad`) from the two portrait entries to all four:

- Portrait
- Portrait upside down
- Landscape left
- Landscape right

The iPhone orientation list stays portrait-only, so the mini game still presents in portrait
on iPhone. On iPad the system may rotate the clip, and the counting game layout already
centers and scales, so it stays usable.

## Not changing
- The main Totland app's settings already list all four iPad orientations.
- No signing, entitlement, or App Clip identifier changes — those are now correct.

## After approval
1. Apply the one-file change.
2. Publish, then rerun the Totland iOS workflow in Codemagic so a fresh build uploads.
