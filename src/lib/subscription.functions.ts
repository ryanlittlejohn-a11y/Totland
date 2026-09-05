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
    const { data: rows, error } = await context.supabase
      .from("subscriptions")
      .select("status, price_id, current_period_end, cancel_at_period_end")
      .eq("user_id", context.userId)
      .eq("environment", data.environment)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) throw error;

    const row = rows?.[0];
    if (!row) {
      return { active: false, status: null, priceId: null, currentPeriodEnd: null, cancelAtPeriodEnd: false };
    }

    const end = row.current_period_end ? new Date(row.current_period_end).getTime() : null;
    const stillInPeriod = end === null || end > Date.now();
    const active =
      (["active", "trialing", "past_due"].includes(row.status) && stillInPeriod) ||
      (row.status === "canceled" && end !== null && end > Date.now());

    return {
      active,
      status: row.status,
      priceId: row.price_id,
      currentPeriodEnd: row.current_period_end,
      cancelAtPeriodEnd: row.cancel_at_period_end ?? false,
    };
  });
