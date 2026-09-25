import { createFileRoute, Link } from "@tanstack/react-router";
import { GAMES, WORLDS } from "@/lib/catalog";
import { useProfile } from "@/lib/profile";
import { L, title as tTitle } from "@/lib/i18n";

export const Route = createFileRoute("/worlds")({
  head: () => ({
    meta: [
      { title: "Learning Worlds — Totland" },
      {
        name: "description",
        content: `Five playful worlds — Alphabet Forest, Number Valley, Color Cove, Puzzle Park and Storybook Village — with ${GAMES.length} learning games.`,
      },
      { property: "og:title", content: "Learning Worlds — Totland" },
      { property: "og:description", content: `Choose a world and play ${GAMES.length} original toddler learning games.` },
      { property: "og:url", content: "https://totland.app/worlds" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://totland.app/worlds" }],
  }),
  component: WorldsPage,
});

function WorldsPage() {
  const { profile } = useProfile();

  return (
    <main className="mx-auto w-full max-w-md px-4 py-6">
      <h1 className="font-ui text-3xl font-bold text-ink">{L("Pick a world", "Elige un mundo")}</h1>
      <p className="mt-1 font-ui text-sm text-inksoft">{L(`${GAMES.length} games to play — no timers, no rush.`, `${GAMES.length} juegos para jugar — sin reloj y sin prisa.`)}</p>

      <div className="mt-5 space-y-3">
        {WORLDS.map((w) => {
          const games = GAMES.filter((g) => g.world === w.id);
          const played = games.filter((g) => profile.games[g.id]).length;
          return (
            <Link
              key={w.id}
              to="/world/$worldId"
              params={{ worldId: w.id }}
              className="flex items-center gap-4 rounded-3xl bg-card p-4 wood-block active:translate-y-1"
            >
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-felt text-4xl">{w.emoji}</span>
              <span className="flex-1">
                <span className="block font-ui text-xl font-bold text-ink">{tTitle(w.title)}</span>
                <span className="block font-ui text-sm text-inksoft">
                  {tTitle(w.blurb)} · {L(`${played}/${games.length} played`, `${played}/${games.length} jugados`)}
                </span>
              </span>
              <span className="text-2xl text-inksoft" aria-hidden>
                ›
              </span>
            </Link>
          );
        })}
      </div>

      <Link
        to="/"
        className="mt-6 block rounded-2xl bg-felt py-3 text-center font-ui font-bold text-ink wood-block"
      >
        {L("🏠 Home", "🏠 Inicio")}
      </Link>
    </main>
  );
}
