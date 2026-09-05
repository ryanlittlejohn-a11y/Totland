import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";

import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";
import { getMySubscription } from "@/lib/subscription.functions";
import { loadProfile, saveProfile } from "@/lib/profile";

/**
 * Whenever the device is online, the locally cached `premium` flag is replaced
 * with the server-verified answer. Editing localStorage therefore only ever
 * "works" until the next time the app can reach the backend, and a signed-out
 * device is never treated as premium.
 *
 * Offline play keeps working from the last verified answer, which is the
 * point of the cache.
 */
export function useEntitlementSync() {
  const fetchSubscription = useServerFn(getMySubscription);

  useEffect(() => {
    let cancelled = false;

    const setPremium = (value: boolean) => {
      if (cancelled) return;
      const profile = loadProfile();
      if (profile.premium === value) return;
      saveProfile({ ...profile, premium: value });
    };

    const verify = async () => {
      if (typeof navigator !== "undefined" && navigator.onLine === false) return;
      try {
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;
        if (!user || !user.email_confirmed_at) {
          setPremium(false);
          return;
        }
        const state = await fetchSubscription({ data: { environment: getPaddleEnvironment() } });
        setPremium(state.active);
      } catch {
        // Network or backend hiccup: keep the last verified answer.
      }
    };

    void verify();
    window.addEventListener("online", verify);
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") void verify();
    });

    return () => {
      cancelled = true;
      window.removeEventListener("online", verify);
      sub.subscription.unsubscribe();
    };
  }, [fetchSubscription]);
}
