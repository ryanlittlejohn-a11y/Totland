import { createFileRoute, Link } from "@tanstack/react-router";
import { GAMES, WORLDS } from "@/lib/catalog";
import { useProfile } from "@/lib/profile";

export const Route = createFileRoute("/worlds")({
  head: () => ({
    meta: [
      { title: "Learning Worlds — Totland" },
      {
        name: "description",
        content: "Five playful worlds — Alphabet Forest, Number Valley, Color Cove, Puzzle Park and Storybook Village — with 100 learning games.",
      },
      { property: "og:title", content: "Learning Worlds — Totland" },
      { property: "og:description", content: "Choose a world and play 100 original toddler learning games." },
    ],
  }),
  component: WorldsPage,
});

function WorldsPage() {
  const { profile } = useProfile();

  return (
    <main className="mx-auto w-full max-w-md px-4 py-6">
      <h1 className="font-ui text-3xl font-bold text-ink">Pick a world</h1>
      <p className="mt-1 font-ui text-sm text-inksoft">100 games to play — no timers, no rush.</p>

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
                <span className="block font-ui text-xl font-bold text-ink">{w.title}</span>
                <span className="block font-ui text-sm text-inksoft">
                  {w.blurb} · {played}/{games.length} played
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
        🏠 Home
      </Link>
    </main>
  );
}
