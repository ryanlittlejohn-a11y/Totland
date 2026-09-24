import { useEffect, type ReactNode } from "react";

import { hydrateStorage, markStorageSettled } from "@/lib/storage";
import { isNativeApp } from "@/lib/native";

const SAFETY_MS = 4500;

/**
 * The first render is identical everywhere (matches the pre-built page), so
 * React keeps it instead of redrawing. In the packaged app, native storage is
 * then loaded while the splash screen still covers the screen, and every
 * screen re-reads the profile once it settles. A safety timer guarantees it
 * settles even if native storage never answers (web storage holds a copy of
 * every write). On the web it settles immediately.
 */
export function StorageBoot({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!isNativeApp()) {
      markStorageSettled();
      return;
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      markStorageSettled();
    };
    const timer = window.setTimeout(finish, SAFETY_MS);
    void hydrateStorage().finally(() => {
      window.clearTimeout(timer);
      finish();
    });
    return () => window.clearTimeout(timer);
  }, []);

  return <>{children}</>;
}
