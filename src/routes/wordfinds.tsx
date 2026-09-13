import { createFileRoute, Link } from "@tanstack/react-router";
import { PlayFrame } from "@/components/PlayFrame";
import { useProfile } from "@/lib/profile";
import { FREE_WORD_FINDS, WORD_FIND_THEMES } from "@/lib/wordfinds";
import { L, title as tTitle } from "@/lib/i18n";

const TITLE = "Word Finds — 100 Swipe-to-Find Puzzles | Totland";
const DESC =
  "100 gentle word find puzzles for little kids: swipe a finger across each hidden word, with pictures beside every word and friendly voice praise.";

export const Route = createFileRoute("/wordfinds")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://totland.app/wordfinds" },
      { property: "og:image", content: "https://totland.app/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://totland.app/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://totland.app/wordfinds" }],
  }),
  component: WordFindsPage,
});

function WordFindsPage() {
  const { profile } = useProfile();
  const done = profile.wordFinds ?? [];

  return (
    <PlayFrame title={L("Word Finds", "Sopa de letras")}>
      <p className="font-ui text-sm text-inksoft">
        {L(
          `100 puzzles. The first ${FREE_WORD_FINDS} are free to play again and again.`,
          `100 juegos. Los primeros ${FREE_WORD_FINDS} son gratis y se pueden repetir.`,
        )}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {WORD_FIND_THEMES.map((th, i) => {
          const locked = i >= FREE_WORD_FINDS && !profile.premium;
          const finished = done.includes(th.id);
          return (
            <Link
              key={th.id}
              to={locked ? "/parent/subscription" : "/wordfind/$themeId"}
              params={locked ? {} : { themeId: th.id }}
              className="rounded-3xl bg-card p-3 wood-block active:translate-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl" aria-hidden>
                  {locked ? "🔒" : th.emoji}
                </span>
                <span className="font-ui text-xs text-inksoft">#{i + 1}</span>
              </div>
              <p className="mt-1 font-ui text-sm font-bold leading-tight text-ink">{tTitle(th.title)}</p>
              <p className="font-ui text-xs text-inksoft">
                {locked ? L("Premium", "Premium") : finished ? L("✓ Done", "✓ Listo") : L("Play", "Jugar")}
              </p>
            </Link>
          );
        })}
      </div>
    </PlayFrame>
  );
}
