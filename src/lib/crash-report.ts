/** Quiet diagnostics for the packaged app.
 *  Reports crashes, rejected promises and long freezes of the touch-handling
 *  thread so we can see what a real device did. No personal data is sent. */
import { apiOrigin, isNativeApp, nativePlatform } from "./native";

let installed = false;
let sent = 0;
const MAX_REPORTS = 12;

type Report = {
  kind: "error" | "rejection" | "freeze";
  message: string;
  stack?: string | undefined;
  path: string;
  platform: string;
};

function post(report: Report) {
  if (sent >= MAX_REPORTS) return;
  sent += 1;
  const url = isNativeApp() ? `${apiOrigin()}/api/public/diag` : "/api/public/diag";
  try {
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
      keepalive: true,
    }).catch(() => {
      /* diagnostics are best-effort */
    });
  } catch {
    /* ignore */
  }
}

function base(kind: Report["kind"], message: string, stack?: string): Report {
  return {
    kind,
    message: String(message).slice(0, 500),
    stack: stack ? String(stack).slice(0, 1500) : undefined,
    path: typeof location === "undefined" ? "" : location.pathname,
    platform: nativePlatform(),
  };
}

export function installCrashReporting() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (e) => {
    post(base("error", e.message || "script error", e.error?.stack));
  });

  window.addEventListener("unhandledrejection", (e) => {
    const reason = e.reason as { message?: string; stack?: string } | string | undefined;
    const message = typeof reason === "string" ? reason : reason?.message || "unhandled rejection";
    post(base("rejection", message, typeof reason === "object" ? reason?.stack : undefined));
  });

  // A task that holds the thread for seconds is exactly what "frozen but still
  // animating" looks like to a child.
  try {
    const Observer = (window as unknown as { PerformanceObserver?: typeof PerformanceObserver })
      .PerformanceObserver;
    if (Observer) {
      const observer = new Observer((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration >= 3000) {
            post(base("freeze", `main thread blocked ${Math.round(entry.duration)}ms`));
          }
        }
      });
      observer.observe({ entryTypes: ["longtask"] });
    }
  } catch {
    /* long-task reporting is unavailable on some devices */
  }

  installWatchdog();
}

/** A steady heartbeat. If it misses many beats the screen was stuck, so we
 *  report the gap and — in the packaged app — quietly reload once so a child
 *  is not left tapping a frozen picture. */
function installWatchdog() {
  const BEAT = 2000;
  const STUCK = 15000;
  let last = Date.now();
  let recovered = false;

  window.setInterval(() => {
    const now = Date.now();
    const gap = now - last;
    last = now;
    if (document.visibilityState !== "visible") return;
    if (gap < STUCK) return;
    post(base("freeze", `screen stuck for ${Math.round(gap)}ms`));
    if (isNativeApp() && !recovered) {
      recovered = true;
      window.setTimeout(() => window.location.reload(), 500);
    }
  }, BEAT);

  document.addEventListener("visibilitychange", () => {
    last = Date.now();
  });
}
