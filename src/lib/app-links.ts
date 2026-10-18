/**
 * Store listing links for Totland.
 *
 * `APP_STORE_LIVE` is the single switch for the whole app: flip it to `true`
 * the moment Apple approves the Kids-category review, and every "Get the
 * app" surface (parent dashboard, marketing pages) switches from a
 * "coming soon" badge to the real download button automatically. No other
 * code needs to change.
 */

/** Apple's permanent numeric app id from App Store Connect (stable even while in review). */
export const APP_STORE_ID = "6811231464";
export const APP_STORE_URL = `https://apps.apple.com/app/id${APP_STORE_ID}`;

/** Flip to true once the Kids-category review clears and the listing is public. */
export const APP_STORE_LIVE = false;

/** Google Play's package name (same `appId` as capacitor.config.ts / android/app/build.gradle). */
export const PLAY_STORE_PACKAGE = "app.totland.kids";
export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${PLAY_STORE_PACKAGE}`;

/** Flip to true once Google's review clears and the Play listing is public. */
export const PLAY_STORE_LIVE = false;
