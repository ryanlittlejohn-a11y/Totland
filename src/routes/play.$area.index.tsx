import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { GAMES, type AgeMode } from "@/lib/catalog";
import { AREAS } from "@/lib/content";
import { useProfile } from "@/lib/profile";
import { L, title as tTitle } from "@/lib/i18n";

export const Route = createFileRoute("/play/$area/")({
  component: AreaGamesPage,
});

function AreaGamesPage() {
  const { area } = useParams({ from: "/play/$area/" });
  const { profile } = useProfile();
  const [showAll, setShowAll] = useState(false);
  const meta = AREAS.find((a) => a.id === area) ?? AREAS[0]!;
  const mode: AgeMode = profile.ageMode ?? (profile.age <= 3 ? "explorer" : profile.age <= 4 ? "learner" : "reader");
  const all = GAMES.filter((g) => g.skill === meta.id);
  const forMode = all.filter((g) => g.ageModes.includes(mode));
  const games = showAll ? all : forMode;
  const hidden = all.length - forMode.length;

  return (
    <main className="mx-auto w-full max-w-md px-4 py-6">
      <div className="flex items-center gap-3">
        <Link to="/" className="grid size-12 place-items-center rounded-2xl bg-card text-xl wood-block" aria-label={L("Back home", "Volver al inicio")}>
          ‹
        </Link>
        <h1 className="font-ui text-2xl font-bold text-ink">
          {meta.emoji} {tTitle(meta.title)}
        </h1>
      </div>
      <p className="mt-2 font-ui text-sm text-inksoft">
        {showAll
          ? L(`${games.length} games for all ages`, `${games.length} juegos para todas las edades`)
          : L(`${games.length} games for ${mode} mode`, `${games.length} juegos para el modo ${tTitle(mode.charAt(0).toUpperCase() + mode.slice(1))}`)}
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
        {all.length === 0 && (
          <Link
            to="/play/$area/quick"
            params={{ area: meta.id }}
            className="rounded-3xl bg-card p-4 wood-block active:translate-y-1"
          >
            <span className="block text-4xl">{meta.emoji}</span>
            <span className="mt-2 block font-ui text-base font-bold leading-tight text-ink">{tTitle(meta.title)}</span>
            <span className="mt-1 block font-ui text-xs text-inksoft">{tTitle(meta.blurb)}</span>
          </Link>
        )}
      </div>

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-4 w-full rounded-2xl bg-card py-3 font-ui text-sm font-bold text-ink wood-block"
        >
          {showAll ? L("Show games for my age", "Ver juegos para mi edad") : L(`Show all ages (+${hidden})`, `Ver todas las edades (+${hidden})`)}
        </button>
      )}
    </main>
  );
}
