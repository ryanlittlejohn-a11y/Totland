import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

const TITLE = "Toddler Learning Games: A Parent's Guide for Ages 2–6";
const DESCRIPTION =
  "How to pick toddler learning games that actually teach: what to look for by age, how long a session should be, and how phonics games and letter tracing games fit in.";
const URL = "https://totland.app/guides/toddler-learning-games";

export const Route = createFileRoute("/guides/toddler-learning-games")({
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
    <LegalPage title={TITLE} updated="September 17, 2026">
      <section>
        <p>
          Toddler learning games work best when they feel like play, not school. Between ages 2 and 6 a
          child is building letter awareness, number sense, color and shape vocabulary, and the fine
          motor control that later becomes handwriting. The right game gives them one small idea at a
          time, praises the attempt, and ends before attention runs out.
        </p>
      </section>

      <section>
        <h2>What makes a good toddler learning game</h2>
        <ul>
          <li>
            <strong>One idea per round.</strong> "Find the letter B" beats a screen full of competing
            choices.
          </li>
          <li>
            <strong>Short sessions.</strong> Two to six minutes suits a toddler; preschoolers manage a
            little longer.
          </li>
          <li>
            <strong>Spoken prompts.</strong> Pre-readers need to hear the question, not read it.
          </li>
          <li>
            <strong>Kind mistakes.</strong> A gentle "keep trying" keeps a child in the game; a buzzer
            ends it.
          </li>
          <li>
            <strong>No ads, no links out.</strong> Anything that can interrupt a 3-year-old will.
          </li>
        </ul>
      </section>

      <section>
        <h2>Learning games by age</h2>
        <p>
          <strong>Ages 2–3:</strong> colors, shapes, counting to five, first picture words, and simple
          matching. Tapping and dragging are the only skills needed.
        </p>
        <p>
          <strong>Ages 3–4:</strong> letter recognition, counting to ten with countable objects,
          memory pairs, and beginning sounds — the start of phonics games.
        </p>
        <p>
          <strong>Ages 4–6:</strong> letter tracing games, first spelling, word finds, and read-along
          storybooks that build early reading confidence.
        </p>
      </section>

      <section>
        <h2>Phonics games: hearing sounds before reading words</h2>
        <p>
          Phonics starts with the ear. Before a child can sound out a word, they need to notice that
          "ball" and "bear" begin with the same sound. Good phonics games say the sound aloud, show two
          or three pictures, and let the child choose — then repeat the sound whether they got it right
          or not.
        </p>
        <p>
          In Totland this lives in{" "}
          <Link to="/play/$area" params={{ area: "letters" }}>
            ABC &amp; Phonics
          </Link>{" "}
          and{" "}
          <Link to="/play/$area" params={{ area: "phonics" }}>
            Beginning Sounds
          </Link>
          .
        </p>
      </section>

      <section>
        <h2>Letter tracing games: the bridge to handwriting</h2>
        <p>
          Tracing with a finger builds the same muscle memory as a pencil, with none of the
          frustration. Look for big strokes, a clear starting dot, and forgiving accuracy — a toddler's
          line will wobble, and that is fine. Practise a handful of letters at a time rather than the
          whole alphabet.
        </p>
        <p>
          Totland's{" "}
          <Link to="/play/$area" params={{ area: "tracing" }}>
            Letter Tracing
          </Link>{" "}
          games cover capitals and lowercase with spoken letter names as the child draws.
        </p>
      </section>

      <section>
        <h2>How much screen time is reasonable?</h2>
        <p>
          Quality matters more than the clock, but a simple rule helps: one short, finishable session
          a day, ideally alongside a grown-up who can say the letter or number out loud too. Totland's
          adventures are built as five little games so there is a natural stopping point.
        </p>
      </section>

      <section>
        <h2>Try it</h2>
        <p>
          Totland is an ad-free set of toddler learning games for ages 2–6 — ABCs, numbers, colors,
          shapes, first words, phonics, letter tracing, word finds and storybooks.{" "}
          <Link to="/">Start playing</Link>, or read about{" "}
          <Link to="/privacy">how we handle your family's data</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
