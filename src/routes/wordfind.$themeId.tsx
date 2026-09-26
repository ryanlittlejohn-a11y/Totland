import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { PlayFrame } from "@/components/PlayFrame";
import { WordFindGame } from "@/components/game/WordFindGame";
import { RewardScreen } from "@/components/game/RewardScreen";
import { useProfile } from "@/lib/profile";
import { FREE_WORD_FINDS, themeById, themeIndex, WORD_FIND_THEMES } from "@/lib/wordfinds";
import { L, title as tTitle } from "@/lib/i18n";

export const Route = createFileRoute("/wordfind/$themeId")({
  head: ({ params }) => {
    const th = themeById(params.themeId) ?? WORD_FIND_THEMES[0]!;
    const title = `${th.title} Word Find — Totland`;
    const description = `A gentle ${th.title.toLowerCase()} word find for little kids: swipe across each hidden word and hear friendly praise.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `https://totland.app/wordfind/${params.themeId}` },
        { property: "og:image", content: "https://totland.app/og-image.jpg" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: "https://totland.app/og-image.jpg" },
      ],
      links: [{ rel: "canonical", href: `https://totland.app/wordfind/${params.themeId}` }],
    };
  },
  component: WordFindPage,
});

function WordFindPage() {
  const { themeId } = useParams({ from: "/wordfind/$themeId" });
  const { profile } = useProfile();
  const [key, setKey] = useState(0);
  const [stars, setStars] = useState<number | null>(null);

  const theme = themeById(themeId) ?? WORD_FIND_THEMES[0]!;
  const locked = themeIndex(theme.id) >= FREE_WORD_FINDS && !profile.premium;

  if (locked) {
    return (
      <PlayFrame title={tTitle(theme.title)}>
        <div className="rounded-3xl bg-card p-6 text-center wood-block">
          <p className="text-4xl">🔒</p>
          <p className="mt-3 font-ui text-lg font-bold text-ink">{L("Premium puzzle", "Juego premium")}</p>
          <p className="mt-1 font-ui text-sm text-inksoft">
            {L(
              `The first ${FREE_WORD_FINDS} word finds are free. Unlock all ${WORD_FIND_THEMES.length} with Totland Premium.`,
              `Los primeros ${FREE_WORD_FINDS} juegos son gratis. Desbloquea los ${WORD_FIND_THEMES.length} con Totland Premium.`,
            )}
          </p>
          <Link
            to="/parent/subscription"
            search={{ checkout: undefined }}
            className="mt-4 inline-block rounded-2xl bg-clay px-5 py-3 font-ui font-bold text-card wood-block"
          >
            {L("Grown-ups: unlock", "Adultos: desbloquear")}
          </Link>
        </div>
      </PlayFrame>
    );
  }

  return (
    <PlayFrame title={tTitle(theme.title)}>
      {stars !== null ? (
        <RewardScreen
          stars={stars}
          onAgain={() => {
            setStars(null);
            setKey((k) => k + 1);
          }}
        />
      ) : (
        <WordFindGame key={key} theme={theme} onFinish={setStars} />
      )}
    </PlayFrame>
  );
}
