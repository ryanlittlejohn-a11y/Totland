import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { PlayFrame } from "@/components/PlayFrame";
import { ChoiceGame } from "@/components/game/ChoiceGame";
import { MemoryGame } from "@/components/game/MemoryGame";
import { TracingGame } from "@/components/game/TracingGame";
import { FlashCards } from "@/components/game/FlashCards";
import { StoryReader } from "@/components/game/StoryReader";
import { RewardScreen } from "@/components/game/RewardScreen";
import { gameById } from "@/lib/catalog";
import { generateTemplateRound } from "@/lib/templates";
import { CHARACTERS } from "@/lib/content";
import { useProfile } from "@/lib/profile";

export const Route = createFileRoute("/game/$id")({
  head: () => ({
    meta: [
      { title: "Play a game — Totland" },
      { name: "description", content: "A short, spoken, playful learning game for ages 2–6 that adapts as your child plays." },
      { property: "og:title", content: "Play a game — Totland" },
      { property: "og:description", content: "Bite-sized learning games with gentle, encouraging feedback." },
    ],
  }),
  component: GamePage,
});

function GamePage() {
  const { id } = useParams({ from: "/game/$id" });
  const { profile } = useProfile();
  const game = gameById(id);
  const [key, setKey] = useState(0);
  const [stars, setStars] = useState<number | null>(null);

  const generator = useCallback(
    (level: number) => generateTemplateRound(game!.template, level, game!.opts),
    [game],
  );

  if (!game) {
    return (
      <PlayFrame title="Not found">
        <div className="rounded-3xl felt-panel p-5 text-center">
          <p className="font-ui text-lg font-semibold text-ink">That game has moved.</p>
          <Link to="/worlds" className="mt-4 inline-block rounded-2xl bg-clay px-5 py-3 font-ui font-bold text-primary-foreground wood-block">
            Back to the worlds
          </Link>
        </div>
      </PlayFrame>
    );
  }

  const locked = game.premium && !profile.premium;
  const mascot = CHARACTERS[game.n % CHARACTERS.length]!.emoji;
  const restart = () => {
    setStars(null);
    setKey((k) => k + 1);
  };

  if (locked) {
    return (
      <PlayFrame title={game.title}>
        <div className="rounded-[2rem] felt-panel p-6 text-center">
          <span className="text-6xl">🔐</span>
          <p className="mt-3 font-ui text-2xl font-bold text-ink">Ask a grown-up</p>
          <p className="mt-2 font-ui text-inksoft">This activity is part of Totland Premium.</p>
          <Link
            to="/parent/subscription"
            className="mt-5 inline-block rounded-2xl bg-clay px-5 py-3 font-ui font-bold text-primary-foreground wood-block"
          >
            Grown-ups tap here
          </Link>
        </div>
      </PlayFrame>
    );
  }

  return (
    <PlayFrame title={game.title}>
      {stars !== null ? (
        <RewardScreen stars={stars} onAgain={restart} />
      ) : game.template === "memory" ? (
        <MemoryGame key={key} onFinish={setStars} />
      ) : game.template === "tracing" ? (
        <TracingGame key={key} onFinish={setStars} />
      ) : game.template === "flashcards" ? (
        <FlashCards key={key} onFinish={setStars} />
      ) : game.template === "story" ? (
        <StoryReader key={key} onFinish={setStars} />
      ) : (
        <ChoiceGame
          key={key}
          skill={game.skill}
          gameId={game.id}
          mascot={mascot}
          generator={generator}
          onFinish={setStars}
        />
      )}
    </PlayFrame>
  );
}
