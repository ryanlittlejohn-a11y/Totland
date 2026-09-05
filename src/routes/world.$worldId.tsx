import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { GAMES, WORLDS, type AgeMode, type WorldId } from "@/lib/catalog";
import { useProfile } from "@/lib/profile";
import { L, title as tTitle } from "@/lib/i18n";

export const Route = createFileRoute("/world/$worldId")({
  head: () => ({
    meta: [
      { title: "World games — Totland" },
      { name: "description", content: "Every learning game inside this Totland world, matched to your child's age mode." },
      { property: "og:title", content: "World games — Totland" },
      { property: "og:description", content: "Browse and play the games in this Totland learning world." },
    ],
  }),
  component: WorldPage,
});

function WorldPage() {
  const { worldId } = useParams({ from: "/world/$worldId" });
  const { profile } = useProfile();
  const world = WORLDS.find((w) => w.id === (worldId as WorldId)) ?? WORLDS[0]!;
  const mode: AgeMode = profile.ageMode ?? (profile.age <= 3 ? "explorer" : profile.age <= 4 ? "learner" : "reader");
  const games = GAMES.filter((g) => g.world === world.id && g.ageModes.includes(mode));

  return (
    <main className="mx-auto w-full max-w-md px-4 py-6">
      <div className="flex items-center gap-3">
        <Link to="/worlds" className="grid size-12 place-items-center rounded-2xl bg-card text-xl wood-block" aria-label={L("Back to worlds", "Volver a los mundos")}>
          ‹
        </Link>
        <h1 className="font-ui text-2xl font-bold text-ink">
          {world.emoji} {tTitle(world.title)}
        </h1>
      </div>
      <p className="mt-2 font-ui text-sm text-inksoft">
        {L(`${games.length} games for ${mode} mode`, `${games.length} juegos para el modo ${tTitle(mode.charAt(0).toUpperCase() + mode.slice(1))}`)}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {games.map((g) => {
          const stat = profile.games[g.id];
          const locked = g.premium && !profile.premium;
          return (
            <Link
              key={g.id}
              to="/game/$gameId"
              params={{ gameId: g.id }}
              className="rounded-3xl bg-card p-4 wood-block active:translate-y-1"
            >
              <span className="block text-4xl">{locked ? "🔒" : g.emoji}</span>
              <span className="mt-2 block font-ui text-base font-bold leading-tight text-ink">{tTitle(g.title)}</span>
              <span className="mt-1 block font-ui text-xs text-inksoft">
                {stat ? L(`${stat.plays} plays · ${stat.stars}★`, `${stat.plays} partidas · ${stat.stars}★`) : `${g.minutes} min`}
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
