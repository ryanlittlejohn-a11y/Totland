import { createFileRoute } from "@tanstack/react-router";

/**
 * RevenueCat webhook: the only thing that grants or revokes premium bought
 * through Apple's or Google's stores. RevenueCat validates the store receipt
 * before it calls us, and we verify the shared authorization header here.
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

function statusFor(type: string): string | null {
  if (ACTIVE_EVENTS.has(type)) return "active";
  if (CANCEL_EVENTS.has(type)) return "canceled";
  if (END_EVENTS.has(type)) return "expired";
  if (BILLING_ISSUE_EVENTS.has(type)) return "past_due";
  return null;
}

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

        const event = payload?.event ?? {};
        const type: string = event.type ?? "";
        const status = statusFor(type);
        if (!status) return new Response("ok");

        const userId: string | undefined = event.app_user_id;
        if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) {
          console.error("revenuecat webhook without a usable app_user_id", type);
          return new Response("ok");
        }

        const store: string = String(event.store ?? "").toUpperCase();
        const source = store === "PLAY_STORE" ? "google" : store === "APP_STORE" ? "apple" : "store";
        const environment = String(event.environment ?? "").toUpperCase() === "SANDBOX" ? "sandbox" : "live";
        const subscriptionId = `rc_${event.original_transaction_id ?? event.transaction_id ?? userId}`;
        const priceId: string = event.product_id ?? "unknown";
        const periodStart = event.purchased_at_ms ? new Date(event.purchased_at_ms).toISOString() : null;
        const periodEnd = event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.from("subscriptions").upsert(
          {
            user_id: userId,
            paddle_subscription_id: subscriptionId,
            paddle_customer_id: userId,
            product_id: "totland_premium",
            price_id: priceId,
            status,
            source,
            current_period_start: periodStart,
            current_period_end: periodEnd,
            cancel_at_period_end: type === "CANCELLATION",
            environment,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "paddle_subscription_id" },
        );

        if (error) {
          console.error("revenuecat webhook write failed", error);
          return new Response("Write failed", { status: 500 });
        }

        return new Response("ok");
      },
    },
  },
});
