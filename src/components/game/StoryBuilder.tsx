import { useState } from "react";
import { chime, say } from "@/lib/speech";
import { recordGameComplete, useProfile } from "@/lib/profile";
import { L } from "@/lib/i18n";

const HEROES = [
  { id: "bear", emoji: "🐻", name: L("Bramble Bear", "Zarza el oso") },
  { id: "fox", emoji: "🦊", name: L("Fern Fox", "Elena la zorra") },
  { id: "dino", emoji: "🦖", name: L("Dot the Dino", "Dina la dinosaurio") },
  { id: "robot", emoji: "🤖", name: L("Bolt", "Chispa") },
];
const THINGS = [
  { id: "kite", emoji: "🪁", name: L("a red kite", "una cometa roja") },
  { id: "cake", emoji: "🍰", name: L("a big cake", "un pastel grande") },
  { id: "ball", emoji: "⚽", name: L("a bouncy ball", "una pelota saltarina") },
  { id: "book", emoji: "📕", name: L("a story book", "un libro de cuentos") },
];
const PLACES = [
  { id: "hill", emoji: "⛰️", name: L("the green hill", "la colina verde") },
  { id: "beach", emoji: "🏖️", name: L("the sunny beach", "la playa soleada") },
  { id: "forest", emoji: "🌳", name: L("the tall forest", "el bosque alto") },
  { id: "home", emoji: "🏠", name: L("the cosy house", "la casita acogedora") },
];

/** Story Builder — the child picks, the app writes a safe, simple story. */
export function StoryBuilder({ onFinish }: { onFinish: (stars: number, accuracy: number) => void }) {
  const { profile, update } = useProfile();
  const [hero, setHero] = useState<typeof HEROES[number] | null>(null);
  const [thing, setThing] = useState<typeof THINGS[number] | null>(null);
  const [place, setPlace] = useState<typeof PLACES[number] | null>(null);
  const [page, setPage] = useState(0);

  const story =
    hero && thing && place
      ? [
          L(`${hero.name} found ${thing.name}.`, `${hero.name} encontró ${thing.name}.`),
          L(`Off they went to ${place.name}.`, `Se fueron a ${place.name}.`),
          L(`They played all day long.`, `Jugaron todo el día.`),
          L(`Then ${hero.name} went home to sleep.`, `Luego ${hero.name} volvió a casa a dormir.`),
        ]
      : [];

  const Row = ({
    title,
    items,
    chosen,
    onPick,
  }: {
    title: string;
    items: { id: string; emoji: string; name: string }[];
    chosen: string | null;
    onPick: (i: { id: string; emoji: string; name: string }) => void;
  }) => (
    <div className="mt-4">
      <p className="font-ui text-sm font-semibold uppercase tracking-[0.12em] text-inksoft">{title}</p>
      <div className="mt-2 grid grid-cols-4 gap-2.5">
        {items.map((i) => (
          <button
            key={i.id}
            type="button"
            aria-label={i.name}
            onClick={() => {
              onPick(i);
              say(i.name);
              chime("correct", profile.sfx);
            }}
            className={`aspect-square grid place-items-center rounded-2xl text-3xl wood-block active:translate-y-1 ${
              chosen === i.id ? "bg-amber/50" : "bg-card"
            }`}
          >
            {i.emoji}
          </button>
        ))}
      </div>
    </div>
  );

  if (story.length && page > 0) {
    const last = page >= story.length;
    return (
      <div className="rounded-[2rem] bg-card p-5 text-center wood-block">
        <div className="text-7xl">{[hero!.emoji, thing!.emoji, place!.emoji, "🌙"][page - 1]}</div>
        <p className="mt-4 font-ui text-2xl font-bold text-ink">{story[page - 1]}</p>
        <button
          type="button"
          onClick={() => {
            if (last) return;
            const next = page + 1;
            if (next > story.length) return;
            setPage(next);
            say(story[next - 1]!);
          }}
          className="mt-6 w-full rounded-2xl bg-felt py-3 font-ui font-bold text-ink wood-block"
        >
          {page < story.length ? L("Next page", "Siguiente página") : L("The end", "Fin")}
        </button>
        {page >= story.length && (
          <button
            type="button"
            onClick={() => {
              update((p) => recordGameComplete(p, "stories", 3, 3));
              chime("reward", profile.sfx);
              onFinish(3, 1);
            }}
            className="mt-3 w-full rounded-2xl bg-clay py-4 font-ui text-lg font-bold text-primary-foreground wood-block"
          >
            {L("Finish my story", "Terminar mi cuento")}
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="font-ui text-[22px] font-semibold text-ink">{L("Let's make a story together!", "¡Hagamos un cuento juntos!")}</p>
      <Row title={L("Who?", "¿Quién?")} items={HEROES} chosen={hero?.id ?? null} onPick={(i) => setHero(i as never)} />
      <Row title={L("What?", "¿Qué?")} items={THINGS} chosen={thing?.id ?? null} onPick={(i) => setThing(i as never)} />
      <Row title={L("Where?", "¿Dónde?")} items={PLACES} chosen={place?.id ?? null} onPick={(i) => setPlace(i as never)} />
      <button
        type="button"
        disabled={!hero || !thing || !place}
        onClick={() => {
          setPage(1);
          say(story[0]!);
        }}
        className="mt-6 w-full rounded-2xl bg-clay py-4 font-ui text-lg font-bold text-primary-foreground wood-block disabled:opacity-40"
      >
        {L("Read my story", "Leer mi cuento")}
      </button>
    </div>
  );
}
