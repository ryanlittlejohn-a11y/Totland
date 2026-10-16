import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

const TITLE = "Learning Games for 4 Year Olds: A Parent's Guide";
const DESCRIPTION =
  "What 4 year olds are ready to learn before kindergarten — letter sounds, tracing, counting to 20 and first words — and how to pick learning games that build those skills gently.";
const URL = "https://totland.app/guides/learning-games-for-4-year-olds";

export const Route = createFileRoute("/guides/learning-games-for-4-year-olds")({
  head: () => ({
    meta: [
      { title: `${TITLE} | Totland` },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:image", content: "https://totland.app/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://totland.app/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: TITLE,
          description: DESCRIPTION,
          mainEntityOfPage: URL,
          inLanguage: "en",
          image: ["https://totland.app/og-image.jpg"],
          datePublished: "2026-10-16",
          dateModified: "2026-10-16",
          author: { "@type": "Organization", name: "Totland" },
          publisher: { "@type": "Organization", name: "Totland" },
        }),
      },
    ],
  }),
  component: Guide,
});

function Guide() {
  return (
    <LegalPage title={TITLE} updated="October 16, 2026">
      <section>
        <p>
          Four is a busy year. Most 4 year olds know many letter names and can count a handful of
          objects, and they are starting to notice that words are made of sounds. The year before
          kindergarten is a good time to turn those pieces into early reading and number skills —
          through short, playful games rather than worksheets.
        </p>
      </section>

      <section>
        <h2>What 4 year olds are ready to learn</h2>
        <ul>
          <li>
            <strong>Letter sounds, not just names.</strong> Hearing that "sun" starts with /s/ is the
            first step of phonics.
          </li>
          <li>
            <strong>Tracing letters.</strong> Big finger strokes build the muscle memory that later
            becomes handwriting.
          </li>
          <li>
            <strong>Counting further.</strong> Moving from five toward 20, counting real objects and
            putting numbers in order.
          </li>
          <li>
            <strong>First words.</strong> Matching short picture words and spotting missing letters.
          </li>
          <li>
            <strong>Memory and patterns.</strong> Matching pairs and "what comes next" puzzles train
            attention and early logic.
          </li>
        </ul>
      </section>

      <section>
        <h2>What to look for in a game for this age</h2>
        <ul>
          <li>
            <strong>Spoken prompts.</strong> Most 4 year olds can't read instructions yet, so the game
            should say them aloud.
          </li>
          <li>
            <strong>Difficulty that grows.</strong> A game should get a little harder as your child
            gets things right, and ease off when they don't.
          </li>
          <li>
            <strong>Gentle mistakes.</strong> "Try another one" keeps a child playing; a buzzer makes
            them quit.
          </li>
          <li>
            <strong>Short, finishable sessions.</strong> Five to ten minutes with a clear end.
          </li>
          <li>
            <strong>No ads or links out.</strong> Nothing that can lead a child away from the game.
          </li>
        </ul>
      </section>

      <section>
        <h2>Games that fit 4 year olds in Totland</h2>
        <p>
          <Link to="/play/$area" params={{ area: "phonics" }}>Beginning Sounds</Link> asks which
          picture starts with a sound, and{" "}
          <Link to="/play/$area" params={{ area: "letters" }}>ABC &amp; Phonics</Link> covers letter
          recognition and sounds.
        </p>
        <p>
          <Link to="/play/$area" params={{ area: "tracing" }}>Letter Tracing</Link> has capitals and
          lowercase letters, with the letter name spoken as your child draws.
        </p>
        <p>
          <Link to="/play/$area" params={{ area: "numbers" }}>Numbers 1–20</Link> includes counting,
          number order and "what comes next" games, and{" "}
          <Link to="/play/$area" params={{ area: "words" }}>First Words</Link> builds early spelling.
        </p>
        <p>
          <Link to="/play/$area" params={{ area: "memory" }}>Matching &amp; Memory</Link> and{" "}
          <Link to="/play/$area" params={{ area: "puzzles" }}>Puzzles</Link> round things out with
          pairs and patterns.
        </p>
      </section>

      <section>
        <h2>Getting ready for kindergarten</h2>
        <p>
          Short and regular beats long and rare. One game a day, played alongside a grown-up who
          repeats the sound or number out loud, does more than an hour once a week. For younger
          siblings, see our{" "}
          <Link to="/guides/learning-games-for-3-year-olds">guide to educational games for 3 year olds</Link> or the{" "}
          <Link to="/guides/toddler-learning-games">guide to toddler learning games for ages 2–6</Link>. Looking ahead? Read our{" "}
          <Link to="/guides/learning-games-for-5-year-olds">guide to learning games for 5 year olds</Link>.
        </p>
      </section>

      <section>
        <h2>Try it</h2>
        <p>
          Totland is an ad-free set of learning games for ages 2–6 — ABCs, phonics, letter tracing,
          numbers, first words and storybooks. <Link to="/">Start playing</Link>, or read about{" "}
          <Link to="/privacy">how we handle your family's data</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
