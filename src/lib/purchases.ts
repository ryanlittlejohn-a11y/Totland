import { isNativeApp, nativePlatform } from "./native";

/**
 * Apple / Google store subscriptions, handled through RevenueCat.
 * Only used inside the packaged app — the website keeps using web checkout.
 */

export const PREMIUM_ENTITLEMENT = "premium";

/**
 * Entitlement ids that all mean "this family has Premium".
 * RevenueCat projects can name the entitlement differently to the app, so we
 * accept every known spelling rather than silently reporting no Premium.
 */
export const PREMIUM_ENTITLEMENT_IDS = [PREMIUM_ENTITLEMENT, "totland_pro", "pro"] as const;

/** True when any of our known premium entitlements is active. */
function hasPremium(customerInfo: { entitlements: { active: Record<string, unknown> } }): boolean {
  const active = customerInfo?.entitlements?.active ?? {};
  return PREMIUM_ENTITLEMENT_IDS.some((id) => Boolean(active[id]));
}

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

export interface StoreEntitlementState {
  active: boolean;
  managementURL: string | null;
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
  return { Purchases: mod.Purchases };
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
  const { Purchases } = await plugin();
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
  const { Purchases } = await plugin();
  await Purchases.logIn({ appUserID: userId });
  configuredFor = userId;
}

/** Back to an anonymous id when the parent signs out. */
export async function logOutPurchases(): Promise<void> {
  if (!storePurchasesAvailable() || !configured) return;
  if (configuredFor === null) return;
  const { Purchases } = await plugin();
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
  const { Purchases } = await plugin();
  const { current } = await Purchases.getOfferings();
  if (!current) return [];

  const offers: StoreOffer[] = [];
  for (const pkg of current.availablePackages) {
    const plan = planForPackage(pkg);
    if (!plan) continue;
    if (offers.some((o) => o.plan === plan)) continue;
    offers.push({
      plan,
      identifier: pkg.product.identifier,
      priceString: pkg.product.priceString,
      packageRef: pkg,
    });
  }
  return offers.sort((a) => (a.plan === "monthly" ? -1 : 1));
}

/**
 * Work out whether a store package is our monthly or yearly plan.
 *
 * Stores and RevenueCat can hand back the product id with a billing-plan
 * suffix (e.g. `totland_premium_yearly:monthly`), so we match on the base id
 * first and fall back to the package type RevenueCat reports.
 */
function planForPackage(pkg: {
  identifier?: string;
  packageType?: string;
  product: { identifier: string };
}): StorePlan | null {
  const base = String(pkg.product.identifier ?? "").split(":")[0];
  if (base === STORE_PRODUCTS.monthly) return "monthly";
  if (base === STORE_PRODUCTS.yearly) return "yearly";

  const tag = `${pkg.packageType ?? ""} ${pkg.identifier ?? ""} ${pkg.product.identifier ?? ""}`.toLowerCase();
  if (/annual|yearly|\$rc_annual/.test(tag)) return "yearly";
  if (/monthly|\$rc_monthly/.test(tag)) return "monthly";
  return null;
}

/** Buy a package. Resolves true when the premium entitlement is active. */
export async function purchaseStorePackage(offer: StoreOffer): Promise<boolean> {
  const { Purchases } = await plugin();
  const result = await Purchases.purchasePackage({
    aPackage: offer.packageRef as Parameters<typeof Purchases.purchasePackage>[0]["aPackage"],
  });
  return hasPremium(result.customerInfo);
}

/** Apple requires an explicit restore control. */
export async function restoreStorePurchases(): Promise<boolean> {
  if (!storePurchasesAvailable()) return false;
  const { Purchases } = await plugin();
  const { customerInfo } = await Purchases.restorePurchases();
  return hasPremium(customerInfo);
}

/** Current entitlement and store-management destination from RevenueCat. */
export async function getStoreEntitlementState(): Promise<StoreEntitlementState> {
  if (!storePurchasesAvailable()) return { active: false, managementURL: null };
  const { Purchases } = await plugin();
  const { customerInfo } = await Purchases.getCustomerInfo();
  return {
    active: hasPremium(customerInfo),
    managementURL: customerInfo.managementURL,
  };
}

/** Current entitlement straight from the store, used as a fast local check. */
export async function storeEntitlementActive(): Promise<boolean> {
  return (await getStoreEntitlementState()).active;
}

/** Open the store-provided subscription management destination. */
export async function openStoreSubscriptionManagement(managementURL: string): Promise<void> {
  const url = new URL(managementURL);
  if (url.protocol !== "https:") throw new Error("Unsupported subscription management URL");
  const { Browser } = await import("@capacitor/browser");
  await Browser.open({ url: url.toString(), presentationStyle: "popover" });
}


/** True when a purchase was cancelled by the parent rather than failing. */
export function isPurchaseCancelled(error: unknown): boolean {
  const e = error as { code?: string | number; message?: string } | null;
  if (!e) return false;
  return String(e.code) === "1" || /cancel/i.test(e.message ?? "");
}
