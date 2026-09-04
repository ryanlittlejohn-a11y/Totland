import { createFileRoute, Link } from "@tanstack/react-router";
import { WORLDS, gamesInWorld } from "@/lib/catalog";
import { skillOf, useProfile } from "@/lib/profile";
import { recommendedGames } from "@/lib/mastery";

export const Route = createFileRoute("/worlds")({
  head: () => ({
    meta: [
      { title: "Learning Worlds — Totland" },
      {
        name: "description",
        content: "Five playful worlds: Alphabet Forest, Number Valley, Color Cove, Puzzle Park and Storybook Village.",
      },
      { property: "og:title", content: "Learning Worlds — Totland" },
      { property: "og:description", content: "Explore five worlds of toddler learning games, offline and ad-free." },
    ],
  }),
  component: WorldsPage,
});

const TINT: Record<string, string> = {
  clay: "bg-clay/20",
  amber: "bg-amber/25",
  moss: "bg-moss/20",
  sky: "bg-sky/20",
  plum: "bg-plum/20",
  wood: "bg-wood/30",
};

function WorldsPage() {
  const { profile } = useProfile();
  const next = recommendedGames(profile, 1)[0];

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[520px] px-4 pb-10 pt-4">
      <div className="flex items-center gap-3">
        <Link to="/" aria-label="Back home" className="grid size-14 place-items-center rounded-2xl bg-card text-2xl wood-block">
          🏠
        </Link>
        <div>
          <p className="font-ui text-[13px] font-semibold uppercase tracking-[0.14em] text-inksoft">World map</p>
          <h1 className="font-ui text-2xl font-bold leading-tight text-ink">Where shall we play?</h1>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {WORLDS.map((w) => {
          const games = gamesInWorld(w.id);
          const unlocked = games.filter((g) => !g.premium || profile.premium).length;
          const stat = skillOf(profile, games[0]!.skill);
          const played = Math.min(100, Math.round((stat.attempts / 20) * 100));
          return (
            <Link
              key={w.id}
              to="/world/$world"
              params={{ world: w.id }}
              className={`block rounded-[1.75rem] ${TINT[w.tint]} bg-card p-4 wood-block active:translate-y-1`}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-card text-3xl anim-bob">{w.emoji}</span>
                <div className="flex-1">
                  <p className="font-ui text-xl font-bold leading-tight text-ink">{w.title}</p>
                  <p className="font-ui text-sm text-inksoft">
                    {w.blurb} · {unlocked} of {games.length} open
                  </p>
                  <div className="mt-2 h-2 rounded-full bg-felt">
                    <div className="h-2 rounded-full bg-moss" style={{ width: `${played}%` }} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {next && (
        <div className="mt-6 rounded-[1.75rem] felt-panel p-4">
          <p className="font-ui text-[13px] font-semibold uppercase tracking-[0.14em] text-inksoft">Next up for you</p>
          <Link
            to="/game/$id"
            params={{ id: next.id }}
            className="mt-3 flex items-center gap-3 rounded-3xl bg-clay p-3 wood-block active:translate-y-1"
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-card text-2xl">{next.emoji}</span>
            <span className="font-ui text-lg font-bold text-primary-foreground">{next.title}</span>
          </Link>
        </div>
      )}
    </main>
  );
}
