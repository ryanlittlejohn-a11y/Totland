import { redirect } from "@tanstack/react-router";
import { isNativeApp } from "@/lib/native";

/**
 * Adult-facing, website-only pages. Inside the packaged iOS/Android app (Kids Category,
 * App Review 2.3.10) they redirect home. Use as `beforeLoad` in the route options.
 */
export function webOnlyBeforeLoad() {
  if (isNativeApp()) throw redirect({ to: "/", replace: true });
}

/** True inside the packaged app (a client-only SPA, so no hydration mismatch on the website). */
export const inNativeApp = () => isNativeApp();
