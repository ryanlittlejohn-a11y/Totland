import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

const TITLE = "Educational Games for 3 Year Olds: A Parent's Guide";
const DESCRIPTION =
  "What 3 year olds are ready to learn — colors, shapes, counting to five, matching and first letters — and how to choose educational games that keep it gentle and fun.";
const URL = "https://totland.app/guides/learning-games-for-3-year-olds";

export const Route = createFileRoute("/guides/learning-games-for-3-year-olds")({
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
          Three year olds learn by naming, sorting and matching the world around them. They point at
          colors, count fingers and love finding "the same one." Good educational games for this age
          build on that curiosity in tiny, playful steps — with no reading required.
        </p>
      </section>

      <section>
        <h2>What 3 year olds are ready to learn</h2>
        <ul>
          <li><strong>Colors.</strong> Naming and sorting red, blue, yellow and friends.</li>
          <li><strong>Shapes.</strong> Spotting circles, squares and triangles in everyday things.</li>
          <li><strong>Counting small groups.</strong> Touching and counting up to about five objects.</li>
          <li><strong>Simple matching.</strong> Finding pairs and grouping things that belong together.</li>
          <li><strong>First letters.</strong> Recognizing a few letters, often the ones in their own name.</li>
        </ul>
      </section>

      <section>
        <h2>What to look for in a game for this age</h2>
        <ul>
          <li><strong>Everything spoken aloud.</strong> Three year olds can't read prompts.</li>
          <li><strong>Big, easy taps.</strong> Large targets and few choices at once.</li>
          <li><strong>No timers or failure screens.</strong> Gentle hints instead of buzzers.</li>
          <li><strong>Very short rounds.</strong> A few minutes, with a clear happy ending.</li>
          <li><strong>No ads or links out.</strong> Nothing that can lead a child away.</li>
        </ul>
      </section>

      <section>
        <h2>Games that fit 3 year olds in Totland</h2>
        <p>
          <Link to="/play/$area" params={{ area: "colors" }}>Colors</Link> and{" "}
          <Link to="/play/$area" params={{ area: "shapes" }}>Shapes</Link> cover naming, sorting and
          building.
        </p>
        <p>
          <Link to="/play/$area" params={{ area: "numbers" }}>Numbers</Link> starts with counting
          small groups, and{" "}
          <Link to="/play/$area" params={{ area: "memory" }}>Matching &amp; Memory</Link> has easy
          picture pairs.
        </p>
        <p>
          When letters start to interest them,{" "}
          <Link to="/play/$area" params={{ area: "letters" }}>ABC &amp; Phonics</Link> introduces
          letter names with spoken prompts.
        </p>
      </section>

      <section>
        <h2>Keep it playful</h2>
        <p>
          Play together when you can, and say the color, shape or number out loud with your child.
          For younger
          toddlers, see our{" "}
          <Link to="/guides/learning-games-for-2-year-olds">guide to learning games for 2 year olds</Link>.
          When they're ready for more, see our{" "}
          <Link to="/guides/learning-games-for-4-year-olds">guide to learning games for 4 year olds</Link>{" "}
          or the broader{" "}
          <Link to="/guides/toddler-learning-games">guide to toddler learning games</Link>.
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
