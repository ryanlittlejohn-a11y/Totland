import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { PlayFrame } from "@/components/PlayFrame";
import { ChoiceGame } from "@/components/game/ChoiceGame";
import { MemoryGame } from "@/components/game/MemoryGame";
import { TracingGame } from "@/components/game/TracingGame";
import { FlashCards } from "@/components/game/FlashCards";
import { StoryReader } from "@/components/game/StoryReader";
import { RewardScreen } from "@/components/game/RewardScreen";
import { AREAS, CHARACTERS, type SkillId } from "@/lib/content";

export const Route = createFileRoute("/play/$area")({
  head: () => ({
    meta: [
      { title: "Play & Learn — Totland" },
      { name: "description", content: "Short, playful learning activities for toddlers: letters, numbers, colors, shapes and words." },
      { property: "og:title", content: "Play & Learn — Totland" },
      { property: "og:description", content: "Bite-sized toddler learning games with instant, encouraging feedback." },
    ],
  }),
  component: PlayPage,
});

function PlayPage() {
  const { area } = useParams({ from: "/play/$area" });
  const [key, setKey] = useState(0);
  const [stars, setStars] = useState<number | null>(null);

  const meta = AREAS.find((a) => a.id === area) ?? AREAS[0]!;
  const skill = meta.id as SkillId;
  const mascot = CHARACTERS[Math.abs(skill.length * 7) % CHARACTERS.length]!.emoji;

  const restart = () => {
    setStars(null);
    setKey((k) => k + 1);
  };

  return (
    <PlayFrame title={meta.title}>
      {stars !== null ? (
        <RewardScreen stars={stars} onAgain={restart} />
      ) : skill === "memory" ? (
        <MemoryGame key={key} onFinish={setStars} />
      ) : skill === "tracing" ? (
        <TracingGame key={key} onFinish={setStars} />
      ) : skill === "flashcards" ? (
        <FlashCards key={key} onFinish={setStars} />
      ) : skill === "stories" ? (
        <StoryReader key={key} onFinish={setStars} />
      ) : (
        <ChoiceGame key={key} skill={skill} mascot={mascot} onFinish={setStars} />
      )}
    </PlayFrame>
  );
}
