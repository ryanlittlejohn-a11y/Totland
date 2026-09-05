import { useState } from "react";

import { initializePaddle, getPaddlePriceId } from "@/lib/paddle";

export type PlanId = "premium_monthly" | "premium_yearly";

export function usePaddleCheckout(onCompleted: () => void) {
  const [loading, setLoading] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openCheckout = async (priceId: PlanId, opts: { userId: string; email?: string | undefined }) => {
    setLoading(priceId);
    setError(null);
    try {
      await initializePaddle((event: any) => {
        if (event?.name === "checkout.completed") onCompleted();
      });
      const paddlePriceId = await getPaddlePriceId(priceId);
      window.Paddle.Checkout.open({
        items: [{ priceId: paddlePriceId, quantity: 1 }],
        customer: opts.email ? { email: opts.email } : undefined,
        customData: { userId: opts.userId },
        settings: {
          displayMode: "overlay",
          locale: "en",
          successUrl: `${window.location.origin}/parent/subscription?checkout=success`,
          allowLogout: false,
          variant: "one-page",
        },
      });
    } catch (e) {
      console.error(e);
      setError("We couldn't open checkout just now. Please try again in a moment.");
    } finally {
      setLoading(null);
    }
  };

  return { openCheckout, loading, error };
}
