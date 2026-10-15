import { createFileRoute } from "@tanstack/react-router";
import { handleRcEvent, type RcStore } from "@/lib/rc-webhook";

/**
 * RevenueCat webhook: the only thing that grants or revokes premium bought
 * through Apple's or Google's stores. RevenueCat validates the store receipt
 * before it calls us, and we verify the shared authorization header here.
 * Logic lives in src/lib/rc-webhook.ts (anonymous purchases + TRANSFER).
 */

export const Route = createFileRoute("/api/public/rc/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["REVENUECAT_WEBHOOK_SECRET"];
        if (!secret) {
          console.error("REVENUECAT_WEBHOOK_SECRET is not configured");
          return new Response("Not configured", { status: 500 });
        }
        const provided = request.headers.get("authorization") ?? "";
        if (provided !== secret && provided !== `Bearer ${secret}`) {
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: any;
        try {
          payload = await request.json();
        } catch {
          return new Response("Bad payload", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const db = supabaseAdmin as any;
        const fail = (e: unknown) => {
          if (e) throw e;
        };
        const store: RcStore = {
          async upsertSubscription(row) {
            const { error } = await db.from("subscriptions").upsert(row, { onConflict: "paddle_subscription_id" });
            fail(error);
          },
          async upsertPending(p) {
            const { error } = await db
              .from("store_purchases_pending")
              .upsert({ ...p, updated_at: new Date().toISOString() }, { onConflict: "subscription_id" });
            fail(error);
          },
          async listUnclaimedPending(rcIds) {
            const { data, error } = await db
              .from("store_purchases_pending")
              .select("subscription_id,row_data")
              .in("rc_app_user_id", rcIds)
              .is("claimed_by", null);
            fail(error);
            return data ?? [];
          },
          async markClaimed(subscriptionId, accountId) {
            const now = new Date().toISOString();
            const { error } = await db
              .from("store_purchases_pending")
              .update({ claimed_by: accountId, claimed_at: now, updated_at: now })
              .eq("subscription_id", subscriptionId);
            fail(error);
          },
        };

        try {
          await handleRcEvent(payload?.event ?? {}, store);
        } catch (error) {
          console.error("revenuecat webhook write failed", error);
          return new Response("Write failed", { status: 500 });
        }
        return new Response("ok");
      },
    },
  },
});
