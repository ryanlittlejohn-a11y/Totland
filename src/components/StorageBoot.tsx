import { useEffect, useState, type ReactNode } from "react";

import { hydrateStorage } from "@/lib/storage";
import { isNativeApp } from "@/lib/native";
import { diagStep } from "@/lib/diag-overlay";

const SAFETY_MS = 4500;

/**
 * In the packaged app, progress lives in native storage. Load it before the
 * first screen renders so the very first read already sees the real profile.
 * A safety timer guarantees the app appears even if native storage never
 * answers (it then keeps using web storage, which holds a copy of every write).
 * On the web this renders its children with no waiting.
 */
export function StorageBoot({ children }: { children: ReactNode }) {
  // Same initial value on server and client so the prerendered shell is kept.
  const [ready, setReady] = useState(true);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    if (!isNativeApp()) return;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setWaiting(false);
      setReady(true);
    };
    setWaiting(true);
    setReady(false);
    diagStep("storage boot start");
    const timer = window.setTimeout(() => {
      diagStep("storage boot safety timer fired");
      finish();
    }, SAFETY_MS);
    void hydrateStorage().finally(() => {
      window.clearTimeout(timer);
      finish();
    });
    return () => {
      done = true;
      window.clearTimeout(timer);
    };
  }, []);

  if (!ready && waiting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" aria-busy="true">
        <span className="text-5xl" aria-hidden="true">🦊</span>
      </div>
    );
  }
  return <>{children}</>;
}
