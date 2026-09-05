import { createFileRoute } from "@tanstack/react-router";

import { verifyWebhook, type PaddleEnv } from "@/lib/paddle.server";

/**
 * Paddle webhook receiver. This is the ONLY thing that grants or revokes
 * premium — the browser is never trusted for entitlement.
 */
export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const env: PaddleEnv = url.searchParams.get("env") === "live" ? "live" : "sandbox";

        let event: any;
        try {
          event = await verifyWebhook(request, env);
        } catch (error) {
          console.error("paddle webhook verification failed", error);
          return new Response("Invalid signature", { status: 401 });
        }

        const type: string = event?.eventType ?? "";
        if (!type.startsWith("subscription.")) {
          return new Response("ok");
        }

        const data = event.data ?? {};
        const userId: string | undefined = data.customData?.userId;
        if (!userId) {
          console.error("paddle webhook missing customData.userId", type, data.id);
          return new Response("ok");
        }

        const item = data.items?.[0] ?? {};
        const priceExternalId: string | undefined = item.price?.importMeta?.externalId ?? undefined;
        const productExternalId: string | undefined = item.price?.product?.importMeta?.externalId ?? undefined;

        if (!priceExternalId) {
          console.error("paddle webhook missing importMeta.externalId for price", data.id);
          return new Response("ok");
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const row = {
          user_id: userId,
          paddle_subscription_id: data.id as string,
          paddle_customer_id: (data.customerId ?? "") as string,
          product_id: productExternalId ?? "totland_premium",
          price_id: priceExternalId,
          status: (data.status ?? "active") as string,
          current_period_start: data.currentBillingPeriod?.startsAt ?? null,
          current_period_end: data.currentBillingPeriod?.endsAt ?? null,
          cancel_at_period_end: data.scheduledChange?.action === "cancel",
          environment: env,
        };

        const { error } = await supabaseAdmin
          .from("subscriptions")
          .upsert(row, { onConflict: "paddle_subscription_id" });

        if (error) {
          console.error("paddle webhook upsert failed", error);
          return new Response("Database error", { status: 500 });
        }

        return new Response("ok");
      },
    },
  },
});
