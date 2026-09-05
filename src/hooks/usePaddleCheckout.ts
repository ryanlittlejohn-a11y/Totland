import { useState } from "react";
import { initializePaddle, getPaddlePriceId } from "@/lib/paddle";

export type PlanId = "premium_monthly" | "premium_yearly";

export function usePaddleCheckout(onPurchased: () => void) {
  const [loading, setLoading] = useState<PlanId | null>(null);

  const openCheckout = async (priceId: PlanId) => {
    setLoading(priceId);
    try {
      await initializePaddle((event: any) => {
        if (event?.name === "checkout.completed") onPurchased();
      });
      const paddlePriceId = await getPaddlePriceId(priceId);
      window.Paddle.Checkout.open({
        items: [{ priceId: paddlePriceId, quantity: 1 }],
        settings: {
          displayMode: "overlay",
          locale: "en",
          successUrl: `${window.location.origin}/parent/subscription?checkout=success`,
          allowLogout: false,
          variant: "one-page",
        },
      });
    } finally {
      setLoading(null);
    }
  };

  return { openCheckout, loading };
}
