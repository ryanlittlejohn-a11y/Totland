import { apiOrigin, isNativeApp, isServerPath } from "./native";

/**
 * Inside the packaged app there is no local server: the screens are bundled
 * with the app, so any request for a server function or API route has to be
 * sent to the hosted Totland backend instead. This patches fetch once, early,
 * so every existing call site keeps working unchanged.
 */
let installed = false;

export function installNativeApiBridge(): void {
  if (installed) return;
  if (typeof window === "undefined") return;
  if (!isNativeApp()) return;

  installed = true;
  const origin = apiOrigin();
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const request = input instanceof Request ? input : null;
      const rawUrl = request ? request.url : String(input);
      const url = new URL(rawUrl, window.location.href);
      const local = url.origin === window.location.origin;

      if (local && isServerPath(url.pathname)) {
        const target = `${origin}${url.pathname}${url.search}`;
        if (request) {
          return originalFetch(new Request(target, request), init);
        }
        return originalFetch(target, init);
      }
    } catch {
      // fall through to the untouched fetch
    }
    return originalFetch(input as RequestInfo, init);
  };
}

// Install as early as the module is imported so nothing can fire a server
// request before the rewrite is in place. No-op in a browser.
if (typeof window !== "undefined") {
  installNativeApiBridge();
}
