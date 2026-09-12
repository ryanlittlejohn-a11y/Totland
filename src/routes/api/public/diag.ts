import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { NATIVE_WEBVIEW_ORIGINS } from "@/lib/native";

/** Receives anonymous crash / freeze reports from the packaged app so the
 *  device's behaviour shows up in the server logs. No personal data, no
 *  storage — the report is logged and dropped. */
const schema = z.object({
  kind: z.enum(["error", "rejection", "freeze"]),
  message: z.string().max(500),
  stack: z.string().max(1500).optional(),
  path: z.string().max(200).default(""),
  platform: z.string().max(20).default("web"),
});

function cors(origin: string | null): Record<string, string> {
  const allowed = origin && NATIVE_WEBVIEW_ORIGINS.includes(origin) ? origin : "";
  return allowed
    ? {
        "Access-Control-Allow-Origin": allowed,
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      }
    : {};
}

export const Route = createFileRoute("/api/public/diag")({
  server: {
    handlers: {
      OPTIONS: ({ request }) =>
        new Response(null, { status: 204, headers: cors(request.headers.get("origin")) }),
      POST: async ({ request }) => {
        const headers = cors(request.headers.get("origin"));
        try {
          const parsed = schema.parse(await request.json());
          console.log(
            `[totland-diag] ${parsed.platform} ${parsed.kind} at ${parsed.path}: ${parsed.message}` +
              (parsed.stack ? `\n${parsed.stack}` : ""),
          );
        } catch {
          return new Response("bad report", { status: 400, headers });
        }
        return new Response("ok", { headers });
      },
    },
  },
});
