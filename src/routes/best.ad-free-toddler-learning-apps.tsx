import { createFileRoute, Link } from "@tanstack/react-router";
import { ComparisonIntro, SourceLink } from "@/components/ComparisonPage";
import { LegalPage } from "@/components/LegalPage";
import {
  AS_OF,
  LAST_CHECKED,
  LAST_CHECKED_ISO,
  TOTLAND_PRICE_MONTHLY,
  TOTLAND_PRICE_NOTE,
  TOTLAND_PRICE_YEARLY,
} from "@/lib/comparison-facts";
import { inNativeApp, webOnlyBeforeLoad } from "@/lib/web-only-route";

const TITLE = "Best ad-free learning apps for toddlers and preschoolers (2026)";
const DESCRIPTION =
  "Seven ad-free learning apps for young children, checked against their official listings in November 2026: what each costs, which ages, which languages.";
const URL = "https://totland.app/best/ad-free-toddler-learning-apps";

export const Route = createFileRoute("/best/ad-free-toddler-learning-apps")({
  beforeLoad: webOnlyBeforeLoad,
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
          datePublished: "2026-11-10",
          dateModified: LAST_CHECKED_ISO,
          author: { "@type": "Organization", name: "Totland" },
          publisher: { "@type": "Organization", name: "Totland" },
        }),
      },
    ],
  }),
  component: Roundup,
});

function Roundup() {
  if (inNativeApp()) return null;
  return (
    <LegalPage title={TITLE} updated={LAST_CHECKED}>
      <ComparisonIntro />

      <section>
        <p>
          &ldquo;Ad-free&rdquo; can mean different things: no ads for anyone, or no ads only for
          paying subscribers. We only list apps whose official listing says there are no ads for
          everyone who uses them. Here&rsquo;s what to look at when choosing: age range, language,
          whether it&rsquo;s free or subscription, and how long a session feels natural for your
          child.
        </p>
        <p>
          Listed alphabetically; this is not a ranking. Facts below are {AS_OF}, from the linked
          sources.
        </p>
      </section>

      <section>
        <h2>Endless Learning Academy (ages 2 to 6+)</h2>
        <p>
          Vocabulary and early learning with animated words. The listing says &ldquo;100% free of
          advertisements and offers.&rdquo; Free to download, with a 7-day trial and paid plans (see
          the listing for current prices). Limit: English only. ({AS_OF}, per the linked listing.){" "}
          <SourceLink href="https://apps.apple.com/au/app/id1034523226?l=en-au">Source</SourceLink>
        </p>
      </section>

      <section>
        <h2>HOMER (ages 2 to 8)</h2>
        <p>
          Reading and learning programme with a monthly membership. The listing says &ldquo;Safe,
          Ad-Free.&rdquo; Limit: English only, and prices vary by storefront. ({AS_OF}, per the
          linked listing.){" "}
          <SourceLink href="https://apps.apple.com/no/app/id601437586?l=no">Source</SourceLink>
        </p>
      </section>

      <section>
        <h2>Khan Academy Kids (ages 2 to 8)</h2>
        <p>
          Free, no ads, no subscriptions, from a nonprofit. Includes read-aloud storybooks in
          English or Spanish. Limit: the app itself is listed in English only. ({AS_OF}, per the
          linked listing.){" "}
          <SourceLink href="https://apps.apple.com/ca/app/id1378467217?l=en-ca">Source</SourceLink>.
          See our{" "}
          <Link to="/compare/totland-vs-khan-academy-kids">
            Totland vs Khan Academy Kids comparison
          </Link>
          .
        </p>
      </section>

      <section>
        <h2>Lingokids (ages 2 to 8)</h2>
        <p>
          Play-and-learn lessons. The listing says it is designed to be ad-free. The basic version
          has 10 free games; the full version is a subscription (website Plus is $13.49 a month or
          $161.88 a year). Limit: most content needs the paid plan. ({AS_OF}, per the linked
          listing.){" "}
          <SourceLink href="https://apps.apple.com/be/app/lingokids/id1002043426">
            App listing
          </SourceLink>{" "}
          and{" "}
          <SourceLink href="https://help.lingokids.com/hc/en-us/articles/115005120505-Lingokids-Plus-Pricing-Currency">
            pricing page
          </SourceLink>
        </p>
      </section>

      <section>
        <h2>Starfall (Pre-K to Grade 5)</h2>
        <p>
          Reading and math. &ldquo;No advertisements,&rdquo; for free users and subscribers alike.
          Subscription listed at $5.99 a month. Limit: English only. ({AS_OF}, per the linked
          listing.){" "}
          <SourceLink href="https://apps.apple.com/ru/app/starfall/id707189889">Source</SourceLink>
        </p>
      </section>

      <section>
        <h2>Teach Your Monster to Read (ages 3 to 6)</h2>
        <p>
          Phonics games, no in-game adverts and no in-app purchases, listed as a paid download.
          Limit: English only, and it focuses on reading, not numbers or shapes. ({AS_OF}, per the
          linked listing.){" "}
          <SourceLink href="https://apps.apple.com/gb/app/id828392046?l=en-gb">Source</SourceLink>
        </p>
      </section>

      <section>
        <h2>Totland (about ages 2 to 6)</h2>
        <p>
          Letters, numbers, shapes, tracing, word finds, puzzles and storybooks, fully in English
          and Spanish, no ads, no chat, no child accounts. Free games plus optional Premium (
          {TOTLAND_PRICE_YEARLY} a year, or {TOTLAND_PRICE_MONTHLY} a month; {TOTLAND_PRICE_NOTE}).
          Limit: a smaller library than the big apps, and it&rsquo;s built for ages 2 to 6. We make
          Totland, so weigh this entry accordingly.
        </p>
      </section>

      <section>
        <h2>How to choose in three questions</h2>
        <ul>
          <li>Is bilingual important?</li>
          <li>Do you want free-only, or is a subscription OK?</li>
          <li>Is your child under 4 or closer to 6?</li>
        </ul>
        <p>
          Want a closer look at one of them? Read{" "}
          <Link to="/compare/totland-vs-khan-academy-kids">Totland vs Khan Academy Kids</Link>.
        </p>
      </section>

      <section>
        <h2>Sources</h2>
        <ul>
          <li>
            <SourceLink href="https://apps.apple.com/au/app/id1034523226?l=en-au">
              Endless Learning Academy
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://apps.apple.com/no/app/id601437586?l=no">HOMER</SourceLink>
          </li>
          <li>
            <SourceLink href="https://apps.apple.com/ca/app/id1378467217?l=en-ca">
              Khan Academy Kids
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://apps.apple.com/be/app/lingokids/id1002043426">
              Lingokids listing
            </SourceLink>
            ,{" "}
            <SourceLink href="https://help.lingokids.com/hc/en-us/articles/115005120505-Lingokids-Plus-Pricing-Currency">
              Lingokids Plus pricing
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://apps.apple.com/ru/app/starfall/id707189889">
              Starfall
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://apps.apple.com/gb/app/id828392046?l=en-gb">
              Teach Your Monster to Read
            </SourceLink>
          </li>
          <li>Totland: this site&rsquo;s own pricing and product pages.</li>
        </ul>
      </section>
    </LegalPage>
  );
}
