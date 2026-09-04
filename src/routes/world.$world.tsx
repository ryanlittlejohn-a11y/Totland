import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { WORLDS, gamesInWorld, type WorldId } from "@/lib/catalog";
import { useProfile } from "@/lib/profile";
import { activeMode } from "@/lib/mastery";

export const Route = createFileRoute("/world/$world")({
  head: () => ({
    meta: [
      { title: "Choose a game — Totland" },
      { name: "description", content: "Pick a short learning game from this Totland world — letters, numbers, colors, puzzles or stories." },
      { property: "og:title", content: "Choose a game — Totland" },
      { property: "og:description", content: "Playful, spoken learning activities for ages 2–6." },
    ],
  }),
  component: WorldPage,
});

function WorldPage() {
  const { world } = useParams({ from: "/world/$world" });
  const { profile } = useProfile();
  const meta = WORLDS.find((w) => w.id === (world as WorldId)) ?? WORLDS[0]!;
  const mode = activeMode(profile);
  const games = gamesInWorld(meta.id);
  const suited = games.filter((g) => g.modes.includes(mode));
  const list = suited.length ? suited : games;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[520px] px-4 pb-10 pt-4">
      <div className="flex items-center gap-3">
        <Link to="/worlds" aria-label="Back to the map" className="grid size-14 place-items-center rounded-2xl bg-card text-2xl wood-block">
          🗺️
        </Link>
        <div>
          <p className="font-ui text-[13px] font-semibold uppercase tracking-[0.14em] text-inksoft">{meta.blurb}</p>
          <h1 className="font-ui text-2xl font-bold leading-tight text-ink">
            {meta.emoji} {meta.title}
          </h1>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {list.map((g) => {
          const locked = g.premium && !profile.premium;
          return (
            <Link
              key={g.id}
              to="/game/$id"
              params={{ id: g.id }}
              className="rounded-[1.5rem] bg-card p-3 wood-block active:translate-y-1"
            >
              <span className="grid h-20 place-items-center rounded-2xl bg-felt text-4xl">
                {locked ? "🔐" : g.emoji}
              </span>
              <p className="mt-2 font-ui text-[15px] font-bold leading-tight text-ink">{g.title}</p>
              <p className="font-ui text-xs text-inksoft">
                {g.minutes} min · {locked ? "Ask a grown-up" : g.objective}
              </p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
