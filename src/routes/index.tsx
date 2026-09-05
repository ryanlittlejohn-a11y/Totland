import { createFileRoute, Link } from "@tanstack/react-router";
import { AREAS, CHARACTERS, LIBRARY_SIZE } from "@/lib/content";
import { GAMES, WORLDS, gameById } from "@/lib/catalog";
import { skillOf, useProfile } from "@/lib/profile";

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
            <p className="font-ui text-[11px] text-inksoft">Learning that feels like play</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-card px-3 py-2 font-ui text-sm font-bold text-ink wood-block">
            <span className="text-amber anim-twinkle">★</span>
            {profile.stars}
          </span>
          <Link
            to="/rewards"
            aria-label="Sticker shelf"
            className="grid size-11 place-items-center rounded-2xl bg-card text-xl wood-block"
          >
            🎁
          </Link>
        </div>
      </header>

      <section className="mt-5 rounded-[2rem] felt-panel p-4">
        <div className="flex items-center justify-between">
          <p className="font-ui text-[13px] font-semibold uppercase tracking-[0.14em] text-inksoft">Welcome back</p>
          <span className="font-ui text-xs text-inksoft">{profile.childName}</span>
        </div>

        <Link
          to="/adventure"
          className="mt-3 flex items-center justify-between rounded-3xl bg-clay p-4 wood-block active:translate-y-1"
        >
          <div>
            <p className="font-ui text-2xl font-bold leading-tight text-primary-foreground">Today's Adventure</p>
            <p className="font-ui text-sm font-semibold text-primary-foreground/85">5 little games · Bramble &amp; You</p>
          </div>
          <span className="grid size-14 place-items-center rounded-full bg-card text-3xl anim-floaty">🐻</span>
        </Link>

        <div className="mt-4 grid grid-cols-4 gap-2.5">
          {AREAS.slice(0, 8).map((a) => (
            <Link
              key={a.id}
              to="/play/$area"
              params={{ area: a.id }}
              aria-label={a.title}
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
            <span className="block font-ui text-lg font-bold text-ink">Set up your child</span>
            <span className="block font-ui text-sm text-inksoft">Name, age mode and a play buddy · 1 minute</span>
          </span>
          <span className="text-2xl">✨</span>
        </Link>
      )}

      <section className="mt-6">
        <p className="px-1 font-ui text-[13px] font-semibold uppercase tracking-[0.14em] text-inksoft">
          The five worlds
        </p>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {WORLDS.map((w) => (
            <Link
              key={w.id}
              to="/world/$worldId"
              params={{ worldId: w.id }}
              aria-label={w.title}
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
          Browse all {GAMES.length} games ›
        </Link>
      </section>

      {profile.recent?.length ? (
        <section className="mt-6">
          <p className="px-1 font-ui text-[13px] font-semibold uppercase tracking-[0.14em] text-inksoft">
            Play again
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
                  <span className="mt-1 block font-ui text-xs font-bold leading-tight text-ink">{g.title}</span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="mt-6">
        <div className="flex items-center justify-between px-1">
          <p className="font-ui text-[13px] font-semibold uppercase tracking-[0.14em] text-inksoft">Learning worlds</p>
          <span className="font-ui text-xs text-inksoft">{LIBRARY_SIZE} activities offline</span>
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
                  <p className="font-ui text-lg font-bold leading-tight text-ink">{a.title}</p>
                  <p className="truncate font-ui text-sm text-inksoft">{locked ? "Premium world" : a.blurb}</p>
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
          Totland Premium
        </p>
        <p className="mt-2 px-1 font-ui text-sm text-inksoft">
          Unlock every world, puzzle, storybook and tracing game — with no ads
          and no tracking. Cancel anytime through Paddle.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl bg-card p-3 text-center wood-block">
            <p className="font-ui text-xl font-bold text-ink">$2.99</p>
            <p className="font-ui text-xs text-inksoft">per month</p>
          </div>
          <div className="rounded-2xl bg-card p-3 text-center wood-block">
            <p className="font-ui text-xl font-bold text-ink">$19.99</p>
            <p className="font-ui text-xs text-inksoft">per year · best value</p>
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
          Get Premium
        </Link>
      </section>

      <Link
        to="/parent"
        className="mt-6 flex items-center justify-between rounded-3xl bg-night px-5 py-4 text-cream wood-block"
      >
        <span className="font-semibold">Parents &amp; settings</span>
        <span className="text-sm text-cream/60">🔒 Grown-ups only</span>
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
    </main>
  );
}
