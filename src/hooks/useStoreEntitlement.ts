import { useCallback, useEffect, useState } from "react";

import { isNativeApp } from "@/lib/native";
import { configurePurchases, getStoreEntitlementState, storePurchasesAvailable } from "@/lib/purchases";

/**
 * Premium as reported by Apple's / Google's store through RevenueCat.
 *
 * This works while signed out and while offline (RevenueCat keeps the last
 * customer info on the device), which is what lets a grown-up buy Premium in
 * the packaged app without being asked to create an account.
 *
 * On the web this hook always reports false and does nothing.
 */
export function useStoreEntitlement(userId?: string | null) {
  const [storeActive, setStoreActive] = useState(false);
  const [managementURL, setManagementURL] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!storePurchasesAvailable()) return false;
    try {
      await configurePurchases(userId ?? undefined);
      const state = await getStoreEntitlementState();
      setStoreActive(state.active);
      setManagementURL(state.managementURL);
      return state.active;
    } catch (e) {
      console.error(e);
      return false;
    }
  }, [userId]);

  useEffect(() => {
    if (!isNativeApp()) return;
    let cancelled = false;

    const run = () => {
      void refresh().then((active) => {
        if (cancelled) return;
        setStoreActive(active);
      });
    };

    run();
    const onVisible = () => {
      if (document.visibilityState === "visible") run();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  return { storeActive, managementURL, refresh };
}
