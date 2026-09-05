import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { AREAS } from "@/lib/content";
import { useProfile } from "@/lib/profile";
import { usePaddleCheckout, type PlanId } from "@/hooks/usePaddleCheckout";
import { useParentAuth } from "@/hooks/useParentAuth";
import { ParentAuthCard } from "@/components/ParentAuthCard";
import { getPaddleEnvironment } from "@/lib/paddle";
import { getMySubscription, type SubscriptionState } from "@/lib/subscription.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/parent/subscription")({
  validateSearch: (search: Record<string, unknown>) => ({
    checkout: typeof search["checkout"] === "string" ? (search["checkout"] as string) : undefined,
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

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function Subscription() {
  const { profile, update } = useProfile();
  const { checkout } = Route.useSearch();
  const { user, ready } = useParentAuth();
  const premiumAreas = AREAS.filter((a) => !a.free);

  const fetchSubscription = useServerFn(getMySubscription);
  const [sub, setSub] = useState<SubscriptionState | null>(null);
  const [checking, setChecking] = useState(false);
  const [waitingForPayment, setWaitingForPayment] = useState(false);

  const sync = useCallback(async () => {
    if (!user) return null;
    setChecking(true);
    try {
      const state = await fetchSubscription({ data: { environment: getPaddleEnvironment() } });
      setSub(state);
      // Cache the verified answer locally so the app keeps working offline.
      update((p) => (p.premium === state.active ? p : { ...p, premium: state.active }));
      return state;
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      setChecking(false);
    }
  }, [user, fetchSubscription, update]);

  useEffect(() => {
    if (ready && user?.email_confirmed_at) void sync();
    if (ready && (!user || !user.email_confirmed_at)) setSub(null);
  }, [ready, user, sync]);

  // After checkout the payment provider confirms by webhook; poll briefly.
  const waitForActivation = useCallback(async () => {
    setWaitingForPayment(true);
    for (let i = 0; i < 12; i++) {
      const state = await sync();
      if (state?.active) break;
      await new Promise((r) => setTimeout(r, 2500));
    }
    setWaitingForPayment(false);
  }, [sync]);

  useEffect(() => {
    if (checkout === "success" && user && !sub?.active) void waitForActivation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkout, user]);

  const { openCheckout, loading, error } = usePaddleCheckout(() => void waitForActivation());

  const emailVerified = Boolean(user?.email_confirmed_at);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const resendVerification = async () => {
    if (!user?.email) return;
    setResendState("sending");
    const { error: err } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
      options: { emailRedirectTo: `${window.location.origin}/parent/subscription` },
    });
    setResendState(err ? "error" : "sent");
  };

  const active = emailVerified && (sub?.active ?? false);
  const renewalDate = formatDate(sub?.currentPeriodEnd ?? null);

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-card p-5 wood-block">
        <div className="flex items-center justify-between">
          <h2 className="font-ui text-xl font-bold text-ink">Totland Premium</h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              active ? "bg-moss/20 text-moss" : "bg-felt text-inksoft"
            }`}
          >
            {active ? "Active" : "Free plan"}
          </span>
        </div>
        <p className="mt-2 text-sm text-inksoft">
          Free includes the ABC, numbers, colors, shapes, memory and tracing worlds. Premium unlocks everything and every
          new release.
        </p>

        {waitingForPayment && (
          <p className="mt-4 rounded-2xl bg-amber/20 p-4 text-sm text-ink">
            Confirming your payment… this usually takes a few seconds.
          </p>
        )}

        {!ready ? (
          <p className="mt-4 text-sm text-inksoft">Loading…</p>
        ) : !user ? (
          <p className="mt-4 rounded-2xl bg-felt p-4 text-sm text-inksoft">
            Sign in below to subscribe or to restore a subscription you already bought.
          </p>
         ) : !emailVerified ? (
          <div className="mt-4 rounded-2xl bg-amber/20 p-4 text-sm text-ink">
            <p className="font-semibold">Please verify your email address.</p>
            <p className="mt-2 text-inksoft">
              We sent a confirmation link to {user.email}. Open it, then come back here — verified emails are required
              before subscribing or restoring a purchase, so your account stays protected.
            </p>
            <button
              type="button"
              onClick={() => void resendVerification()}
              disabled={resendState === "sending" || resendState === "sent"}
              className="mt-3 rounded-xl bg-night px-4 py-2 font-ui text-sm font-bold text-cream disabled:opacity-60"
            >
              {resendState === "sending"
                ? "Sending…"
                : resendState === "sent"
                  ? "Email sent — check your inbox"
                  : "Resend verification email"}
            </button>
            {resendState === "error" && (
              <p className="mt-2 text-clay">Couldn't send the email right now. Please try again in a minute.</p>
            )}
          </div>
        ) : active ? (
          <div className="mt-4 rounded-2xl bg-moss/15 p-4 text-sm text-ink">
            <p className="font-semibold">🎉 Premium is active — the whole library is unlocked.</p>
            {renewalDate && (
              <p className="mt-2 text-inksoft">
                {sub?.cancelAtPeriodEnd || sub?.status === "canceled"
                  ? `Access ends ${renewalDate}.`
                  : `Renews ${renewalDate}.`}
              </p>
            )}
            {sub?.status === "past_due" && (
              <p className="mt-2 text-clay">
                Your last payment didn't go through. Please update your card at paddle.net to keep premium.
              </p>
            )}
            <p className="mt-2 text-inksoft">
              To switch plans, update your card, or cancel, visit{" "}
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
                  onClick={() => openCheckout(plan.id, { userId: user.id, email: user.email ?? undefined })}
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
            {error && <p className="mt-3 text-sm text-clay">{error}</p>}
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

      {ready && !user ? (
        <ParentAuthCard />
      ) : (
        user && (
          <section className="rounded-3xl bg-card p-5 wood-block">
            <h2 className="font-ui text-lg font-bold text-ink">Your account</h2>
            <p className="mt-2 text-sm text-inksoft">Signed in as {user.email}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => void sync()}
                disabled={checking || !emailVerified}
                className="rounded-xl bg-felt px-4 py-2 font-ui text-sm font-semibold text-ink disabled:opacity-60"
              >
                {checking ? "Checking…" : "Restore purchase"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  update((p) => ({ ...p, premium: false }));
                }}
                className="rounded-xl bg-felt px-4 py-2 font-ui text-sm font-semibold text-ink"
              >
                Sign out
              </button>
            </div>
            {profile.premium && (
              <p className="mt-3 text-xs text-inksoft">
                Premium is saved on this device too, so games keep working with no internet.
              </p>
            )}
          </section>
        )
      )}

      <section className="rounded-3xl bg-card p-5 wood-block">
        <h2 className="font-ui text-lg font-bold text-ink">Privacy</h2>
        <ul className="mt-2 space-y-1.5 text-sm text-inksoft">
          <li>· No child accounts, no chat, no social features, no external links in the child area.</li>
          <li>· Learning data is stored on this device only.</li>
          <li>· The grown-up account stores only an email address, used for your subscription.</li>
          <li>· No third-party advertising or behavioural profiling.</li>
          <li>· Payment details are handled entirely by our payment provider — they never touch this app.</li>
          <li>· Purchases, settings and links sit behind the parental gate.</li>
        </ul>
      </section>
    </div>
  );
}
