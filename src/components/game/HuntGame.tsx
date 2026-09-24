import { useEffect, useMemo, useState } from "react";
import { huntSet } from "@/lib/rounds";
import type { SkillId } from "@/lib/content";
import { chime, say, themeChime } from "@/lib/speech";
import { recordAnswer, recordGameComplete, skillOf, useProfile } from "@/lib/profile";
import { L } from "@/lib/i18n";
import { GameThemeScene } from "./GameThemeScene";
import { NEUTRAL_GAME_THEME, type GameTheme } from "@/lib/game-themes";

/** "Find every…" engine — tap-many interaction with no timer and no penalty. */
export function HuntGame({
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
  const set = useMemo(() => (hydrated ? huntSet(kind, level) : null), [hydrated, kind, level]);

  const [found, setFound] = useState<string[]>([]);
  const [taps, setTaps] = useState(0);

  useEffect(() => {
    if (set) say(L(`Find ${set.label}. Tap every one you can see.`, `Busca ${set.label}. Toca todos los que veas.`));
  }, [set]);

  useEffect(() => {
    if (!set || found.length !== set.targetIds.length || found.length === 0) return undefined;
    const accuracy = set.targetIds.length / Math.max(1, taps);
    const stars = accuracy > 0.9 ? 3 : accuracy > 0.6 ? 2 : 1;
    update((p) => recordGameComplete(p, skill, stars, 1));
    chime("reward", profile.sfx);
    const t = window.setTimeout(() => onFinish(stars, accuracy), 800);
    return () => window.clearTimeout(t);
  }, [found, set, taps, skill, update, onFinish, profile.sfx]);

  if (!set) return <div className="h-64 rounded-3xl felt-panel" />;

  const tap = (id: string) => {
    if (found.includes(id)) return;
    const hit = set.targetIds.includes(id);
    setTaps((t) => t + 1);
    update((p) => recordAnswer(p, { skill, correct: hit, responseMs: 2500 }));
    if (hit) themeChime(theme.motif, profile.sfx);
    else chime("retry", profile.sfx);
    if (hit) {
      setFound((f) => [...f, id]);
      say(L("Found one!", "¡Encontraste uno!"));
    } else {
      say(L(`Keep looking for ${set.label}.`, `Sigue buscando ${set.label}.`));
    }
  };

  return (
    <GameThemeScene theme={theme}>
      <p className="font-ui text-[22px] font-semibold text-ink">{L(`Find ${set.label}!`, `¡Busca ${set.label}!`)}</p>
      <p className="mt-1 font-ui text-sm text-inksoft">
        {L(`${found.length} of ${set.targetIds.length} found`, `${found.length} de ${set.targetIds.length} encontrados`)}
      </p>
      <div className="mt-4 grid grid-cols-4 gap-2.5">
        {set.cells.map((cell) => {
          const done = found.includes(cell.id);
          return (
            <button
              key={cell.id}
              type="button"
              aria-label={cell.label ?? cell.id}
              onClick={() => tap(cell.id)}
              className={`game-theme__option relative aspect-square grid place-items-center wood-block transition-transform active:translate-y-1 ${
                done ? "bg-moss/30 scale-95" : "bg-card"
              }`}
            >
              {cell.swatch ? (
                <span className="size-10 rounded-full" style={{ background: cell.swatch }} />
              ) : cell.clip ? (
                <span className="size-10 bg-clay" style={{ clipPath: cell.clip }} />
              ) : cell.emoji ? (
                <span className="text-3xl">{cell.emoji}</span>
              ) : (
                <span className="font-ui text-2xl font-bold text-ink">{cell.label}</span>
              )}
              {done && <span className="absolute text-2xl">✅</span>}
            </button>
          );
        })}
      </div>
    </GameThemeScene>
  );
}
