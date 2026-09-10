import { isNativeApp } from "./native";

/**
 * Small native-only touches: hide the splash screen once the app is up,
 * style the status bar, and make the Android back button behave.
 */
let started = false;

export function initNativeShell(): void {
  if (started) return;
  if (!isNativeApp()) return;
  started = true;

  void (async () => {
    try {
      const { SplashScreen } = await import("@capacitor/splash-screen");
      await SplashScreen.hide();
    } catch (e) {
      console.error(e);
    }

    try {
      const { StatusBar, Style } = await import("@capacitor/status-bar");
      await StatusBar.setStyle({ style: Style.Light });
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
    } catch (e) {
      console.error(e);
    }
  })();
}
