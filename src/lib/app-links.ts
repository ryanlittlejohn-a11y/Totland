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

/** Google Play isn't set up yet — fill in once the developer account/app listing exists. */
export const PLAY_STORE_URL: string | null = null;
export const PLAY_STORE_LIVE = false;
