// Guarded service-worker registration for production only.
// Never registers in dev, Lovable preview, or iframes.

function shouldRegister(): boolean {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator)) return false;
  if (!import.meta.env.PROD) return false;
  // In the packaged iOS/Android app every asset already ships with the app.
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  if (cap?.isNativePlatform?.()) return false;

  const hostname = window.location.hostname;
  const search = window.location.search;

  if (window.self !== window.top) return false;
  if (hostname.startsWith("id-preview--") || hostname.startsWith("preview--")) return false;
  if (hostname === "lovableproject.com" || hostname.endsWith(".lovableproject.com")) return false;
  if (hostname === "lovableproject-dev.com" || hostname.endsWith(".lovableproject-dev.com")) return false;
  if (hostname === "beta.lovable.dev" || hostname.endsWith(".beta.lovable.dev")) return false;
  if (search.includes("sw=off")) return false;

  return true;
}

async function unregisterStaleSw(scope: string) {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations
      .filter((r) => r.scope?.endsWith(scope))
      .map((r) => r.unregister())
  );
}

export async function registerPWA() {
  if (!shouldRegister()) {
    await unregisterStaleSw("/");
    return;
  }

  try {
    const { registerSW } = await import("virtual:pwa-register");
    registerSW({
      immediate: true,
      onRegistered(r: ServiceWorkerRegistration | undefined) {
        if (r) {
          console.log("[Totland] Service worker registered");
        }
      },
      onRegisterError(error: Error) {
        console.error("[Totland] Service worker registration failed", error);
      },
    });
  } catch (error) {
    console.error("[Totland] Failed to load PWA registration module", error);
  }
}

