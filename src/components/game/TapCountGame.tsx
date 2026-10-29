import { advanceAfter } from "@/lib/calm";
import { useEffect, useRef, useState } from "react";
import type { SkillId } from "@/lib/content";
import { chime, say, themeChime } from "@/lib/speech";
import { recordAnswer, recordGameComplete, skillOf, useProfile } from "@/lib/profile";
import { L } from "@/lib/i18n";
import { tapCountSet, type TapCountSet } from "@/lib/scenes";
import { GameThemeScene } from "./GameThemeScene";
import { NEUTRAL_GAME_THEME, type GameTheme } from "@/lib/game-themes";

const ROUNDS = 3;

/**
 * Tap to count: tap each animal; it hops and shows its running number.
 * Once every animal is counted, pick the total.
 */
export function TapCountGame({
  skill,
  theme = NEUTRAL_GAME_THEME,
  onFinish,
}: {
  skill: SkillId;
  theme?: GameTheme;
  onFinish: (stars: number, accuracy: number) => void;
}) {
  const { profile, update, hydrated } = useProfile();
  const level = skillOf(profile, skill).level;
  const levelRef = useRef(level);
  levelRef.current = level;

  const [set, setSet] = useState<TapCountSet | null>(null);
  const [round, setRound] = useState(0);
  const [order, setOrder] = useState<number[]>([]); // animal index in tap order
  const [wrong, setWrong] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const tally = useRef({ right: 0, total: 0 });
  const doneRef = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (hydrated && !set) setSet(tapCountSet(level));
  }, [hydrated, set, level]);

  const prompt = L("Tap each animal to count it.", "Toca cada animal para contarlo.");
  useEffect(() => {
    if (set) say(prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [set]);

  if (!set) return <div className="h-64 rounded-3xl felt-panel" />;
  const allCounted = order.length === set.count;

  const tap = (i: number) => {
    if (order.includes(i) || doneRef.current) return;
    const next = [...order, i];
    setOrder(next);
    say(String(next.length));
    if (next.length === set.count) {
      setMessage(L("How many are there?", "¿Cuántos hay?"));
      window.setTimeout(() => say(L("How many are there?", "¿Cuántos hay?")), 700);
    }
  };

  const pickTotal = (n: number) => {
    if (doneRef.current || !allCounted) return;
    const ok = n === set.count;
    tally.current.total += 1;
    update((p) => recordAnswer(p, { skill: "numbers", correct: ok, responseMs: 3000 }));
    if (!ok) {
      setWrong(n);
      chime("retry", profile.sfx);
      setMessage(L("Look at the last number you counted.", "Mira el último número que contaste."));
      window.setTimeout(() => setWrong(null), 700);
      return;
    }
    tally.current.right += 1;
    doneRef.current = true;
    themeChime(theme.motif, profile.sfx);
    const msg = L(`${set.count}! Great counting!`, `¡${set.count}! ¡Muy bien contado!`);
    setMessage(msg);
    say(msg);
    timer.current = advanceAfter(() => {
      if (round + 1 >= ROUNDS) {
        const accuracy = tally.current.right / Math.max(1, tally.current.total);
        const stars = accuracy > 0.9 ? 3 : accuracy > 0.6 ? 2 : 1;
        update((p) => recordGameComplete(p, skill, stars, 1));
        onFinishRef.current(stars, accuracy);
        return;
      }
      setRound((r) => r + 1);
      setOrder([]);
      setMessage("");
      doneRef.current = false;
      setSet(tapCountSet(levelRef.current));
    }, 1800);
  };

  return (
    <GameThemeScene theme={theme}>
      <button
        type="button"
        onClick={() => say(prompt)}
        className="w-full rounded-3xl felt-panel px-4 py-3 text-left"
      >
        <p className="font-ui text-[22px] font-semibold leading-tight text-ink">
          {prompt} <span aria-hidden>🔊</span>
        </p>
      </button>

      <div className="mt-3 flex flex-wrap justify-center gap-2 rounded-3xl bg-moss/20 p-3">
        {Array.from({ length: set.count }, (_, i) => {
          const at = order.indexOf(i);
          return (
            <button
              key={`${round}-${i}`}
              type="button"
              onClick={() => tap(i)}
              aria-label={at >= 0 ? L(`Counted: ${at + 1}`, `Contado: ${at + 1}`) : L("Animal, not counted yet", "Animal sin contar")}
              className="relative grid size-16 place-items-center rounded-2xl"
            >
              <span className={`text-5xl ${at >= 0 ? "count-hop" : ""}`} key={at} aria-hidden>
                {set.emoji}
              </span>
              {at >= 0 && (
                <span className="anim-pop absolute -right-1 -top-1 grid size-7 place-items-center rounded-full bg-amber font-ui text-sm font-bold text-ink" aria-hidden>
                  {at + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex justify-center gap-3" role="group" aria-label={L("How many?", "¿Cuántos?")}>
        {set.options.map((n) => (
          <button
            key={n}
            type="button"
            disabled={!allCounted}
            onClick={() => pickTotal(n)}
            className={`grid size-16 place-items-center rounded-2xl bg-card font-ui text-3xl font-bold text-ink wood-block disabled:opacity-40 ${
              wrong === n ? "anim-wiggle" : ""
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <p className="mt-3 min-h-6 text-center font-ui font-semibold text-ink" role="status">
        {message ||
          L(`Counted ${order.length} so far.`, `Llevas ${order.length}.`)}
      </p>
      <p className="text-center font-ui text-xs text-inksoft">
        {L(`Round ${round + 1} of ${ROUNDS}`, `Ronda ${round + 1} de ${ROUNDS}`)}
      </p>
    </GameThemeScene>
  );
}
