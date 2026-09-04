import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { PlayFrame } from "@/components/PlayFrame";
import { ChoiceGame } from "@/components/game/ChoiceGame";
import { FlashCards } from "@/components/game/FlashCards";
import { MemoryGame } from "@/components/game/MemoryGame";
import { TracingGame } from "@/components/game/TracingGame";
import { StoryReader } from "@/components/game/StoryReader";
import { RewardScreen } from "@/components/game/RewardScreen";
import { generateTemplateRound } from "@/lib/templates";
import { dailyAdventure } from "@/lib/mastery";
import { CHARACTERS } from "@/lib/content";
import { useProfile } from "@/lib/profile";

export const Route = createFileRoute("/adventure")({
  head: () => ({
    meta: [
      { title: "Today's Adventure — Totland" },
      {
        name: "description",
        content: "A personalised 5–10 minute learning session: letters, numbers, vocabulary, a puzzle and a reward.",
      },
      { property: "og:title", content: "Today's Adventure — Totland" },
      { property: "og:description", content: "A short daily learning session that adapts to your child automatically." },
    ],
  }),
  component: AdventurePage,
});

function AdventurePage() {
  const { profile, hydrated } = useProfile();
  const plan = useMemo(() => (hydrated ? dailyAdventure(profile) : []), [hydrated, profile.premium, profile.ageMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const [step, setStep] = useState(0);
  const [stars, setStars] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = plan[step];
  const generator = useCallback(
    (level: number) => generateTemplateRound(current!.template, level, current!.opts),
    [current],
  );

  if (!hydrated || !plan.length) return <PlayFrame title="Today's Adventure">{null}</PlayFrame>;

  const advance = (earned: number) => {
    setStars((s) => s + earned);
    if (step + 1 >= plan.length) setFinished(true);
    else setStep(step + 1);
  };

  return (
    <PlayFrame title={current ? current.title : "Today's Adventure"} progress={{ done: step, total: plan.length }}>
      {finished || !current ? (
        <RewardScreen
          stars={Math.max(1, Math.min(3, Math.round(stars / Math.max(1, plan.length))))}
          onAgain={() => {
            setStep(0);
            setStars(0);
            setFinished(false);
          }}
        />
      ) : current.template === "memory" ? (
        <MemoryGame key={current.id} onFinish={advance} />
      ) : current.template === "tracing" ? (
        <TracingGame key={current.id} onFinish={advance} />
      ) : current.template === "flashcards" ? (
        <FlashCards key={current.id} onFinish={advance} />
      ) : current.template === "story" ? (
        <StoryReader key={current.id} onFinish={advance} />
      ) : (
        <ChoiceGame
          key={current.id}
          skill={current.skill}
          gameId={current.id}
          rounds={4}
          generator={generator}
          mascot={CHARACTERS[step % CHARACTERS.length]!.emoji}
          onFinish={advance}
        />
      )}
    </PlayFrame>
  );
}
