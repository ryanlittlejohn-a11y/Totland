import { getPaddleEnvironment } from "@/lib/paddle";

export function PaymentTestModeBanner() {
  if (getPaddleEnvironment() !== "sandbox") return null;

  return (
    <div className="w-full border-b border-amber bg-amber/15 px-4 py-2 text-center text-xs font-semibold text-ink">
      Payments are in test mode in the preview — no real money is charged.
    </div>
  );
}
