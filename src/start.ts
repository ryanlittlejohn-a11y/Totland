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

const errorMiddleware = createMiddleware().server(async ({ next, request }) => {
  if (isLovableRoute(request)) return next();
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
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
    "access-control-allow-headers": "authorization,content-type,x-tsr-redirect,accept",
    "access-control-max-age": "86400",
    vary: "origin",
  };

  if (request?.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const response = await next();
  const res = response instanceof Response ? response : (response as { response?: Response })?.response;
  if (res instanceof Response) {
    for (const [key, value] of Object.entries(corsHeaders)) res.headers.set(key, value);
  }
  return response;
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
  requestMiddleware: [errorMiddleware, nativeCorsMiddleware, csrfMiddleware],
}));
