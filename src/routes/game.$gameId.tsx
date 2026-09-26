import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { PlayFrame } from "@/components/PlayFrame";
import { LetterFishingGame } from "@/components/game/LetterFishingGame";
import { FeedTheLetterMonsterGame } from "@/components/game/FeedTheLetterMonsterGame";
import { WordRocketGame } from "@/components/game/WordRocketGame";
import { ChoiceGame } from "@/components/game/ChoiceGame";
import { HuntGame } from "@/components/game/HuntGame";
import { OrderGame } from "@/components/game/OrderGame";
import { MemoryGame } from "@/components/game/MemoryGame";
import { WordSearchGame } from "@/components/game/WordSearchGame";
import { TracingGame } from "@/components/game/TracingGame";
import { WordTracingGame } from "@/components/game/WordTracingGame";
import { FlashCards } from "@/components/game/FlashCards";
import { StoryReader } from "@/components/game/StoryReader";
import { StoryBuilder } from "@/components/game/StoryBuilder";
import { RewardScreen } from "@/components/game/RewardScreen";
import { GAMES, gameById } from "@/lib/catalog";
import { themeForGame } from "@/lib/game-themes";
import { checkBadges, recordSession, useProfile } from "@/lib/profile";
import { L, title as tTitle } from "@/lib/i18n";

export const Route = createFileRoute("/game/$gameId")({
  head: ({ params }) => {
    const game = gameById(params.gameId);
    const title = game ? `${game.title} — Totland` : "Play a game — Totland";
    const description = game
      ? `${game.title}: a short, playful ${game.skill} game for ages 2–6 with gentle feedback and no timers.`
      : "A short, playful Totland learning game with gentle feedback and no timers.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `https://totland.app/game/${params.gameId}` },
        { property: "og:image", content: "https://totland.app/og-image.jpg" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: "https://totland.app/og-image.jpg" },
      ],
      links: [{ rel: "canonical", href: `https://totland.app/game/${params.gameId}` }],
      scripts: game
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Game",
                name: `${game.title} — Totland`,
                description,
                url: `https://totland.app/game/${params.gameId}`,
                applicationCategory: "EducationalGame",
                operatingSystem: "Web, iOS, Android",
                isFamilyFriendly: true,
                audience: { "@type": "PeopleAudience", suggestedMinAge: 2, suggestedMaxAge: 6 },
              }),
            },
          ]
        : [],
    };
  },
  component: GameHost,
});

function GameHost() {
  const { gameId } = useParams({ from: "/game/$gameId" });
  const { profile, update } = useProfile();
  const [key, setKey] = useState(0);
  const [stars, setStars] = useState<number | null>(null);

  const game = gameById(gameId);
  if (!game) {
    return (
      <PlayFrame title={L("Game not found", "Juego no encontrado")}>
        <p className="font-ui text-lg text-ink">{L("That game isn't here. Tap the house to go home.", "Ese juego no está aquí. Toca la casita para volver.")}</p>
      </PlayFrame>
    );
  }

  const locked = game.premium && !profile.premium;
  const theme = themeForGame(game.id);

  const finish = (earned: number, accuracy = 1) => {
    update((p) =>
      checkBadges(
        recordSession(p, game.id, { stars: earned, accuracy, minutes: game.minutes }),
      ),
    );
    setStars(earned);
  };

  const restart = () => {
    setStars(null);
    setKey((k) => k + 1);
  };

  if (locked) {
    return (
      <PlayFrame title={tTitle(game.title)}>
        <div className="rounded-3xl bg-card p-6 text-center wood-block">
          <p className="text-6xl">🔒</p>
          <p className="mt-3 font-ui text-xl font-bold text-ink">{L("This game is part of Totland Premium", "Este juego es parte de Totland Premium")}</p>
          <p className="mt-2 font-ui text-sm text-inksoft">{L("A grown-up can unlock it from the parent area.", "Un adulto puede desbloquearlo en el área de familia.")}</p>
        </div>
      </PlayFrame>
    );
  }

  const engine = game.engine;

  return (
    <PlayFrame title={tTitle(game.title)}>
      {stars !== null ? (
        <RewardScreen stars={stars} onAgain={restart} />
      ) : engine === "fishing" ? (
        <LetterFishingGame key={key} kind={game.kind} skill={game.skill} rounds={game.rounds} theme={theme} onFinish={finish} />
      ) : engine === "monster" ? (
        <FeedTheLetterMonsterGame key={key} kind={game.kind} skill={game.skill} rounds={game.rounds} theme={theme} onFinish={finish} />
      ) : engine === "rocket" ? (
        <WordRocketGame key={key} kind={game.kind} skill={game.skill} theme={theme} onFinish={finish} />
      ) : engine === "hunt" ? (
        <HuntGame key={key} kind={game.kind} skill={game.skill} theme={theme} onFinish={finish} />
      ) : engine === "order" ? (
        <OrderGame key={key} kind={game.kind} skill={game.skill} theme={theme} onFinish={finish} />
      ) : engine === "memory" ? (
        <MemoryGame key={key} kind={game.kind} theme={theme} onFinish={finish} />
      ) : engine === "wordsearch" ? (
        <WordSearchGame key={key} kind={game.kind} onFinish={finish} />
      ) : engine === "tracing" && /^words[2-5]$/.test(game.kind) ? (
        <WordTracingGame key={key} length={Number(game.kind.slice(-1)) as 2 | 3 | 4 | 5} onFinish={finish} />
      ) : engine === "tracing" ? (
        <TracingGame key={key} kind={game.kind} onFinish={finish} />
      ) : engine === "flashcards" ? (
        <FlashCards key={key} onFinish={finish} />
      ) : engine === "story" ? (
        <StoryReader key={key} onFinish={finish} />
      ) : engine === "storybuilder" ? (
        <StoryBuilder key={key} onFinish={finish} />
      ) : (
        <ChoiceGame
          key={key}
          skill={game.skill}
          kind={game.kind}
          rounds={game.rounds}
          theme={theme}
          onFinish={finish}
        />
      )}
      <p className="mt-4 text-center font-ui text-xs text-inksoft">
        {L(`Game ${game.number} of ${GAMES.length}`, `Juego ${game.number} de ${GAMES.length}`)} · {tTitle(game.objective)}
      </p>
    </PlayFrame>
  );
}
