import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

const TITLE = "Learning Games for 2 Year Olds: A Parent's Guide";
const DESCRIPTION =
  "What 2 year olds are ready to learn — first words, animal sounds, colors and cause and effect — and how to choose gentle, ad-free learning games for very young toddlers.";
const URL = "https://totland.app/guides/learning-games-for-2-year-olds";

export const Route = createFileRoute("/guides/learning-games-for-2-year-olds")({
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
          Two year olds are explorers. They learn by tapping, listening and seeing what happens next.
          At this age a "learning game" should feel like play: one big picture, one friendly voice,
          and a happy response to every tap.
        </p>
      </section>

      <section>
        <h2>What 2 year olds are ready to learn</h2>
        <ul>
          <li><strong>First words.</strong> Hearing names for animals, foods and everyday things.</li>
          <li><strong>Sounds.</strong> Animal sounds and simple songs build listening skills.</li>
          <li><strong>Colors.</strong> Hearing color names, long before they can name them reliably.</li>
          <li><strong>Cause and effect.</strong> "I tap, something happens" is a big idea at two.</li>
          <li><strong>Early matching.</strong> Finding the same picture among two or three.</li>
        </ul>
      </section>

      <section>
        <h2>What to look for in a game for this age</h2>
        <ul>
          <li><strong>Spoken everything.</strong> No reading, no text instructions.</li>
          <li><strong>Very few choices.</strong> Two or three big targets at a time.</li>
          <li><strong>No wrong-answer penalties.</strong> Every tap should get a kind response.</li>
          <li><strong>Very short sessions.</strong> A few minutes, ideally with a grown-up nearby.</li>
          <li><strong>No ads or links out.</strong> Nothing a curious tap can wander into.</li>
        </ul>
      </section>

      <section>
        <h2>Games that fit 2 year olds in Totland</h2>
        <p>
          <Link to="/play/$area" params={{ area: "colors" }}>Colors</Link> introduces color names
          with spoken prompts, and{" "}
          <Link to="/play/$area" params={{ area: "memory" }}>Matching &amp; Memory</Link> starts with
          easy picture pairs.
        </p>
        <p>
          <Link to="/play/$area" params={{ area: "shapes" }}>Shapes</Link> and{" "}
          <Link to="/play/$area" params={{ area: "numbers" }}>Numbers</Link> begin with big, simple
          rounds that grow as your child does.
        </p>
      </section>

      <section>
        <h2>Play together</h2>
        <p>
          At two, the best screen time is shared. Name what's on the screen, copy the sounds, and
          stop while it's still fun. As your child grows, see our{" "}
          <Link to="/guides/learning-games-for-3-year-olds">guide to educational games for 3 year olds</Link>{" "}
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
