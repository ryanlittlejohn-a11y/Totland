import type { Router } from "@tanstack/react-router";
import { isNativeApp, withTimeout } from "./native";

/**
 * Small native-only touches: hide the splash screen once the app is up,
 * style the status bar, make the Android back button behave, and handle
 * deep links from RevenueCat / other services via the custom URL scheme.
 */
let started = false;

export function initNativeShell(router: Router<any, any>): void {
  if (started) return;
  if (!isNativeApp()) return;
  started = true;

  void (async () => {
    try {
      const { SplashScreen } = await import("@capacitor/splash-screen");
      await withTimeout(SplashScreen.hide(), 5000, undefined, "splash hide");
    } catch (e) {
      console.error(e);
    }

    try {
      const { StatusBar, Style } = await import("@capacitor/status-bar");
      await withTimeout(StatusBar.setStyle({ style: Style.Light }), 5000, undefined, "status bar");
    } catch {
      // status bar styling is unavailable on some devices; ignore
    }

    try {
      const { App } = await import("@capacitor/app");
      await App.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          void App.exitApp();
        }
      });

      await App.addListener("appUrlOpen", ({ url }) => {
        handleDeepLink(url, router);
      });
    } catch (e) {
      console.error(e);
    }
  })();
}

function handleDeepLink(url: string, router: Router<any, any>): void {
  try {
    const parsed = new URL(url);
    const scheme = parsed.protocol.replace(":", "");
    if (scheme !== "app.totland.kids") return;

    const host = parsed.hostname;
    const path = parsed.pathname.replace(/^\//, "");

    // Grown-up sign-in returning from the in-app browser sheet.
    if (host === "auth-callback" || path === "auth-callback") {
      void import("./native-oauth").then(({ completeNativeOAuth }) =>
        completeNativeOAuth(url).then(() => {
          const to: string = "/parent/subscription";
          void router.navigate({ to, replace: true });
        }),
      );
      return;
    }


    // RevenueCat win-back / promotional links can use app.totland.kids://premium
    // or app.totland.kids://subscription. Anything else lands at home.
    const target = host === "premium" || host === "subscription" || path === "premium" || path === "subscription"
      ? "/parent/subscription"
      : "/";

    void router.navigate({ to: target, replace: true });
  } catch {
    // malformed URL — ignore
  }
}
