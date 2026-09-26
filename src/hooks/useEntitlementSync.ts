import { signOutLocal } from "@/lib/signout-log";
import { hasVerifiedSession } from "@/lib/verifiedSession";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";

import { supabase } from "@/integrations/supabase/client";
import { setVerifiedPremiumSettled } from "@/lib/profile";
import { getPaddleEnvironment } from "@/lib/paddle";
import { getMySubscription } from "@/lib/subscription.functions";
import { setVerifiedPremium } from "@/lib/profile";
import { isNativeApp, withTimeout } from "@/lib/native";
import {
  configurePurchases,
  logInPurchases,
  logOutPurchases,
  storeEntitlementActive,
  storePurchasesAvailable,
} from "@/lib/purchases";

/**
 * Sets the in-memory, verified `premium` flag (never read from storage).
 *
 * On the web, premium is whatever the backend says for the signed-in parent,
 * so editing localStorage only "works" until the next time the app can reach
 * the backend, and a signed-out browser is never premium.
 *
 * In the packaged app an account is optional: premium is true when either the
 * store (via RevenueCat's cached customer info, which works offline and while
 * signed out) or the server-verified subscription says so.
 */
export function useEntitlementSync() {
  const fetchSubscription = useServerFn(getMySubscription);

  useEffect(() => {
    let cancelled = false;
    const native = isNativeApp();

    const setPremium = (value: boolean) => {
      if (cancelled) return;
      setVerifiedPremium(value);
    };

    /** Store entitlement, cached on the device — safe offline. */
    const storePremium = async () => {
      if (!native || !storePurchasesAvailable()) return false;
      try {
        const ok = await withTimeout(configurePurchases().then(() => true), 5000, false, "RevenueCat configure");
        if (!ok) return false;
        return await withTimeout(storeEntitlementActive(), 5000, false, "RevenueCat entitlement");
      } catch {
        return false;
      }
    };

    const verify = async () => {
      const offline = typeof navigator !== "undefined" && navigator.onLine === false;
      const fromStore = await storePremium();
      // First answer is in: the offline gate may now decide.
      setVerifiedPremiumSettled();
      if (fromStore) {
        setPremium(true);
        return;
      }
      // Offline: keep the last verified answer rather than revoking access.
      if (offline) return;

      try {
        if (!(await hasVerifiedSession())) {
          setPremium(false);
          return;
        }
        const state = await fetchSubscription({ data: { environment: getPaddleEnvironment() } });
        setPremium(state.active);
      } catch (err) {
        if (err instanceof Error && /unauthorized|invalid token/i.test(err.message)) {
          await signOutLocal("premium-check", err.message);
          setPremium(false);
        }
        // Network or backend hiccup: keep the last verified answer.
      }
    };

    void verify();
    window.addEventListener("online", verify);
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        // Link any anonymous store purchase to the account that just signed in.
        const id = session?.user?.id;
        if (native && id) void logInPurchases(id).finally(() => void verify());
        else void verify();
      } else if (event === "SIGNED_OUT") {
        if (native) void logOutPurchases().finally(() => void verify());
        else void verify();
      }
    });

    return () => {
      cancelled = true;
      window.removeEventListener("online", verify);
      sub.subscription.unsubscribe();
    };
  }, [fetchSubscription]);
}
