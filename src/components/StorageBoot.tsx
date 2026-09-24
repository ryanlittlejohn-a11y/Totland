import { useEffect, useState, type ReactNode } from "react";

import { hydrateStorage } from "@/lib/storage";
import { isNativeApp } from "@/lib/native";
import { diagRendered, diagStep } from "@/lib/diag-overlay";

const SAFETY_MS = 4500;

/**
 * In the packaged app, progress lives in native storage. Load it before the
 * first screen renders so the very first read already sees the real profile.
 * A safety timer guarantees the app appears even if native storage never
 * answers (it then keeps using web storage, which holds a copy of every write).
 * On the web this renders its children with no waiting.
 */
export function StorageBoot({ children }: { children: ReactNode }) {
  // Native starts on a simple loading picture (never a blank page) until
  // storage settles or the safety timer fires.
  const [ready, setReady] = useState(() => !isNativeApp());

  useEffect(() => {
    if (!isNativeApp()) return;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setReady(true);
    };
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

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" aria-busy="true">
        <span className="text-5xl" aria-hidden="true">🦊</span>
      </div>
    );
  }
  return <>{children}<FirstRenderMark /></>;
}

/** TEMPORARY: tells the diagnostic watchdog a real screen is up. */
function FirstRenderMark() {
  useEffect(() => {
    diagRendered();
  }, []);
  return null;
}
