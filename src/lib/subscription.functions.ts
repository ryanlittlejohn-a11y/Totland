import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface SubscriptionState {
  active: boolean;
  status: string | null;
  priceId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

/**
 * Server-verified entitlement. The row is only ever written by the Paddle
 * webhook, so this cannot be faked from the browser.
 */
export const getMySubscription = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: "sandbox" | "live" }) => data)
  .handler(async ({ data, context }): Promise<SubscriptionState> => {
    // Website purchases are scoped to the payment environment; App Store and
    // Google Play purchases are always counted for the signed-in parent.
    const { data: rows, error } = await context.supabase
      .from("subscriptions")
      .select("status, price_id, current_period_end, cancel_at_period_end, source, environment")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    const relevant = (rows ?? []).filter(
      (r) => r.source !== "paddle" || r.environment === data.environment,
    );

    const evaluate = (row: (typeof relevant)[number]) => {
      const end = row.current_period_end ? new Date(row.current_period_end).getTime() : null;
      const stillInPeriod = end === null || end > Date.now();
      const active =
        (["active", "trialing", "past_due"].includes(row.status) && stillInPeriod) ||
        (row.status === "canceled" && end !== null && end > Date.now());
      return { row, active };
    };

    const evaluated = relevant.map(evaluate);
    const chosen = evaluated.find((e) => e.active) ?? evaluated[0];

    if (!chosen) {
      return { active: false, status: null, priceId: null, currentPeriodEnd: null, cancelAtPeriodEnd: false };
    }

    return {
      active: chosen.active,
      status: chosen.row.status,
      priceId: chosen.row.price_id,
      currentPeriodEnd: chosen.row.current_period_end,
      cancelAtPeriodEnd: chosen.row.cancel_at_period_end ?? false,
    };
  });
