import { useRef } from "react";
import { useDragToTarget } from "@/hooks/useDragToTarget";
import type { SkillId } from "@/lib/content";
import type { Option } from "@/lib/games";
import { L } from "@/lib/i18n";
import { DragTarget } from "./DragTarget";
import { GameOptionVisual, optionAriaLabel } from "./GameOptionVisual";

/** Monster visuals layered over the shared item-to-target drag primitive. */
export function MonsterFeedingScene({
  options,
  skill,
  eatenId,
  refusedId,
  disabled,
  onFeed,
}: {
  options: Option[];
  skill: SkillId;
  eatenId: string | null;
  refusedId: string | null;
  disabled: boolean;
  onFeed: (id: string) => void;
}) {
  const lastDrop = useRef({ id: "", at: 0 });
  const drag = useDragToTarget({
    disabled,
    hitSlop: 24,
    onDrop: (targetId, letterId) => {
      if (targetId === "mouth" && letterId) {
        lastDrop.current = { id: letterId, at: Date.now() };
        onFeed(letterId);
      }
    },
  });

  const tapFeed = (id: string) => {
    if (disabled) return;
    if (lastDrop.current.id === id && Date.now() - lastDrop.current.at < 500) return;
    onFeed(id);
  };

  return (
    <div className="monster-feeding-scene relative mt-5 select-none overflow-hidden rounded-3xl" data-testid="monster-feeding-scene">
      <span className="sr-only">{L("Tap an answer to feed it to the monster.", "Toca una respuesta para dársela al monstruo.")}</span>
      <div className="monster-letter-field grid grid-cols-2 gap-4 px-4 pb-5 pt-6 sm:grid-cols-4">
        {options.map((option, index) => {
          const active = drag.activeHandleId === option.id;
          const eaten = eatenId === option.id;
          const refused = refusedId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              {...drag.getHandleProps(option.id)}
              onClick={() => tapFeed(option.id)}
              disabled={disabled}
              aria-label={L(`Feed ${optionAriaLabel(skill, option)}`, `Dar ${optionAriaLabel(skill, option)}`)}
              data-monster-letter={option.id}
              className={`monster-letter game-theme__option relative z-10 mx-auto grid size-20 cursor-grab place-items-center rounded-2xl font-ui text-5xl font-bold text-ink ${
                active ? "is-dragging" : ""
              } ${eaten ? "is-eaten" : ""} ${refused ? "is-refused" : ""}`}
              style={{
                ...(active ? { transform: `translate(${drag.offset.x}px, ${drag.offset.y}px)` } : {}),
                animationDelay: `${index * 180}ms`,
              }}
            >
              <GameOptionVisual option={option} />
            </button>
          );
        })}
      </div>

      <div className={`monster-body ${eatenId ? "is-happy" : ""} ${refusedId ? "is-sniffing" : ""}`} aria-hidden>
        <span className="monster-face">👾</span>
        <DragTarget
          register={drag.registerTarget("mouth")}
          onClick={() => undefined}
          tabIndex={-1}
          aria-label={L("Monster mouth", "Boca del monstruo")}
          data-testid="monster-mouth"
          className={`monster-mouth ${drag.hoverId === "mouth" ? "is-hover" : ""}`}
        >
          <span className="monster-mouth__inside" />
        </DragTarget>
      </div>
    </div>
  );
}