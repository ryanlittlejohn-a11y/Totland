/**
 * Facts shared by the two comparison pages (/best/..., /compare/...).
 * Update LAST_CHECKED_* here when the competitor facts are re-verified: one edit changes both pages.
 * A year-end refresh is due (the roundup title says 2026).
 */
export const LAST_CHECKED = "November 10, 2026";
export const LAST_CHECKED_ISO = "2026-11-10";
/** Month-level wording used next to each dated competitor fact. */
export const AS_OF = "as of November 2026";

/**
 * Totland Premium prices (USD). Source of truth in code: PLANS in src/routes/parent.subscription.tsx
 * (and StorePurchasePanel.tsx); keep these two in sync if pricing ever changes.
 */
export const TOTLAND_PRICE_YEARLY = "$19.99";
export const TOTLAND_PRICE_MONTHLY = "$2.99";
export const TOTLAND_PRICE_NOTE = "US, as of November 2026; store prices may vary";

export const SUPPORT_EMAIL = "Support@totland.app";
