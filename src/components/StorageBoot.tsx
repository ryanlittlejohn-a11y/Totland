import { useEffect, useState, type ReactNode } from "react";

import { hydrateStorage } from "@/lib/storage";
import { isNativeApp } from "@/lib/native";

/**
 * In the packaged app, progress lives in native storage. Load it before the
 * first screen renders so the very first read already sees the real profile.
 * On the web this renders its children straight away and does nothing else.
 */
export function StorageBoot({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(() => !isNativeApp());

  useEffect(() => {
    if (ready) return;
    let cancelled = false;
    void hydrateStorage().finally(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [ready]);

  if (!ready) return null;
  return <>{children}</>;
}
