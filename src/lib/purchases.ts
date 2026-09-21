import { isNativeApp, nativePlatform } from "./native";

/**
 * Apple / Google store subscriptions, handled through RevenueCat.
 * Only used inside the packaged app — the website keeps using web checkout.
 */

export const PREMIUM_ENTITLEMENT = "premium";

/** Store product identifiers, created in App Store Connect and Google Play. */
export const STORE_PRODUCTS = {
  monthly: "totland_premium_monthly",
  yearly: "totland_premium_yearly",
} as const;

export type StorePlan = keyof typeof STORE_PRODUCTS;

export interface StoreOffer {
  plan: StorePlan;
  identifier: string;
  priceString: string;
  packageRef: unknown;
}

function apiKey(): string | undefined {
  const platform = nativePlatform();
  if (platform === "ios") return import.meta.env["VITE_REVENUECAT_IOS_KEY"] as string | undefined;
  if (platform === "android") return import.meta.env["VITE_REVENUECAT_ANDROID_KEY"] as string | undefined;
  return undefined;
}

export function storePurchasesAvailable(): boolean {
  return isNativeApp() && Boolean(apiKey());
}

let configured = false;
let configuredFor: string | null = null;

async function plugin() {
  const mod = await import("@revenuecat/purchases-capacitor");
  return mod.Purchases;
}

/**
 * Configure RevenueCat once at launch.
 *
 * With no user id RevenueCat generates its own anonymous app user id, so a
 * grown-up can buy and restore Premium without ever making an account. When
 * they later sign in we call `logInPurchases`, which RevenueCat treats as an
 * alias: the anonymous purchase moves onto their account.
 */
export async function configurePurchases(userId?: string | null): Promise<void> {
  if (!storePurchasesAvailable()) return;
  const Purchases = await plugin();
  if (!configured) {
    await Purchases.configure(userId ? { apiKey: apiKey()!, appUserID: userId } : { apiKey: apiKey()! });
    configured = true;
    configuredFor = userId ?? null;
    return;
  }
  if (userId && configuredFor !== userId) await logInPurchases(userId);
}

/** Link the store purchase to a signed-in parent's account. */
export async function logInPurchases(userId: string): Promise<void> {
  if (!storePurchasesAvailable()) return;
  await configurePurchases();
  if (configuredFor === userId) return;
  const Purchases = await plugin();
  await Purchases.logIn({ appUserID: userId });
  configuredFor = userId;
}

/** Back to an anonymous id when the parent signs out. */
export async function logOutPurchases(): Promise<void> {
  if (!storePurchasesAvailable() || !configured) return;
  if (configuredFor === null) return;
  const Purchases = await plugin();
  try {
    await Purchases.logOut();
  } catch {
    // Already anonymous — nothing to do.
  }
  configuredFor = null;
}


/** The monthly / yearly packages as offered by the store. */
export async function listStoreOffers(): Promise<StoreOffer[]> {
  if (!storePurchasesAvailable()) return [];
  const Purchases = await plugin();
  const { current } = await Purchases.getOfferings();
  if (!current) return [];

  const offers: StoreOffer[] = [];
  for (const pkg of current.availablePackages) {
    const productId = pkg.product.identifier;
    const plan: StorePlan | null =
      productId === STORE_PRODUCTS.monthly
        ? "monthly"
        : productId === STORE_PRODUCTS.yearly
          ? "yearly"
          : null;
    if (!plan) continue;
    offers.push({
      plan,
      identifier: productId,
      priceString: pkg.product.priceString,
      packageRef: pkg,
    });
  }
  return offers.sort((a) => (a.plan === "monthly" ? -1 : 1));
}

/** Buy a package. Resolves true when the premium entitlement is active. */
export async function purchaseStorePackage(offer: StoreOffer): Promise<boolean> {
  const Purchases = await plugin();
  const result = await Purchases.purchasePackage({
    aPackage: offer.packageRef as Parameters<typeof Purchases.purchasePackage>[0]["aPackage"],
  });
  return Boolean(result.customerInfo.entitlements.active[PREMIUM_ENTITLEMENT]);
}

/** Apple requires an explicit restore control. */
export async function restoreStorePurchases(): Promise<boolean> {
  if (!storePurchasesAvailable()) return false;
  const Purchases = await plugin();
  const { customerInfo } = await Purchases.restorePurchases();
  return Boolean(customerInfo.entitlements.active[PREMIUM_ENTITLEMENT]);
}

/** Current entitlement straight from the store, used as a fast local check. */
export async function storeEntitlementActive(): Promise<boolean> {
  if (!storePurchasesAvailable()) return false;
  const Purchases = await plugin();
  const { customerInfo } = await Purchases.getCustomerInfo();
  return Boolean(customerInfo.entitlements.active[PREMIUM_ENTITLEMENT]);
}

/** True when a purchase was cancelled by the parent rather than failing. */
export function isPurchaseCancelled(error: unknown): boolean {
  const e = error as { code?: string | number; message?: string } | null;
  if (!e) return false;
  return String(e.code) === "1" || /cancel/i.test(e.message ?? "");
}
