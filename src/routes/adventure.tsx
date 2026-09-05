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
    ],
  }),
  component: AdventurePage,
});

function AdventurePage() {
  const { profile, hydrated } = useProfile();
  const plan = useMemo(() => {
    const levels: Partial<Record<SkillId, number>> = {};
    (["letters", "numbers", "words", "puzzles", "colors"] as SkillId[]).forEach((s) => {
      levels[s] = skillOf(profile, s).level;
    });
    return adventurePlan(levels);
  }, [profile]);

  const [step, setStep] = useState(0);
  const [stars, setStars] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!hydrated) return <PlayFrame title={L("Today's Adventure", "La aventura de hoy")}>{null}</PlayFrame>;

  const total = plan.length + 1; // + flash cards
  const advance = (earned: number) => {
    setStars((s) => s + earned);
    if (step + 1 >= total) setFinished(true);
    else setStep(step + 1);
  };

  return (
    <PlayFrame title={L("Today's Adventure", "La aventura de hoy")} progress={{ done: step, total }}>
      {finished ? (
        <RewardScreen
          stars={Math.min(3, Math.round(stars / total))}
          onAgain={() => {
            setStep(0);
            setStars(0);
            setFinished(false);
          }}
        />
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
    </PlayFrame>
  );
}
