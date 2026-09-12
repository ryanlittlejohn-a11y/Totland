# Fix TestFlight submission: missing beta test information

The iOS build succeeded end to end — compiled, signed, uploaded, and processed on App Store Connect (build `61a4e8db-...` for app `App.totland.kids`). The only failure is the final step: Apple requires test information before a build can be submitted to **external** TestFlight testing.

## What Apple says is missing

- Beta App Information: **Feedback Email**
- Beta App Review Information: **First Name, Last Name, Phone Number, Email**

## Fix (you, ~5 minutes in App Store Connect)

1. Open the test info page Apple linked:
   `https://appstoreconnect.apple.com/apps/6811231464/testflight/test-info`
2. Under **Beta App Information**, enter:
   - Feedback Email: an email you check (e.g. your own address)
   - Description: e.g. "Totland is a playful learning app for kids ages 2–6 with games for letters, numbers, shapes, and storybooks."
3. Under **Beta App Review Information**, enter:
   - First Name: Ryan, Last Name: Littlejohn
   - Phone Number and Email: your contact details
   - Sign-in required: leave off unless testers need an account note; if review needs a demo account, provide one later
4. Save.

## Then re-submit the build

Option A (simplest): in Codemagic, rerun the **Totland iOS** workflow. It rebuilds and re-uploads; the final step will now find the test info and submit to TestFlight.

Option B (faster): in App Store Connect → TestFlight, select the already-processed build and add it to your external tester group manually — no rebuild needed.

## Optional alternative: internal testing only

If you'd rather skip beta review entirely for now, internal testers (up to 100 people on your App Store Connect team) don't need test info or review. I can change `codemagic.yaml` publishing to target internal testing instead — tell me if you want that.

## Notes

- No code changes are required; the missing pieces live in App Store Connect settings, not the repo.
- The log also shows "Is or ever was made for kids: False" — before public App Store submission (not TestFlight), the Kids category setting should be corrected in App Store Connect per the earlier store-listing plan.
