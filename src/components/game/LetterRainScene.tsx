import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { SkillId } from "@/lib/content";
import type { Option } from "@/lib/games";
import { L } from "@/lib/i18n";
import { GameOptionVisual, optionAriaLabel } from "./GameOptionVisual";

type RainStyle = CSSProperties & {
  "--rain-lane": string;
  "--rain-duration": string;
  "--rain-delay": string;
};

/**
 * A CSS-composited rain board plus a stable semantic control list. The visual
 * drops are hidden from assistive technology; the list never moves and can
 * complete the whole game with tap, keyboard, or VoiceOver.
 */
export function LetterRainScene({
  options,
  skill,
  caughtId,
  splashedId,
  disabled,
  onCatch,
}: {
  options: Option[];
  skill: SkillId;
  caughtId: string | null;
  splashedId: string | null;
  disabled: boolean;
  onCatch: (id: string) => void;
}) {
  const [respawns, setRespawns] = useState(0);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const onVisibility = () => setPageVisible(!document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const motion = useMemo(
    () => options.map((option, index) => ({
      ...option,
      lane: `${((index + 0.5) / options.length) * 100}%`,
      duration: `${9 + ((index * 2 + options.length) % 6)}s`,
      // Negative offsets distribute the drops through their lanes immediately,
      // instead of presenting an empty board during the first fall cycle.
      delay: `-${index * 2.1 + 0.6}s`,
    })),
    [options],
  );

  return (
    <div className="mt-4" data-rain-scene>
      <div
        className={`rain-board relative overflow-hidden rounded-3xl wood-block ${disabled || !pageVisible ? "is-paused" : ""}`}
        data-rain-board
        data-respawn-count={respawns}
        data-page-visible={pageVisible ? "true" : "false"}
        aria-hidden="true"
      >
        <div className="rain-clouds" aria-hidden>☁️　☁️　☁️</div>
        <div className="rain-streaks" aria-hidden>│　·　│　·　│　·　│</div>
        {motion.map((letter) => {
          const style: RainStyle = {
            "--rain-lane": letter.lane,
            "--rain-duration": letter.duration,
            "--rain-delay": letter.delay,
          };
          return (
            <button
              key={letter.id}
              type="button"
              tabIndex={-1}
              disabled={disabled}
              onClick={() => onCatch(letter.id)}
              onAnimationIteration={() => setRespawns((count) => count + 1)}
              className="rain-drop absolute"
              style={style}
              data-rain-letter={letter.id}
            >
              <span className={`rain-drop__surface ${splashedId === letter.id ? "is-splashed" : ""} ${caughtId === letter.id ? "is-caught" : ""}`}>
                <GameOptionVisual option={letter} />
              </span>
            </button>
          );
        })}
        <div className="rain-puddle" aria-hidden />
        <div className="rain-umbrella" aria-hidden>☂️</div>
      </div>

      <div
        className="rain-accessible-list"
        aria-label={L("Choose an answer", "Elige una respuesta")}
        data-rain-accessible-list
      >
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            aria-label={optionAriaLabel(skill, option)}
            onClick={() => onCatch(option.id)}
            className={`rain-static-letter ${splashedId === option.id ? "is-splashed" : ""} ${caughtId === option.id ? "is-caught" : ""}`}
            data-rain-static-letter={option.id}
          >
            <GameOptionVisual option={option} />
          </button>
        ))}
      </div>
    </div>
  );
}