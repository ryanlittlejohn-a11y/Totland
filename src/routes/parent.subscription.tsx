import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AREAS } from "@/lib/content";
import { useProfile } from "@/lib/profile";
import { usePaddleCheckout, type PlanId } from "@/hooks/usePaddleCheckout";

export const Route = createFileRoute("/parent/subscription")({
  validateSearch: (search: Record<string, unknown>) => ({
    checkout: typeof search.checkout === "string" ? search.checkout : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Subscription — Totland" },
      { name: "description", content: "Totland Premium: $2.99 a month or $19.99 a year for the full learning library. No ads, ever." },
      { property: "og:title", content: "Subscription — Totland" },
      { property: "og:description", content: "Affordable, ad-free premium access to the complete Totland learning library." },
    ],
  }),
  component: Subscription,
});

const PLANS: { id: PlanId; price: string; cadence: string; best?: boolean }[] = [
  { id: "premium_monthly", price: "$2.99", cadence: "per month" },
  { id: "premium_yearly", price: "$19.99", cadence: "per year · best value", best: true },
];

function Subscription() {
  const { profile, update } = useProfile();
  const { checkout } = Route.useSearch();
  const premiumAreas = AREAS.filter((a) => !a.free);

  const unlockPremium = () => update((p) => ({ ...p, premium: true }));
  const { openCheckout, loading } = usePaddleCheckout(unlockPremium);

  // Fallback: Paddle redirects here after a successful checkout.
  useEffect(() => {
    if (checkout === "success" && !profile.premium) unlockPremium();
  }, [checkout, profile.premium]);

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-card p-5 wood-block">
        <div className="flex items-center justify-between">
          <h2 className="font-ui text-xl font-bold text-ink">Totland Premium</h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              profile.premium ? "bg-moss/20 text-moss" : "bg-felt text-inksoft"
            }`}
          >
            {profile.premium ? "Active" : "Free plan"}
          </span>
        </div>
        <p className="mt-2 text-sm text-inksoft">
          Free includes the ABC, numbers, colors, shapes, memory and tracing worlds. Premium unlocks everything and every
          new release.
        </p>

        {profile.premium ? (
          <div className="mt-4 rounded-2xl bg-moss/15 p-4 text-sm text-ink">
            <p className="font-semibold">🎉 Premium is active on this device — the whole library is unlocked.</p>
            <p className="mt-2 text-inksoft">
              To manage, switch, or cancel your subscription, visit{" "}
              <a href="https://paddle.net" target="_blank" rel="noopener noreferrer" className="underline">
                paddle.net
              </a>{" "}
              with the email you used at checkout. Canceling keeps premium until the end of your paid period.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  disabled={loading !== null}
                  onClick={() => openCheckout(plan.id)}
                  className={`rounded-2xl p-4 text-left transition-transform active:scale-95 disabled:opacity-60 ${
                    plan.best ? "bg-amber/25 ring-1 ring-amber" : "bg-felt"
                  }`}
                >
                  <p className="font-ui text-2xl font-bold text-ink">{plan.price}</p>
                  <p className="text-xs text-inksoft">{plan.cadence}</p>
                  <p className="mt-2 font-ui text-sm font-bold text-clay">
                    {loading === plan.id ? "Opening…" : "Subscribe"}
                  </p>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-inksoft">
              Secure checkout. Cancel anytime; premium stays active until the end of your paid period. Purchases are
              only reachable behind this parental gate — never from the child experience.
            </p>
          </>
        )}

        <ul className="mt-4 space-y-1.5 text-sm text-ink">
          {premiumAreas.map((a) => (
            <li key={a.id}>
              {a.emoji} {a.title} — {a.activities} activities
            </li>
          ))}
          <li>🎁 New content every month, downloaded for offline play</li>
        </ul>
      </section>

      <section className="rounded-3xl bg-card p-5 wood-block">
        <h2 className="font-ui text-lg font-bold text-ink">Privacy</h2>
        <ul className="mt-2 space-y-1.5 text-sm text-inksoft">
          <li>· No child accounts, no chat, no social features, no external links in the child area.</li>
          <li>· Learning data is stored on this device only.</li>
          <li>· No third-party advertising or behavioural profiling.</li>
          <li>· Payment details are handled entirely by our payment provider — they never touch this app.</li>
          <li>· Purchases, settings and links sit behind the parental gate.</li>
        </ul>
      </section>
    </div>
  );
}
