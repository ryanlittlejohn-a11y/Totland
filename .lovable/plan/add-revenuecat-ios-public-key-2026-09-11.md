# Add RevenueCat iOS public key

You provided the RevenueCat iOS public key `appl_HsZozLYeDxkkUyvOYIOgbtRrVvo`. This is a publishable key, so it can live in the repo's environment files.

## What will change

1. **Add the key to `.env.production`**
   - Set `VITE_REVENUECAT_IOS_KEY=appl_HsZozLYeDxkkUyvOYIOgbtRrVvo` alongside the existing `VITE_PAYMENTS_CLIENT_TOKEN`.

2. **Add the key to `.env`**
   - Set the same value so local Capacitor builds and the dev preview can exercise the store purchase flow when a key is present.

3. **Update `MOBILE.md`**
   - Note that the iOS key is now committed and that the remaining Codemagic variable is `VITE_REVENUECAT_ANDROID_KEY` (starts with `goog_`).

4. **Verify the app bundle builds**
   - Run `bun run build:app` to confirm the key is picked up and the bundle compiles.

## What I need from you

- Do you also have the RevenueCat **Android** public key (`goog_...`) to add now, or should that wait until the Google Play setup is ready?
