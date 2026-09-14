import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/.well-known/apple-app-site-association")({
  server: {
    handlers: {
      GET: async () => {
        const teamId = process.env["APPLE_DEVELOPER_TEAM_ID"]?.trim();
        if (!teamId) {
          return Response.json(
            { error: "App Clip association is awaiting the Apple Developer Team ID." },
            { status: 503, headers: { "Cache-Control": "no-store" } },
          );
        }

        const appId = `${teamId}.App.totland.kids`;
        const clipId = `${teamId}.App.totland.kids.Clip`;
        return Response.json(
          {
            appclips: { apps: [clipId] },
            applinks: {
              apps: [],
              details: [{ appIDs: [appId, clipId], components: [{ "/": "/appclip*" }] }],
            },
          },
          {
            headers: {
              "Cache-Control": "public, max-age=3600",
              "Content-Type": "application/json",
            },
          },
        );
      },
    },
  },
});