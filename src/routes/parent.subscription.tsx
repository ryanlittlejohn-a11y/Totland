import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { AREAS } from "@/lib/content";
import { useProfile } from "@/lib/profile";
import { usePaddleCheckout, type PlanId } from "@/hooks/usePaddleCheckout";
import { useParentAuth } from "@/hooks/useParentAuth";
import { ParentAuthCard } from "@/components/ParentAuthCard";
import { getPaddleEnvironment } from "@/lib/paddle";
import { getMySubscription, type SubscriptionState } from "@/lib/subscription.functions";
import { deleteMyAccount } from "@/lib/account.functions";
import { supabase } from "@/integrations/supabase/client";
import { isNativeApp, nativePlatform } from "@/lib/native";
import { StorePurchasePanel } from "@/components/StorePurchasePanel";

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
  const native = isNativeApp();
  const storeName = nativePlatform() === "android" ? "Google Play" : "the App Store";

  const removeAccount = useServerFn(deleteMyAccount);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const doDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await removeAccount({ data: undefined });
      await supabase.auth.signOut();
      try {
        window.localStorage.removeItem("totland.family.v1");
      } catch {
        /* ignore */
      }
      update((p) => ({ ...p, premium: false }));
      setDeleted(true);
      setDeleting(false);
    } catch (e) {
      console.error(e);
      setDeleteError("We couldn't delete your account just now. Please check your connection and try again.");
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="px-1 font-ui text-2xl font-bold text-ink">Manage Subscription</h1>
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
                Your last payment didn't go through. Please update your payment details to keep premium.
              </p>
            )}
            {native ? (
              <p className="mt-2 text-inksoft">
                To switch plans or cancel, open your device settings and manage subscriptions in {storeName}.
                Canceling keeps premium until the end of your paid period.
              </p>
            ) : (
              <p className="mt-2 text-inksoft">
                To switch plans, update your card, or cancel, visit{" "}
                <a href="https://paddle.net" target="_blank" rel="noopener noreferrer" className="underline">
                  paddle.net
                </a>{" "}
                with the email you used at checkout. Canceling keeps premium until the end of your paid period.
              </p>
            )}
          </div>
        ) : native ? (
          <StorePurchasePanel userId={user.id} onEntitlementChanged={() => void waitForActivation()} />
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
          <li>✈️ Play anywhere, even with no internet — offline play is part of Premium</li>
          <li>🎁 New content every month, downloaded for offline play</li>
        </ul>
      </section>

      {deleted ? (
        <section className="rounded-3xl bg-card p-5 wood-block">
          <h2 className="font-ui text-lg font-bold text-ink">Your account has been deleted</h2>
          <p className="mt-2 text-sm text-inksoft">
            Your grown-up account, child profiles and subscription record have been permanently removed. Totland still
            works on this device with the free activities.
          </p>
          <Link to="/" className="mt-3 inline-block rounded-xl bg-night px-4 py-2 font-ui text-sm font-bold text-cream">
            Back to play
          </Link>
        </section>
      ) : ready && !user ? (
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

            <div className="mt-5 border-t border-border pt-4">
              <h3 className="font-ui text-sm font-bold text-clay">Delete account</h3>
              <p className="mt-2 text-xs text-inksoft">
                This permanently removes your grown-up account, every child profile saved to it, and your subscription
                record. It cannot be undone.
              </p>
              {active && (
                <p className="mt-2 text-xs text-clay">
                  You have an active subscription. Deleting your account does not cancel billing — cancel first
                  {native ? ` in ${storeName} from your device settings` : " at paddle.net with your checkout email"}.
                </p>
              )}

              {!confirmOpen ? (
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="mt-3 rounded-xl bg-clay/15 px-4 py-2 font-ui text-sm font-bold text-clay"
                >
                  Delete my account
                </button>
              ) : (
                <div className="mt-3">
                  <label htmlFor="confirm-delete" className="block text-xs font-semibold text-ink">
                    Type DELETE to confirm
                  </label>
                  <input
                    id="confirm-delete"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="mt-1 w-full rounded-xl bg-felt px-4 py-3 text-ink outline-none ring-1 ring-black/5 focus:ring-clay"
                  />
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={confirmText.trim().toUpperCase() !== "DELETE" || deleting}
                      onClick={() => void doDelete()}
                      className="rounded-xl bg-clay px-4 py-2 font-ui text-sm font-bold text-primary-foreground disabled:opacity-50"
                    >
                      {deleting ? "Deleting…" : "Permanently delete"}
                    </button>
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={() => {
                        setConfirmOpen(false);
                        setConfirmText("");
                        setDeleteError(null);
                      }}
                      className="rounded-xl bg-felt px-4 py-2 font-ui text-sm font-semibold text-ink"
                    >
                      Cancel
                    </button>
                  </div>
                  {deleteError && <p className="mt-2 text-xs text-clay">{deleteError}</p>}
                </div>
              )}
            </div>
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

      <footer className="flex flex-wrap gap-4 pb-6 text-sm text-inksoft">
        <Link to="/terms" className="underline hover:text-ink">Terms &amp; Conditions</Link>
        <Link to="/refund" className="underline hover:text-ink">Refund Policy</Link>
        <Link to="/privacy" className="underline hover:text-ink">Privacy Notice</Link>
      </footer>
    </div>
  );
}
