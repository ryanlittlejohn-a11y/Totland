import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

function isLovableRoute(request: Request | undefined): boolean {
  if (!request) return false;
  try {
    return new URL(request.url).pathname.startsWith("/lovable/");
  } catch {
    return false;
  }
}

/** A client that disconnects mid-render aborts the request; that's not an app error. */
function isClientAbort(error: unknown, request?: Request): boolean {
  if (request?.signal?.aborted) return true;
  let e: unknown = error;
  for (let i = 0; i < 3 && e; i++) {
    if (typeof e === "object" && (e as { name?: unknown }).name === "AbortError") return true;
    e = (e as { cause?: unknown }).cause;
  }
  return false;
}

const errorMiddleware = createMiddleware().server(async ({ next, request }) => {
  if (isLovableRoute(request)) return next();
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    if (isClientAbort(error, request)) return new Response(null, { status: 499 });
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// The packaged iOS/Android app runs from a local webview origin, so its calls
// to the hosted backend are cross-origin and need an explicit allow-list.
const NATIVE_ORIGINS = new Set([
  "capacitor://localhost",
  "ionic://localhost",
  "http://localhost",
  "https://localhost",
]);

function isNativeOrigin(origin: string | null | undefined): boolean {
  return Boolean(origin && NATIVE_ORIGINS.has(origin));
}

const nativeCorsMiddleware = createMiddleware().server(async ({ next, request }) => {
  if (isLovableRoute(request)) return next();
  const origin = request?.headers.get("origin");
  if (!isNativeOrigin(origin)) return next();

  const corsHeaders: Record<string, string> = {
    "access-control-allow-origin": origin!,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "authorization,content-type,x-tsr-redirect,x-tsr-serverfn,accept",
    "access-control-max-age": "86400",
    vary: "origin",
  };

  if (request?.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const withCors = (res: Response): Response => {
    try {
      for (const [key, value] of Object.entries(corsHeaders)) res.headers.set(key, value);
      return res;
    } catch {
      // Immutable headers: copy into a new response.
      const headers = new Headers(res.headers);
      for (const [key, value] of Object.entries(corsHeaders)) headers.set(key, value);
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
    }
  };

  // Error replies need the permission header too, otherwise the webview hides
  // the real status and the app can only report a network failure.
  let response: unknown;
  try {
    response = await next();
  } catch (error) {
    if (error instanceof Response) return withCors(error);
    if (error != null && typeof error === "object" && "statusCode" in error) throw error;
    if (isClientAbort(error, request)) return new Response(null, { status: 499 });
    console.error(error);
    return withCors(
      new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      }),
    );
  }
  if (response instanceof Response) return withCors(response);
  const inner = (response as { response?: Response })?.response;
  if (inner instanceof Response) withCors(inner);
  return response as Response;
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests. The native webview origins are trusted.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) =>
    ctx.handlerType === "serverFn" && !isNativeOrigin(ctx.request?.headers.get("origin")),
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  // nativeCors runs outermost so every reply to the app, including error pages
  // built by errorMiddleware, carries the permission header.
  requestMiddleware: [nativeCorsMiddleware, errorMiddleware, csrfMiddleware],
}));
