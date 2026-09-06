import { createFileRoute, Link } from "@tanstack/react-router";
import { AREAS, CHARACTERS, LIBRARY_SIZE } from "@/lib/content";
import { GAMES, WORLDS, gameById } from "@/lib/catalog";
import { skillOf, useProfile } from "@/lib/profile";
import { InstallPrompt } from "@/components/InstallPrompt";
import { L, title as tTitle } from "@/lib/i18n";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Totland — Learning That Feels Like Play" },
      {
        name: "description",
        content:
          "A gentle, offline-first learning world for ages 2–6: ABCs, numbers, colors, shapes, first words, puzzles and storybooks. No ads, no tracking.",
      },
      { property: "og:title", content: "Totland — Learning That Feels Like Play" },
      {
        property: "og:description",
        content: "Hundreds of bite-sized learning games for toddlers and preschoolers. Offline, ad-free, privacy-first.",
      },
    ],
  }),
  component: Home,
});

const TINT: Record<string, string> = {
  clay: "bg-clay/20",
  amber: "bg-amber/25",
  moss: "bg-moss/20",
  sky: "bg-sky/20",
  plum: "bg-plum/20",
  wood: "bg-wood/30",
};

function Home() {
  const { profile } = useProfile();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col px-4 pb-10 pt-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid size-11 place-items-center rounded-2xl bg-clay font-ui text-xl font-bold text-primary-foreground wood-block">
            T
          </div>
          <div>
            <p className="font-ui text-[15px] font-bold leading-none text-ink">Totland</p>
            <p className="font-ui text-[11px] text-inksoft">{L("Learning that feels like play", "Aprender jugando")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-card px-3 py-2 font-ui text-sm font-bold text-ink wood-block">
            <span className="text-amber anim-twinkle">★</span>
            {profile.stars}
          </span>
          <Link
            to="/rewards"
            aria-label={L("Sticker shelf", "Estante de calcomanías")}
            className="grid size-11 place-items-center rounded-2xl bg-card text-xl wood-block"
          >
            🎁
          </Link>
        </div>
      </header>

      <section className="mt-5 rounded-[2rem] felt-panel p-4">
        <div className="flex items-center justify-between">
          <p className="font-ui text-[13px] font-semibold uppercase tracking-[0.14em] text-inksoft">{L("Welcome back", "Hola de nuevo")}</p>
          <span className="font-ui text-xs text-inksoft">{profile.childName}</span>
        </div>

        <Link
          to="/adventure"
          className="mt-3 flex items-center justify-between rounded-3xl bg-clay p-4 wood-block active:translate-y-1"
        >
          <div>
            <p className="font-ui text-2xl font-bold leading-tight text-primary-foreground">{L("Today's Adventure", "La aventura de hoy")}</p>
            <p className="font-ui text-sm font-semibold text-primary-foreground/85">{L("5 little games · Bramble & You", "5 juegos cortos · Zarza y tú")}</p>
          </div>
          <span className="grid size-14 place-items-center rounded-full bg-card text-3xl anim-floaty">🐻</span>
        </Link>

        <div className="mt-4 grid grid-cols-4 gap-2.5">
          {AREAS.slice(0, 8).map((a) => (
            <Link
              key={a.id}
              to="/play/$area"
              params={{ area: a.id }}
              aria-label={tTitle(a.title)}
              className={`grid aspect-square place-items-center rounded-2xl ${TINT[a.tint]} bg-card text-3xl wood-block active:translate-y-1`}
            >
              <span className="anim-bob">{a.emoji}</span>
            </Link>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 pr-1 text-3xl">
          {CHARACTERS.slice(0, 3).map((c, i) => (
            <span key={c.id} className="anim-floaty" style={{ animationDelay: `${i * 0.4}s` }}>
              {c.emoji}
            </span>
          ))}
        </div>
      </section>

      {!profile.onboarded && (
        <Link
          to="/welcome"
          className="mt-4 flex items-center justify-between rounded-3xl bg-amber/30 p-4 wood-block"
        >
          <span>
            <span className="block font-ui text-lg font-bold text-ink">{L("Set up your child", "Configura el perfil")}</span>
            <span className="block font-ui text-sm text-inksoft">{L("Name, age mode and a play buddy · 1 minute", "Nombre, edad y un amigo de juego · 1 minuto")}</span>
          </span>
          <span className="text-2xl">✨</span>
        </Link>
      )}

      <section className="mt-6">
        <p className="px-1 font-ui text-[13px] font-semibold uppercase tracking-[0.14em] text-inksoft">
          {L("The five worlds", "Los cinco mundos")}
        </p>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {WORLDS.map((w) => (
            <Link
              key={w.id}
              to="/world/$worldId"
              params={{ worldId: w.id }}
              aria-label={tTitle(w.title)}
              className={`grid aspect-square place-items-center rounded-2xl ${TINT[w.tint]} bg-card text-3xl wood-block active:translate-y-1`}
            >
              {w.emoji}
            </Link>
          ))}
        </div>
        <Link
          to="/worlds"
          className="mt-3 block rounded-2xl bg-card py-3 text-center font-ui font-bold text-ink wood-block"
        >
          {L(`Browse all ${GAMES.length} games ›`, `Ver los ${GAMES.length} juegos ›`)}
        </Link>
      </section>

      {profile.recent?.length ? (
        <section className="mt-6">
          <p className="px-1 font-ui text-[13px] font-semibold uppercase tracking-[0.14em] text-inksoft">
            {L("Play again", "Juega otra vez")}
          </p>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {profile.recent.slice(0, 6).map((id) => {
              const g = gameById(id);
              if (!g) return null;
              return (
                <Link
                  key={id}
                  to="/game/$gameId"
                  params={{ gameId: id }}
                  className="w-28 shrink-0 rounded-2xl bg-card p-3 text-center wood-block"
                >
                  <span className="block text-3xl">{g.emoji}</span>
                  <span className="mt-1 block font-ui text-xs font-bold leading-tight text-ink">{tTitle(g.title)}</span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="mt-6">
        <div className="flex items-center justify-between px-1">
          <p className="font-ui text-[13px] font-semibold uppercase tracking-[0.14em] text-inksoft">{L("Learning worlds", "Mundos de aprendizaje")}</p>
          <span className="font-ui text-xs text-inksoft">{L(`${LIBRARY_SIZE} activities offline`, `${LIBRARY_SIZE} actividades sin conexión`)}</span>
        </div>

        <div className="mt-3 space-y-3">
          {AREAS.map((a) => {
            const s = skillOf(profile, a.id);
            const locked = !a.free && !profile.premium;
            return (
              <Link
                key={a.id}
                to={locked ? "/parent/subscription" : "/play/$area"}
                params={locked ? {} : { area: a.id }}
                className="flex items-center gap-4 rounded-3xl bg-card p-4 wood-block active:translate-y-1"
              >
                <span className={`grid size-16 shrink-0 place-items-center rounded-2xl ${TINT[a.tint]} text-3xl`}>
                  {locked ? "🔒" : a.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-ui text-lg font-bold leading-tight text-ink">{tTitle(a.title)}</p>
                  <p className="truncate font-ui text-sm text-inksoft">{locked ? L("Premium world", "Mundo premium") : tTitle(a.blurb)}</p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-felt">
                    <div className="h-full rounded-full bg-moss" style={{ width: `${(s.level / 5) * 100}%` }} />
                  </div>
                </div>
                <span className="font-ui text-xl text-inksoft">›</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-7 rounded-[2rem] felt-panel p-4">
        <p className="px-1 font-ui text-[13px] font-semibold uppercase tracking-[0.14em] text-inksoft">
          {L("Totland Premium", "Totland Premium")}
        </p>
        <p className="mt-2 px-1 font-ui text-sm text-inksoft">
          {L("Unlock every world, puzzle, storybook and tracing game — with no ads and no tracking. Cancel anytime through Paddle.", "Desbloquea todos los mundos, rompecabezas, cuentos y trazos — sin anuncios ni rastreo. Cancela cuando quieras con Paddle.")}
        </p>
        <p className="mt-2 px-1 font-ui text-sm font-semibold text-ink">
          {L(
            "✈️ Play anywhere, even with no internet — offline play is part of Premium.",
            "✈️ Juega donde sea, incluso sin internet — jugar sin conexión es parte de Premium.",
          )}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl bg-card p-3 text-center wood-block">
            <p className="font-ui text-xl font-bold text-ink">$2.99</p>
            <p className="font-ui text-xs text-inksoft">{L("per month", "al mes")}</p>
          </div>
          <div className="rounded-2xl bg-card p-3 text-center wood-block">
            <p className="font-ui text-xl font-bold text-ink">$19.99</p>
            <p className="font-ui text-xs text-inksoft">{L("per year · best value", "al año · mejor precio")}</p>
          </div>
        </div>
        <p className="mt-2 px-1 font-ui text-xs text-inksoft">
          30-day money-back guarantee. See our{" "}
          <Link to="/refund" className="underline">
            Refund Policy
          </Link>
          .
        </p>
        <Link
          to="/parent/subscription"
          search={{ checkout: undefined }}
          className="mt-3 block rounded-2xl bg-clay py-3 text-center font-ui font-bold text-primary-foreground wood-block"
        >
          {L("Get Premium", "Obtener Premium")}
        </Link>
      </section>

      <Link
        to="/parent"
        className="mt-6 flex items-center justify-between rounded-3xl bg-night px-5 py-4 text-cream wood-block"
      >
        <span className="font-semibold">{L("Parents & settings", "Familia y ajustes")}</span>
        <span className="text-sm text-cream/60">{L("🔒 Grown-ups only", "🔒 Solo adultos")}</span>
      </Link>
      <p className="mt-3 text-center font-ui text-[11px] uppercase tracking-[0.18em] text-inksoft">
        Offline-first · No ads · Data stays on device
      </p>
      <footer className="mt-3 flex justify-center gap-4 font-ui text-[11px] text-inksoft">
        <Link to="/terms" className="underline">
          Terms
        </Link>
        <Link to="/privacy" className="underline">
          Privacy
        </Link>
        <Link to="/refund" className="underline">
          Refunds
        </Link>
      </footer>
      <InstallPrompt />
    </main>
  );
}
