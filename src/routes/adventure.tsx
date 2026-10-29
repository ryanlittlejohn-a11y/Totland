import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PlayFrame } from "@/components/PlayFrame";
import { ChoiceGame } from "@/components/game/ChoiceGame";
import { FlashCards } from "@/components/game/FlashCards";
import { RewardScreen } from "@/components/game/RewardScreen";
import { adventurePlan } from "@/lib/games";
import { CHARACTERS, type SkillId } from "@/lib/content";
import { skillOf, useProfile } from "@/lib/profile";
import { L } from "@/lib/i18n";
import { CALM_ADVENTURE_ORDER, calmAdventureStep, isCalm } from "@/lib/calm";
import { loadProfile } from "@/lib/profile";

export const Route = createFileRoute("/adventure")({
  head: () => ({
    meta: [
      { title: "Today's Adventure — Totland" },
      {
        name: "description",
        content: "A personalised 5–10 minute learning session: letters, numbers, vocabulary, a puzzle, flash cards and a reward.",
      },
      { property: "og:title", content: "Today's Adventure — Totland" },
      { property: "og:description", content: "A short daily learning session that adapts to your child automatically." },
      { property: "og:url", content: "https://totland.app/adventure" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://totland.app/adventure" }],
  }),
  component: AdventurePage,
});

function AdventurePage() {
  const { profile, hydrated } = useProfile();
  // Calm mode is read once when the Adventure opens; its order is fixed and never re-sorts mid-session.
  const [calm] = useState(() => isCalm(loadProfile()));
  const adaptivePlan = useMemo(() => {
    const levels: Partial<Record<SkillId, number>> = {};
    (["letters", "numbers", "words", "puzzles", "colors"] as SkillId[]).forEach((s) => {
      levels[s] = skillOf(profile, s).level;
    });
    return adventurePlan(levels);
  }, [profile]);
  const plan = calm ? CALM_ADVENTURE_ORDER : adaptivePlan;

  const [step, setStep] = useState(0);
  const [stars, setStars] = useState(0);
  const [finished, setFinished] = useState(false);
  /** Calm: between activities, show "Next: ___" and wait for a tap. */
  const [between, setBetween] = useState(false);

  if (!hydrated) return <PlayFrame title={L("Today's Adventure", "La aventura de hoy")}>{null}</PlayFrame>;

  const total = plan.length + 1; // + flash cards
  const advance = (earned: number) => {
    setStars((s) => s + earned);
    if (step + 1 >= total) setFinished(true);
    else {
      setStep(step + 1);
      if (calm) setBetween(true);
    }
  };
  const next = calmAdventureStep(plan, step);

  return (
    <PlayFrame title={L("Today's Adventure", "La aventura de hoy")} progress={{ done: step, total }}>
      {finished ? (
        <RewardScreen
          stars={Math.min(3, Math.round(stars / total))}
          onAgain={() => {
            setStep(0);
            setStars(0);
            setFinished(false);
            setBetween(false);
          }}
        />
      ) : calm && between ? (
        <div className="rounded-[2rem] bg-card p-6 text-center wood-block" data-testid="calm-next-cue">
          <p className="font-ui text-sm font-semibold uppercase tracking-[0.14em] text-inksoft">{L("Next", "Ahora")}</p>
          <p className="mt-2 text-5xl" aria-hidden>{next.icon}</p>
          <p className="mt-2 font-ui text-2xl font-bold text-ink">{L(next.en, next.es)}</p>
          <button type="button" onClick={() => setBetween(false)} className="mt-6 w-full rounded-2xl bg-moss py-5 font-ui text-2xl font-bold text-primary-foreground wood-block">
            {L("Next", "Siguiente")} <span aria-hidden>▶</span>
          </button>
        </div>
      ) : step < plan.length ? (
        <ChoiceGame
          key={step}
          skill={plan[step]!}
          mascot={CHARACTERS[step % CHARACTERS.length]!.emoji}
          onFinish={advance}
        />
      ) : (
        <FlashCards key="cards" onFinish={advance} />
      )}
      {calm && !finished && (
        <button
          type="button"
          onClick={() => setFinished(true)}
          className="mt-4 w-full rounded-2xl bg-felt py-4 font-ui text-lg font-bold text-ink wood-block"
        >
          {L("Finish", "Terminar")} <span aria-hidden>✋</span>
        </button>
      )}
    </PlayFrame>
  );
}
