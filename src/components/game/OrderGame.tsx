import { useEffect, useMemo, useState } from "react";
import { orderSet } from "@/lib/rounds";
import { shuffle, type SkillId } from "@/lib/content";
import { chime, say, themeChime } from "@/lib/speech";
import { recordAnswer, recordGameComplete, skillOf, useProfile } from "@/lib/profile";
import { L } from "@/lib/i18n";
import { GameThemeScene } from "./GameThemeScene";
import { NEUTRAL_GAME_THEME, type GameTheme } from "@/lib/game-themes";

/** Sequencing engine: trains, bridges, races and word building. */
export function OrderGame({
  kind,
  skill,
  theme = NEUTRAL_GAME_THEME,
  onFinish,
}: {
  kind: string;
  skill: SkillId;
  theme?: GameTheme;
  onFinish: (stars: number, accuracy: number) => void;
}) {
  const { profile, update, hydrated } = useProfile();
  const level = skillOf(profile, skill).level;
  const set = useMemo(() => (hydrated ? orderSet(kind, level) : null), [hydrated, kind, level]);
  const jumbled = useMemo(() => (set ? shuffle(set.seq) : []), [set]);

  const [placed, setPlaced] = useState<string[]>([]);
  const [taps, setTaps] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (set) say(set.spoken);
  }, [set]);

  useEffect(() => {
    if (!set || placed.length !== set.seq.length || placed.length === 0) return undefined;
    const accuracy = set.seq.length / Math.max(1, taps);
    const stars = accuracy > 0.9 ? 3 : accuracy > 0.6 ? 2 : 1;
    update((p) => recordGameComplete(p, skill, stars, 1));
    chime("reward", profile.sfx);
    say(L("You did it! The whole line is in order.", "¡Lo lograste! Toda la fila está en orden."));
    const t = window.setTimeout(() => onFinish(stars, accuracy), 900);
    return () => window.clearTimeout(t);
  }, [placed, set, taps, skill, update, onFinish, profile.sfx]);

  if (!set) return <div className="h-64 rounded-3xl felt-panel" />;

  const tap = (id: string) => {
    if (placed.includes(id)) return;
    const expected = set.seq[placed.length]!.id;
    const correct = id === expected;
    setTaps((t) => t + 1);
    update((p) => recordAnswer(p, { skill, correct, responseMs: 2500 }));
    if (correct) {
      setPlaced((p) => [...p, id]);
      setMessage(L("Yes! Keep going.", "¡Sí! Sigue así."));
      themeChime(theme.motif, profile.sfx);
    } else {
      setMessage(`Try the one that comes after ${placed.length ? set.seq[placed.length - 1]!.label : "the start"}.`);
      chime("retry", profile.sfx);
      say(L("Great try! Which one comes next?", "¡Buen intento! ¿Cuál sigue?"));
    }
  };

  return (
    <GameThemeScene theme={theme}>
      <p className="font-ui text-[22px] font-semibold text-ink">{set.label}</p>

      <div className="mt-4 flex min-h-[72px] flex-wrap items-center gap-2 rounded-3xl felt-panel p-3">
        {placed.length === 0 && <span className="font-ui text-sm text-inksoft">{L("Your line starts here…", "Tu fila empieza aquí…")}</span>}
        {placed.map((id) => {
          const item = set.seq.find((s) => s.id === id)!;
          return (
            <span key={id} className="grid size-12 place-items-center rounded-xl bg-amber/40 font-ui text-xl font-bold text-ink">
              {item.label}
            </span>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-3">
        {jumbled.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={placed.includes(item.id)}
            aria-label={item.label}
            onClick={() => tap(item.id)}
            className={`game-theme__option aspect-square grid place-items-center wood-block transition-transform active:translate-y-1 ${
              placed.includes(item.id) ? "bg-felt opacity-40" : "bg-card"
            }`}
          >
            <span className="font-ui text-3xl font-bold text-ink">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 min-h-[54px] rounded-3xl bg-card/60 px-4 py-3" role="status">
        <p className="font-ui font-semibold text-ink">{message || L("Tap them one at a time, in order.", "Tócalos uno por uno, en orden.")}</p>
      </div>
    </GameThemeScene>
  );
}
