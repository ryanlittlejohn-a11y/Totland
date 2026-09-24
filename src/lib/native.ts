/**
 * Helpers for the packaged iOS / Android build (Capacitor).
 * In a normal browser every function here reports "not native" and nothing
 * about the web app changes.
 */

const DEFAULT_API_ORIGIN = "https://totland.app";

/** Origins the native webview runs on. Kept in sync with the server CORS list. */
export const NATIVE_WEBVIEW_ORIGINS = [
  "capacitor://localhost",
  "ionic://localhost",
  "http://localhost",
  "https://localhost",
];

export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

export function nativePlatform(): "ios" | "android" | "web" {
  if (typeof window === "undefined") return "web";
  const cap = (window as unknown as { Capacitor?: { getPlatform?: () => string } }).Capacitor;
  const platform = cap?.getPlatform?.();
  return platform === "ios" || platform === "android" ? platform : "web";
}

/** Absolute origin of the hosted Totland backend used by the packaged app. */
export function apiOrigin(): string {
  const configured = import.meta.env["VITE_NATIVE_API_ORIGIN"] as string | undefined;
  return (configured || DEFAULT_API_ORIGIN).replace(/\/$/, "");
}

/** Paths that must always be answered by the hosted backend, never the bundle. */
export function isServerPath(pathname: string): boolean {
  return (
    pathname.startsWith("/_serverFn") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/~oauth")
  );
}

/** Resolve with `fallback` if `promise` has not settled within `ms`. */
export function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T, label = "step"): Promise<T> {
  return new Promise<T>((resolve) => {
    const timer = setTimeout(() => {
      console.error(`[totland] ${label} timed out after ${ms}ms`);
      resolve(fallback);
    }, ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        console.error(`[totland] ${label} failed`, e);
        resolve(fallback);
      },
    );
  });
}

/** True once the Capacitor bridge reports the named plugin as available. */
export function pluginReady(name: string): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { isPluginAvailable?: (n: string) => boolean } }).Capacitor;
  try {
    return cap?.isPluginAvailable ? Boolean(cap.isPluginAvailable(name)) : true;
  } catch {
    return false;
  }
}
