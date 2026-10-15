/**
 * Pure RevenueCat webhook logic, separated from the HTTP route so it can be
 * tested. Purchases made before a grown-up signs in arrive under an anonymous
 * RevenueCat ID ($RCAnonymousID:...); those are kept in store_purchases_pending
 * and moved onto the account when a TRANSFER event (or any later event that
 * lists the anonymous ID as an alias) names the account.
 */

const ACTIVE_EVENTS = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "PRODUCT_CHANGE",
  "UNCANCELLATION",
  "NON_RENEWING_PURCHASE",
  "SUBSCRIPTION_EXTENDED",
  "TEMPORARY_ENTITLEMENT_GRANT",
]);
const CANCEL_EVENTS = new Set(["CANCELLATION"]);
const END_EVENTS = new Set(["EXPIRATION", "REFUND", "SUBSCRIPTION_PAUSED"]);
const BILLING_ISSUE_EVENTS = new Set(["BILLING_ISSUE"]);

export function statusFor(type: string): string | null {
  if (ACTIVE_EVENTS.has(type)) return "active";
  if (CANCEL_EVENTS.has(type)) return "canceled";
  if (END_EVENTS.has(type)) return "expired";
  if (BILLING_ISSUE_EVENTS.has(type)) return "past_due";
  return null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isAccountId = (id: unknown): id is string => typeof id === "string" && UUID.test(id);

export type SubscriptionRow = Record<string, unknown> & { paddle_subscription_id: string };

export interface RcStore {
  upsertSubscription(row: SubscriptionRow): Promise<void>;
  upsertPending(p: { rc_app_user_id: string; subscription_id: string; row_data: SubscriptionRow }): Promise<void>;
  listUnclaimedPending(rcIds: string[]): Promise<{ subscription_id: string; row_data: SubscriptionRow }[]>;
  markClaimed(subscriptionId: string, accountId: string): Promise<void>;
}

export type RcResult =
  | { kind: "ignored" }
  | { kind: "recorded"; userId: string; claimed: number }
  | { kind: "pending"; rcId: string }
  | { kind: "transferred"; userId: string; claimed: number };

function ids(...lists: unknown[]): string[] {
  const out = new Set<string>();
  for (const l of lists) {
    for (const v of Array.isArray(l) ? l : [l]) if (typeof v === "string" && v) out.add(v);
  }
  return [...out];
}

async function claim(store: RcStore, rcIds: string[], accountId: string): Promise<number> {
  const anon = rcIds.filter((i) => !isAccountId(i));
  if (!anon.length) return 0;
  const rows = await store.listUnclaimedPending(anon);
  for (const r of rows) {
    await store.upsertSubscription({
      ...r.row_data,
      user_id: accountId,
      paddle_customer_id: accountId,
      updated_at: new Date().toISOString(),
    });
    await store.markClaimed(r.subscription_id, accountId);
  }
  return rows.length;
}

export async function handleRcEvent(event: any, store: RcStore): Promise<RcResult> {
  const type: string = event?.type ?? "";

  if (type === "TRANSFER") {
    const to = ids(event.transferred_to);
    const from = ids(event.transferred_from);
    const accountId = to.find(isAccountId);
    if (!accountId) return { kind: "ignored" };
    const claimed = await claim(store, [...from, ...to], accountId);
    return { kind: "transferred", userId: accountId, claimed };
  }

  const status = statusFor(type);
  if (!status) return { kind: "ignored" };

  const appUserId: string = event.app_user_id ?? "";
  const known = ids(appUserId, event.original_app_user_id, event.aliases);
  if (!known.length) return { kind: "ignored" };
  const accountId = known.find(isAccountId);

  const store_ = String(event.store ?? "").toUpperCase();
  const row: SubscriptionRow = {
    paddle_subscription_id: `rc_${event.original_transaction_id ?? event.transaction_id ?? appUserId}`,
    product_id: "totland_premium",
    price_id: event.product_id ?? "unknown",
    status,
    source: store_ === "PLAY_STORE" ? "google" : store_ === "APP_STORE" ? "apple" : "store",
    current_period_start: event.purchased_at_ms ? new Date(event.purchased_at_ms).toISOString() : null,
    current_period_end: event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null,
    cancel_at_period_end: type === "CANCELLATION",
    environment: String(event.environment ?? "").toUpperCase() === "SANDBOX" ? "sandbox" : "live",
    updated_at: new Date().toISOString(),
  };

  if (accountId) {
    await store.upsertSubscription({ ...row, user_id: accountId, paddle_customer_id: accountId });
    const claimed = await claim(store, known, accountId);
    return { kind: "recorded", userId: accountId, claimed };
  }

  const rcId: string = appUserId || known[0]!;
  await store.upsertPending({ rc_app_user_id: rcId, subscription_id: row.paddle_subscription_id, row_data: row });
  return { kind: "pending", rcId };
}
