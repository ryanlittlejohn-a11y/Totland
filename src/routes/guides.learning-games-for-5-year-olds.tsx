import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

const TITLE = "Learning Games for 5 Year Olds: A Parent's Guide";
const DESCRIPTION =
  "What 5 year olds can practise through play — sounding out short words, spelling, tracing, counting to 20 and story listening — and how to choose learning games that fit.";
const URL = "https://totland.app/guides/learning-games-for-5-year-olds";

export const Route = createFileRoute("/guides/learning-games-for-5-year-olds")({
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
          Many 5 year olds are starting kindergarten or getting close. They often know most letter
          names and sounds and can count past ten, and they are ready to put those pieces together:
          blending sounds into short words, writing a few letters, and following a simple story.
          Every child moves at their own pace — short, playful practice helps without pressure.
        </p>
      </section>

      <section>
        <h2>What 5 year olds can practise</h2>
        <ul>
          <li>
            <strong>Sounding out short words.</strong> Three-letter words like "cat" and "sun" are a
            natural next step after beginning sounds.
          </li>
          <li>
            <strong>First spelling.</strong> Building a word from its letters links sounds to writing.
          </li>
          <li>
            <strong>Tracing letters and words.</strong> Finger tracing practises letter shapes before
            and alongside the pencil.
          </li>
          <li>
            <strong>Numbers to 20.</strong> Counting, putting numbers in order and spotting what comes
            next.
          </li>
          <li>
            <strong>Listening to stories.</strong> Read-along books build vocabulary and the habit of
            following words on a page.
          </li>
        </ul>
      </section>

      <section>
        <h2>What to look for in a game</h2>
        <ul>
          <li>Spoken prompts, so a child who isn't reading yet can still play.</li>
          <li>Short rounds with a clear end, rather than endless play.</li>
          <li>Gentle feedback on mistakes — no buzzers, no timers.</li>
          <li>No ads or links that lead away from the game.</li>
        </ul>
      </section>

      <section>
        <h2>Where to find these in Totland</h2>
        <p>
          <Link to="/play/$area" params={{ area: "phonics" }}>Beginning Sounds</Link> and{" "}
          <Link to="/play/$area" params={{ area: "words" }}>First Words</Link> cover sounds and
          early spelling.{" "}
          <Link to="/play/$area" params={{ area: "tracing" }}>Letter Tracing</Link> covers capital and
          lowercase letters.{" "}
          <Link to="/play/$area" params={{ area: "numbers" }}>Numbers 1–20</Link> has counting and
          number-order games.
        </p>
        <p>
          <Link to="/play/$area" params={{ area: "wordsearch" }}>Word Search</Link> offers small,
          gentle grids, and <Link to="/play/$area" params={{ area: "stories" }}>Storybooks</Link> are
          read aloud as your child follows along.
        </p>
      </section>

      <section>
        <h2>Keeping it light</h2>
        <p>
          One short game a day, ideally with a grown-up nearby to say the word or number out loud too,
          is plenty. For younger children, see our{" "}
          <Link to="/guides/learning-games-for-4-year-olds">guide to learning games for 4 year olds</Link> or the{" "}
          <Link to="/guides/toddler-learning-games">guide to educational games for toddlers</Link>.
        </p>
      </section>

      <section>
        <h2>Try it</h2>
        <p>
          Totland is an ad-free set of learning games for ages 2–6. <Link to="/">Start playing</Link>,
          or read about <Link to="/privacy">how we handle your family's data</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
