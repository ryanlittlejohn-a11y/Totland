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
import { L, title as tTitle } from "@/lib/i18n";

export const Route = createFileRoute("/play/$area")({
  head: ({ params }) => {
    const areaMeta = AREAS.find((a) => a.id === params.area) ?? AREAS[0]!;
    const areaTitle = typeof areaMeta.title === "string" ? areaMeta.title : "Play & Learn";
    const title = `${areaTitle} — Totland`;
    const description = `${areaTitle} activities for toddlers and preschoolers: short, playful learning games with instant, encouraging feedback.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `https://totland.app/play/${params.area}` },
        { property: "og:image", content: "https://totland.app/og-image.jpg" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: "https://totland.app/og-image.jpg" },
      ],
      links: [{ rel: "canonical", href: `https://totland.app/play/${params.area}` }],
    };
  },
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
    <PlayFrame title={tTitle(meta.title)}>
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
