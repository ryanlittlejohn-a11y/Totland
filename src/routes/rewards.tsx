import { createFileRoute, Link } from "@tanstack/react-router";
import { STICKERS } from "@/lib/content";
import { useProfile } from "@/lib/profile";
import { L } from "@/lib/i18n";

export const Route = createFileRoute("/rewards")({
  head: () => ({
    meta: [
      { title: "Sticker Shelf — Totland" },
      { name: "description", content: "Stars, stickers and badges your child has collected by learning. No purchases, no loot boxes." },
      { property: "og:title", content: "Sticker Shelf — Totland" },
      { property: "og:description", content: "Collect stickers and stars by learning — rewards that never cost money." },
    ],
  }),
  component: Rewards,
});

const BADGES = [
  { id: "first", label: L("First game", "Primer juego"), emoji: "🎉", test: (games: number) => games >= 1 },
  { id: "five", label: L("5 games", "5 juegos"), emoji: "🖐️", test: (games: number) => games >= 5 },
  { id: "twenty", label: L("20 games", "20 juegos"), emoji: "🏅", test: (games: number) => games >= 20 },
  { id: "fifty", label: L("50 games", "50 juegos"), emoji: "🏆", test: (games: number) => games >= 50 },
];

function Rewards() {
  const { profile } = useProfile();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col px-4 pb-10 pt-4">
      <div className="flex items-center gap-3">
        <Link to="/" aria-label={L("Back to the map", "Volver al mapa")} className="grid size-14 place-items-center rounded-2xl bg-card text-2xl wood-block">
          🏠
        </Link>
        <h1 className="font-ui text-2xl font-bold text-ink">{L("Sticker Shelf", "Estante de calcomanías")}</h1>
        <span className="ml-auto flex items-center gap-1.5 rounded-full bg-card px-3 py-2 font-ui font-bold wood-block">
          <span className="text-amber">★</span>
          {profile.stars}
        </span>
      </div>

      <section className="mt-5 rounded-[2rem] felt-panel p-4">
        <p className="px-1 font-ui text-[13px] font-semibold uppercase tracking-[0.14em] text-inksoft">
          {L(`Stickers · ${profile.stickers.length} of ${STICKERS.length}`, `Calcomanías · ${profile.stickers.length} de ${STICKERS.length}`)}
        </p>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {STICKERS.map((s) => {
            const owned = profile.stickers.includes(s);
            return (
              <div
                key={s}
                className={`grid aspect-square place-items-center rounded-2xl text-2xl ${
                  owned ? "bg-card wood-block" : "border border-dashed border-wood bg-felt/50 text-inksoft/40"
                }`}
              >
                {owned ? s : "?"}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-5 rounded-[2rem] felt-panel p-4">
        <p className="px-1 font-ui text-[13px] font-semibold uppercase tracking-[0.14em] text-inksoft">{L("Badges", "Insignias")}</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {BADGES.map((b) => {
            const earned = b.test(profile.gamesCompleted);
            return (
              <div
                key={b.id}
                className={`flex items-center gap-3 rounded-2xl p-3 ${earned ? "bg-card wood-block" : "bg-felt/60 opacity-60"}`}
              >
                <span className="text-3xl">{b.emoji}</span>
                <p className="font-ui font-bold text-ink">{b.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      <Link
        to="/adventure"
        className="mt-6 rounded-3xl bg-clay py-4 text-center font-ui text-xl font-bold text-primary-foreground wood-block"
      >
        {L("Earn more stickers", "Gana más calcomanías")}
      </Link>
    </main>
  );
}
