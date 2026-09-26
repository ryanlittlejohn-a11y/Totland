import { createFileRoute, Link } from "@tanstack/react-router";
import { AREAS, CHARACTERS } from "@/lib/content";
import { areaWholeLocked, FREE_WORD_FIND_COUNT, GAME_COUNT, WORD_FIND_COUNT } from "@/lib/library-counts";
import { GAMES, WORLDS, gameById } from "@/lib/catalog";
import { useProfile } from "@/lib/profile";
import { InstallPrompt } from "@/components/InstallPrompt";
import { L, title as tTitle } from "@/lib/i18n";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Totland — Ad-Free Toddler Learning Games for Ages 2–6" },
      {
        name: "description",
        content:
          "Toddler learning games for ages 2–6: ABCs, phonics games, letter tracing games, numbers, colors, shapes, first words, puzzles and storybooks. No ads, no tracking.",
      },
      { property: "og:title", content: "Totland — Ad-Free Toddler Learning Games for Ages 2–6" },
      {
        property: "og:description",
        content:
          "Hundreds of bite-sized toddler learning games for toddlers and preschoolers — phonics, letter tracing and more. Offline, ad-free, privacy-first.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://totland.app/" },
      { property: "og:image", content: "https://totland.app/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://totland.app/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://totland.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Totland",
          url: "https://totland.app/",
          applicationCategory: "EducationalApplication",
          applicationSubCategory: "Early learning games",
          operatingSystem: "Web, iOS, Android",
          description:
            "Toddler learning games for ages 2–6: ABCs, phonics games, letter tracing games, numbers, colors, shapes, first words, puzzles and storybooks. No ads, no tracking.",
          isFamilyFriendly: true,
          inLanguage: ["en", "es"],
          audience: { "@type": "PeopleAudience", suggestedMinAge: 2, suggestedMaxAge: 6 },
          offers: [
            { "@type": "Offer", name: "Free", price: 0, priceCurrency: "USD" },
            { "@type": "Offer", name: "Totland Premium Monthly", price: 2.99, priceCurrency: "USD" },
            { "@type": "Offer", name: "Totland Premium Yearly", price: 19.99, priceCurrency: "USD" },
          ],
        }),
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
            <h1 className="font-ui text-[15px] font-bold leading-none text-ink">
              Totland
              <span className="sr-only"> — ad-free toddler learning games for ages 2–6, including phonics games and letter tracing games</span>
            </h1>
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
          <p className="font-ui text-[13px] font-semibold uppercase tracking-[0.14em] text-inksoft">
            {profile.childName && profile.childName !== "Friend" ? L("Welcome back", "Hola de nuevo") : L("Welcome", "¡Hola!")}
          </p>
          {profile.childName && profile.childName !== "Friend" && (
            <span className="font-ui text-xs text-inksoft">{profile.childName}</span>
          )}
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
        <h2 className="px-1 font-ui text-[13px] font-semibold uppercase tracking-[0.14em] text-inksoft">
          {L("The five worlds", "Los cinco mundos")}
        </h2>
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
          <h2 className="font-ui text-[13px] font-semibold uppercase tracking-[0.14em] text-inksoft">{L("Skills to practice", "Habilidades")}</h2>
          <span className="font-ui text-xs text-inksoft">{L(`${GAME_COUNT} games + ${WORD_FIND_COUNT} word finds offline`, `${GAME_COUNT} juegos + ${WORD_FIND_COUNT} sopas de letras sin conexión`)}</span>
        </div>

        <div className="mt-3 space-y-3">
          {AREAS.map((a) => {
            const areaGames = GAMES.filter((game) => game.skill === a.id);
            const explored = areaGames.filter((game) => (profile.games[game.id]?.plays ?? 0) > 0).length;
            const exploration = areaGames.length > 0 ? Math.round((explored / areaGames.length) * 100) : null;
            // Games are locked one by one on the area page; only areas with no
            // catalog games (Flash Cards) are locked as a whole.
            const locked = areaWholeLocked(a) && !profile.premium;
            return (
              <Link
                key={a.id}
                to={locked ? "/parent" : "/play/$area"}
                params={locked ? {} : { area: a.id }}

                className="flex items-center gap-4 rounded-3xl bg-card p-4 wood-block active:translate-y-1"
              >
                <span className={`grid size-16 shrink-0 place-items-center rounded-2xl ${TINT[a.tint]} text-3xl`}>
                  {locked ? "🔒" : a.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-ui text-lg font-bold leading-tight text-ink">{tTitle(a.title)}</p>
                  <p className="truncate font-ui text-sm text-inksoft">{locked ? L("Premium world", "Mundo premium") : tTitle(a.blurb)}</p>
                   {exploration === null ? (
                     <p className="mt-2 font-ui text-xs font-semibold text-inksoft">{L("Ready to play", "Listo para jugar")}</p>
                   ) : (
                     <div className="mt-2">
                       <div
                         className="h-2 w-full overflow-hidden rounded-full bg-felt"
                         role="progressbar"
                         aria-label={L("Games explored", "Juegos explorados")}
                         aria-valuenow={explored}
                         aria-valuemin={0}
                         aria-valuemax={areaGames.length}
                       >
                         <div className="h-full rounded-full bg-moss" style={{ width: `${exploration}%` }} />
                       </div>
                       <p className="mt-1 font-ui text-xs font-semibold text-inksoft">
                         {L(`${explored} of ${areaGames.length} games explored`, `${explored} de ${areaGames.length} juegos explorados`)}
                       </p>
                     </div>
                   )}
                </div>
                <span className="font-ui text-xl text-inksoft">›</span>
              </Link>
            );
          })}
        </div>

        <Link
          to="/wordfinds"
          className="mt-3 flex items-center gap-4 rounded-3xl bg-card p-4 wood-block active:translate-y-1"
        >
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-plum/25 text-3xl">🔎</span>
          <div className="min-w-0 flex-1">
            <p className="font-ui text-lg font-bold leading-tight text-ink">{L("Word Finds", "Sopa de letras")}</p>
            <p className="truncate font-ui text-sm text-inksoft">
              {L(`${WORD_FIND_COUNT} puzzles — first ${FREE_WORD_FIND_COUNT} free`, `${WORD_FIND_COUNT} juegos — los primeros ${FREE_WORD_FIND_COUNT} gratis`)}
            </p>
          </div>
          <span className="font-ui text-xl text-inksoft">›</span>
        </Link>
      </section>

      <Link
        to="/parent"
        className="mt-7 flex items-center gap-3 rounded-3xl bg-card p-4 wood-block active:translate-y-1"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-amber/30 text-xl">✨</span>
        <span className="font-ui text-sm font-semibold text-inksoft">
          {L("Ask a grown-up about Totland Premium", "Pregunta a un adulto por Totland Premium")}
        </span>
      </Link>


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
      <section className="mt-4 rounded-3xl bg-card p-4 wood-block">
        <h2 className="font-ui text-[13px] font-semibold uppercase tracking-[0.14em] text-inksoft">
          {L("For grown-ups", "Para adultos")}
        </h2>
        <p className="mt-2 font-ui text-sm text-inksoft">
          {L(
            "Totland is a collection of ad-free toddler learning games for ages 2–6 — ABCs and phonics games, letter tracing games, numbers, colors, shapes, first words, word finds and read-along storybooks.",
            "Totland es una colección de juegos educativos sin anuncios para niños de 2 a 6 años: abecedario y sonidos, trazos de letras, números, colores, formas, primeras palabras, sopas de letras y cuentos.",
          )}
        </p>
        <Link to="/guides/toddler-learning-games" className="mt-2 inline-block font-ui text-sm font-bold text-ink underline">
          {L("Parent's guide to toddler learning games ›", "Guía para elegir juegos educativos ›")}
        </Link>
      </section>
      <footer className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 font-ui text-[11px] text-inksoft">
        <Link to="/guides/toddler-learning-games" className="underline">
          Guide
        </Link>
        <Link to="/terms" className="underline">
          Terms
        </Link>
        <Link to="/privacy" className="underline">
          Privacy
        </Link>
        <Link to="/refund" className="underline">
          Refunds
        </Link>
        <Link to="/contact" className="underline">
          Contact
        </Link>
      </footer>
      <InstallPrompt />
    </main>
  );
}
