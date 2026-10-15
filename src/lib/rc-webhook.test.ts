import { describe, expect, it } from "vitest";
import { handleRcEvent, type RcStore, type SubscriptionRow } from "./rc-webhook";

function memStore() {
  const subs = new Map<string, SubscriptionRow>();
  const pending = new Map<string, { rc_app_user_id: string; row_data: SubscriptionRow; claimed_by: string | null }>();
  const store: RcStore = {
    async upsertSubscription(row) {
      subs.set(row.paddle_subscription_id, { ...subs.get(row.paddle_subscription_id), ...row });
    },
    async upsertPending(p) {
      pending.set(p.subscription_id, { rc_app_user_id: p.rc_app_user_id, row_data: p.row_data, claimed_by: null });
    },
    async listUnclaimedPending(ids) {
      return [...pending.entries()]
        .filter(([, v]) => ids.includes(v.rc_app_user_id) && !v.claimed_by)
        .map(([subscription_id, v]) => ({ subscription_id, row_data: v.row_data }));
    },
    async markClaimed(id, acc) {
      pending.get(id)!.claimed_by = acc;
    },
  };
  return { store, subs, pending };
}

const ANON = "$RCAnonymousID:abc123";
const ACCOUNT = "11111111-2222-3333-4444-555555555555";
const purchase = {
  type: "INITIAL_PURCHASE",
  app_user_id: ANON,
  original_app_user_id: ANON,
  aliases: [ANON],
  original_transaction_id: "2000001",
  product_id: "totland_premium_yearly",
  store: "APP_STORE",
  environment: "SANDBOX",
  expiration_at_ms: Date.now() + 86_400_000,
};

describe("RevenueCat webhook", () => {
  it("records an anonymous purchase instead of skipping it", async () => {
    const { store, subs, pending } = memStore();
    const r = await handleRcEvent(purchase, store);
    expect(r).toEqual({ kind: "pending", rcId: ANON });
    expect(subs.size).toBe(0);
    const row = pending.get("rc_2000001")!;
    expect(row.rc_app_user_id).toBe(ANON);
    expect(row.row_data["status"]).toBe("active");
    expect(row.row_data["source"]).toBe("apple");
  });

  it("a TRANSFER event moves the anonymous purchase onto the account", async () => {
    const { store, subs, pending } = memStore();
    await handleRcEvent(purchase, store);
    const r = await handleRcEvent(
      { type: "TRANSFER", transferred_from: [ANON], transferred_to: [ACCOUNT] },
      store,
    );
    expect(r).toEqual({ kind: "transferred", userId: ACCOUNT, claimed: 1 });
    const sub = subs.get("rc_2000001")!;
    expect(sub["user_id"]).toBe(ACCOUNT);
    expect(sub["status"]).toBe("active");
    expect(pending.get("rc_2000001")!.claimed_by).toBe(ACCOUNT);
  });

  it("a later event listing the anonymous ID as an alias also links it", async () => {
    const { store, subs } = memStore();
    await handleRcEvent(purchase, store);
    await handleRcEvent({ ...purchase, type: "RENEWAL", app_user_id: ACCOUNT, aliases: [ANON, ACCOUNT] }, store);
    expect(subs.get("rc_2000001")!["user_id"]).toBe(ACCOUNT);
  });

  it("signed-in purchases are recorded on the account directly", async () => {
    const { store, subs, pending } = memStore();
    await handleRcEvent({ ...purchase, app_user_id: ACCOUNT, aliases: [ACCOUNT] }, store);
    expect(subs.get("rc_2000001")!["user_id"]).toBe(ACCOUNT);
    expect(pending.size).toBe(0);
  });

  it("a transfer to another anonymous ID does not attach to any account", async () => {
    const { store, subs } = memStore();
    await handleRcEvent(purchase, store);
    const r = await handleRcEvent({ type: "TRANSFER", transferred_from: [ANON], transferred_to: ["$RCAnonymousID:zz"] }, store);
    expect(r.kind).toBe("ignored");
    expect(subs.size).toBe(0);
  });
});
