import { useEffect, useRef, useState } from "react";
import type { SkillId } from "@/lib/content";
import { chime, say, themeChime } from "@/lib/speech";
import { recordAnswer, recordGameComplete, skillOf, useProfile } from "@/lib/profile";
import { L } from "@/lib/i18n";
import { countSet, type CountSet } from "@/lib/scenes";
import { GameThemeScene } from "./GameThemeScene";
import { NEUTRAL_GAME_THEME, type GameTheme } from "@/lib/game-themes";

const ROUNDS = 3;

/**
 * Build-that-many scenes: plant N flowers in the garden, or hook N
 * carriages to the train, then press the button to check.
 */
export function CountBuildGame({
  scene,
  skill,
  theme = NEUTRAL_GAME_THEME,
  onFinish,
}: {
  scene: "garden" | "train";
  skill: SkillId;
  theme?: GameTheme;
  onFinish: (stars: number, accuracy: number) => void;
}) {
  const { profile, update, hydrated } = useProfile();
  const level = skillOf(profile, skill).level;
  const levelRef = useRef(level);
  levelRef.current = level;

  const [set, setSet] = useState<CountSet | null>(null);
  const [round, setRound] = useState(0);
  const [planted, setPlanted] = useState<boolean[]>([]);
  const [cars, setCars] = useState(0);
  const [state, setState] = useState<"building" | "done">("building");
  const [message, setMessage] = useState("");
  const tally = useRef({ right: 0, total: 0 });
  const doneRef = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (hydrated && !set) {
      const s = countSet(level);
      setSet(s);
      setPlanted(Array(s.max).fill(false));
    }
  }, [hydrated, set, level]);

  const prompt = set
    ? scene === "garden"
      ? L(
          `Plant ${set.target} flowers, then press Done.`,
          `Planta ${set.target} flores y pulsa Listo.`,
        )
      : L(
          `Hook ${set.target} carriages to the train, then press Go.`,
          `Engancha ${set.target} vagones al tren y pulsa Vamos.`,
        )
    : "";
  useEffect(() => {
    if (set) say(prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [set]);

  if (!set) return <div className="h-64 rounded-3xl felt-panel" />;

  const have = scene === "garden" ? planted.filter(Boolean).length : cars;

  const check = () => {
    if (doneRef.current) return;
    const ok = have === set.target;
    tally.current.total += 1;
    update((p) => recordAnswer(p, { skill: "numbers", correct: ok, responseMs: 4000 }));
    if (!ok) {
      chime("retry", profile.sfx);
      const msg = L(
        `You have ${have}. We need ${set.target}. Count again!`,
        `Tienes ${have}. Necesitamos ${set.target}. ¡Cuenta otra vez!`,
      );
      setMessage(msg);
      say(msg);
      return;
    }
    tally.current.right += 1;
    doneRef.current = true;
    setState("done");
    themeChime(theme.motif, profile.sfx);
    const msg =
      scene === "garden"
        ? L(`${set.target} flowers! Lovely garden!`, `¡${set.target} flores! ¡Qué jardín!`)
        : L(`${set.target} carriages! Toot toot!`, `¡${set.target} vagones! ¡Chu chu!`);
    setMessage(msg);
    say(msg);
    timer.current = window.setTimeout(() => {
      if (round + 1 >= ROUNDS) {
        const accuracy = tally.current.right / Math.max(1, tally.current.total);
        const stars = accuracy > 0.9 ? 3 : accuracy > 0.6 ? 2 : 1;
        update((p) => recordGameComplete(p, skill, stars, 1));
        onFinishRef.current(stars, accuracy);
        return;
      }
      const s = countSet(levelRef.current);
      setRound((r) => r + 1);
      setPlanted(Array(s.max).fill(false));
      setCars(0);
      setState("building");
      setMessage("");
      doneRef.current = false;
      setSet(s);
    }, 2000);
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
      <p className="mt-2 text-center font-ui text-6xl font-bold text-clay" aria-hidden>
        {set.target}
      </p>

      {scene === "garden" ? (
        <div className="mt-3 grid grid-cols-5 gap-2 rounded-3xl bg-moss/20 p-3">
          {planted.map((on, i) => (
            <button
              key={i}
              type="button"
              disabled={state === "done"}
              aria-label={
                on
                  ? L(`Flower ${i + 1}, tap to remove`, `Flor ${i + 1}, toca para quitarla`)
                  : L(`Empty plot ${i + 1}`, `Hueco ${i + 1} vacío`)
              }
              aria-pressed={on}
              onClick={() => setPlanted((p) => p.map((v, j) => (j === i ? !v : v)))}
              className="garden-plot grid aspect-square place-items-center rounded-2xl"
            >
              <span className={on ? "anim-pop text-4xl" : "text-xl opacity-40"} aria-hidden>
                {on ? "🌻" : "🟫"}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <>
          <div
            className={`train-track mt-3 flex items-end gap-1 overflow-x-auto pb-3 ${state === "done" ? "train-depart" : ""}`}
            aria-label={L(`${cars} carriages`, `${cars} vagones`)}
          >
            <span className="train-engine grid place-items-center text-4xl" aria-hidden>
              🚂
            </span>
            {Array.from({ length: cars }, (_, i) => (
              <span
                key={i}
                className="place-slot place-slot--car anim-pop grid place-items-center font-ui text-lg font-bold text-ink"
                aria-hidden
              >
                {i + 1}
              </span>
            ))}
          </div>
          <div className="mt-2 flex justify-center gap-3">
            <button
              type="button"
              disabled={state === "done" || cars === 0}
              onClick={() => setCars((c) => c - 1)}
              className="rounded-2xl bg-card px-5 py-3 font-ui text-lg font-bold text-ink wood-block disabled:opacity-50"
            >
              {L("− Remove", "− Quitar")}
            </button>
            <button
              type="button"
              disabled={state === "done" || cars >= set.max}
              onClick={() => setCars((c) => c + 1)}
              className="rounded-2xl bg-card px-5 py-3 font-ui text-lg font-bold text-ink wood-block disabled:opacity-50"
            >
              {L("+ Add carriage", "+ Añadir vagón")}
            </button>
          </div>
        </>
      )}

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          disabled={state === "done"}
          onClick={check}
          className="rounded-3xl bg-amber px-8 py-3 font-ui text-xl font-bold text-ink wood-block disabled:opacity-60"
        >
          {scene === "garden" ? L("Done!", "¡Listo!") : L("Go!", "¡Vamos!")}
        </button>
      </div>
      <p className="mt-3 min-h-6 text-center font-ui font-semibold text-ink" role="status">
        {message}
      </p>
      <p className="text-center font-ui text-xs text-inksoft">
        {L(`Round ${round + 1} of ${ROUNDS}`, `Ronda ${round + 1} de ${ROUNDS}`)}
      </p>
    </GameThemeScene>
  );
}
