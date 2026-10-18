import { useEffect, useRef, useState } from "react";
import type { SkillId } from "@/lib/content";
import { chime, say, themeChime } from "@/lib/speech";
import { recordAnswer, recordGameComplete, skillOf, useProfile } from "@/lib/profile";
import { L, noun } from "@/lib/i18n";
import { dipBrush, paintPicture, type BrushSet, type PaintSet } from "@/lib/scenes";
import { useDragToTarget } from "@/hooks/useDragToTarget";
import { GameThemeScene } from "./GameThemeScene";
import { DragTarget } from "./DragTarget";
import { NEUTRAL_GAME_THEME, type GameTheme } from "@/lib/game-themes";

const ROUNDS = 3;
const STROKES = 3;

/**
 * Painting scenes.
 * - picture: tap a paint pot, then tap the faintly tinted part of the picture
 *   that should be that colour; it fills in.
 * - brush: drag the brush into the pot matching the colour dab (or tap the
 *   pot); the brush paints a stroke across the canvas.
 */
export function PaintGame({
  mode,
  skill,
  theme = NEUTRAL_GAME_THEME,
  onFinish,
}: {
  mode: "picture" | "brush";
  skill: SkillId;
  theme?: GameTheme;
  onFinish: (stars: number, accuracy: number) => void;
}) {
  const { profile, update, hydrated } = useProfile();
  const level = skillOf(profile, skill).level;
  const levelRef = useRef(level);
  levelRef.current = level;

  // Frozen once dealt: a mid-round level-up must never re-deal.
  const [pic, setPic] = useState<PaintSet | null>(null);
  const [brush, setBrush] = useState<BrushSet | null>(null);
  const [round, setRound] = useState(0);
  const [painted, setPainted] = useState<string[]>([]);
  const [strokes, setStrokes] = useState<string[]>([]);
  const [pot, setPot] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const tally = useRef({ right: 0, total: 0 });
  const doneRef = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (!hydrated) return;
    if (mode === "picture" && !pic) setPic(paintPicture(level));
    if (mode === "brush" && !brush) setBrush(dipBrush(level));
  }, [hydrated, mode, pic, brush, level]);

  const prompt =
    mode === "picture"
      ? L(
          "Pick a paint pot, then tap the part of the picture with that colour.",
          "Elige un bote de pintura y toca la parte del dibujo de ese color.",
        )
      : brush
        ? L(`Dip the brush in the ${brush.target} paint.`, `Moja el pincel en el color ${noun(brush.target)}.`)
        : "";
  useEffect(() => {
    if (prompt) say(prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pic, brush]);

  const answer = (ok: boolean) => {
    tally.current.total += 1;
    if (ok) tally.current.right += 1;
    update((p) => recordAnswer(p, { skill, correct: ok, responseMs: 2500 }));
  };

  const finishOrNext = (next: () => void) => {
    timer.current = window.setTimeout(() => {
      if (round + 1 >= ROUNDS) {
        const accuracy = tally.current.right / Math.max(1, tally.current.total);
        const stars = accuracy > 0.9 ? 3 : accuracy > 0.6 ? 2 : 1;
        update((p) => recordGameComplete(p, skill, stars, 1));
        onFinishRef.current(stars, accuracy);
        return;
      }
      setRound((r) => r + 1);
      setMessage("");
      doneRef.current = false;
      next();
    }, 1600);
  };

  const miss = (id: string) => {
    answer(false);
    setWrong(id);
    chime("retry", profile.sfx);
    setMessage(L("Not that one — look at the colour again.", "Esa no. Mira otra vez el color."));
    window.setTimeout(() => setWrong(null), 700);
  };

  /* ------------------------------------------------- picture (tap, tap) */
  const tapRegion = (id: string) => {
    if (!pic || doneRef.current || painted.includes(id)) return;
    const region = pic.regions.find((r) => r.id === id)!;
    if (!pot) {
      setMessage(L("Pick a paint pot first.", "Elige primero un bote de pintura."));
      return;
    }
    if (region.color !== pot) return miss(id);
    answer(true);
    themeChime(theme.motif, profile.sfx);
    const next = [...painted, id];
    setPainted(next);
    setPot(null);
    say(noun(region.color));
    if (next.length !== pic.regions.length) return;
    doneRef.current = true;
    chime("reward", profile.sfx);
    say(L("You did it!", "¡Lo lograste!"));
    setMessage(L("What a beautiful picture!", "¡Qué dibujo tan bonito!"));
    finishOrNext(() => {
      setPainted([]);
      setPic(paintPicture(levelRef.current));
    });
  };

  /* ------------------------------------------------------ brush (drag) */
  const dip = (name: string) => {
    if (!brush || doneRef.current) return;
    if (name !== brush.target) return miss(name);
    answer(true);
    themeChime(theme.motif, profile.sfx);
    const next = [...strokes, brush.swatch];
    setStrokes(next);
    if (next.length < STROKES) {
      setMessage(L("Swish!", "¡Chas!"));
      setBrush(dipBrush(levelRef.current));
      return;
    }
    doneRef.current = true;
    chime("reward", profile.sfx);
    say(L("You did it!", "¡Lo lograste!"));
    setMessage(L("What a beautiful painting!", "¡Qué cuadro tan bonito!"));
    finishOrNext(() => {
      setStrokes([]);
      setBrush(dipBrush(levelRef.current));
    });
  };

  const drag = useDragToTarget({
    onDrop: (target) => {
      if (target) dip(target);
    },
  });

  if ((mode === "picture" && !pic) || (mode === "brush" && !brush))
    return <div className="h-64 rounded-3xl felt-panel" />;

  return (
    <GameThemeScene theme={theme}>
      <button
        type="button"
        onClick={() => say(prompt)}
        className="w-full rounded-3xl felt-panel px-4 py-3 text-left"
      >
        <p className="font-ui text-[20px] font-semibold leading-tight text-ink">
          {prompt} <span aria-hidden>🔊</span>
        </p>
      </button>
      <p className="mt-1 text-center font-ui text-xs text-inksoft">
        {L(`Picture ${round + 1} of ${ROUNDS}`, `Dibujo ${round + 1} de ${ROUNDS}`)}
      </p>

      {mode === "picture" && pic ? (
        <>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 rounded-3xl bg-card p-4">
            {pic.regions.map((r) => {
              const done = painted.includes(r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => tapRegion(r.id)}
                  aria-label={
                    done
                      ? L(`${r.id}, painted ${r.color}`, `${noun(r.id)}, pintado de ${noun(r.color)}`)
                      : L(`${r.id}, should be ${r.color}`, `${noun(r.id)}, debe ser ${noun(r.color)}`)
                  }
                  className={`grid size-24 place-items-center ${wrong === r.id ? "anim-wiggle" : ""}`}
                >
                  <span
                    className={`paint-region block size-24 ${done ? "anim-pop" : ""}`}
                    style={{ clipPath: r.clip, background: r.swatch, opacity: done ? 1 : 0.25 }}
                  />
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-3" role="group" aria-label={L("Paint pots", "Botes de pintura")}>
            {pic.pots.map((p) => (
              <button
                key={p.name}
                type="button"
                aria-pressed={pot === p.name}
                aria-label={L(`${p.name} paint`, `pintura ${noun(p.name)}`)}
                onClick={() => setPot((c) => (c === p.name ? null : p.name))}
                className={`grid size-16 place-items-center rounded-b-3xl rounded-t-lg bg-card wood-block ${
                  pot === p.name ? "ring-4 ring-amber" : ""
                }`}
              >
                <span className="block size-10 rounded-full" style={{ background: p.swatch }} />
              </button>
            ))}
          </div>
        </>
      ) : brush ? (
        <>
          <div className="mt-3 rounded-3xl bg-card p-4">
            <div className="flex items-center justify-center gap-3">
              <span className="font-ui text-sm text-inksoft">{L("Paint with:", "Pinta con:")}</span>
              <span className="block size-12 rounded-full" style={{ background: brush.swatch }} aria-hidden />
            </div>
            <div className="mt-3 flex min-h-28 flex-col gap-2" aria-label={L(`${strokes.length} strokes painted`, `${strokes.length} pinceladas`)}>
              {strokes.map((sw, i) => (
                <span key={i} className="paint-stroke block" style={{ background: sw }} />
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-end justify-center gap-4">
            <button
              type="button"
              aria-label={L("Paint brush — drag it to a pot, or tap a pot", "Pincel: arrástralo a un bote o toca un bote")}
              {...drag.handleProps}
              style={{
                touchAction: "none",
                transform: drag.dragging ? `translate(${drag.offset.x}px, ${drag.offset.y}px) rotate(-20deg)` : undefined,
                zIndex: drag.dragging ? 20 : undefined,
              }}
              className="relative grid size-16 place-items-center rounded-2xl bg-card text-4xl wood-block"
            >
              <span aria-hidden>🖌️</span>
            </button>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {brush.pots.map((p) => (
              <DragTarget
                key={p.name}
                register={drag.registerTarget(p.name)}
                onClick={() => dip(p.name)}
                aria-label={L(`${p.name} paint`, `pintura ${noun(p.name)}`)}
                className={`grid size-20 place-items-center rounded-b-3xl rounded-t-lg bg-card wood-block ${
                  drag.hoverId === p.name ? "scale-110" : ""
                } ${wrong === p.name ? "anim-wiggle" : ""}`}
              >
                <span className="block size-12 rounded-full" style={{ background: p.swatch }} />
              </DragTarget>
            ))}
          </div>
        </>
      ) : null}

      <p className="mt-3 min-h-6 text-center font-ui font-semibold text-ink" role="status">
        {message ||
          (mode === "picture"
            ? L("Tap a pot, then tap the picture.", "Toca un bote y luego el dibujo.")
            : L("Drag the brush into the right pot — or tap the pot.", "Arrastra el pincel al bote correcto, o toca el bote."))}
      </p>
    </GameThemeScene>
  );
}
