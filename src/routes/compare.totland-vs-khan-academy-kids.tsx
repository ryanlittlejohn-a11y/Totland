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

const TITLE = "Totland vs Khan Academy Kids: an honest comparison";
const DESCRIPTION =
  "Khan Academy Kids is free with no ads for ages 2 to 8. Totland is bilingual, with tracing and printables for ages 2 to 6. What's different?";
const URL = "https://totland.app/compare/totland-vs-khan-academy-kids";
const KHAN_SOURCE = "https://apps.apple.com/ca/app/id1378467217?l=en-ca";

export const Route = createFileRoute("/compare/totland-vs-khan-academy-kids")({
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
  component: Compare,
});

const FAQ: { q: string; a: string }[] = [
  {
    q: "Is Totland free?",
    a: `Totland has free games plus optional Premium (${TOTLAND_PRICE_YEARLY} a year or ${TOTLAND_PRICE_MONTHLY} a month; ${TOTLAND_PRICE_NOTE}).`,
  },
  { q: "Is Totland ad-free?", a: "Yes. Totland has no ads." },
  {
    q: "Does my child need an account?",
    a: "No. Children never sign in. A grown-up account is only for the subscription.",
  },
  {
    q: "Is Totland available in Spanish?",
    a: "Yes. The whole app, including narration, is in English and Spanish.",
  },
];

function Compare() {
  if (inNativeApp()) return null;
  return (
    <LegalPage title={TITLE} updated={LAST_CHECKED}>
      <ComparisonIntro />

      <section>
        <p>
          Khan Academy Kids is free, has no ads and no subscription, and covers ages 2 to 8. If a
          free, broad library is what you want, it is an excellent choice, and we say so even though
          we make Totland. This page is about what&rsquo;s different, so you can decide.
        </p>
      </section>

      <section>
        <h2>At a glance</h2>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full border-collapse text-left text-sm">
            <caption className="sr-only">Totland and Khan Academy Kids, side by side</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="py-2 pr-3" />
                <th scope="col" className="py-2 pr-3">
                  Khan Academy Kids
                </th>
                <th scope="col" className="py-2">
                  Totland
                </th>
              </tr>
            </thead>
            <tbody className="align-top">
              <tr className="border-b border-border">
                <th scope="row" className="py-2 pr-3 font-semibold">
                  Price
                </th>
                <td className="py-2 pr-3">Free</td>
                <td className="py-2">
                  Free games plus optional Premium ({TOTLAND_PRICE_YEARLY} a year or{" "}
                  {TOTLAND_PRICE_MONTHLY} a month)
                </td>
              </tr>
              <tr className="border-b border-border">
                <th scope="row" className="py-2 pr-3 font-semibold">
                  Ads
                </th>
                <td className="py-2 pr-3">No ads</td>
                <td className="py-2">No ads</td>
              </tr>
              <tr className="border-b border-border">
                <th scope="row" className="py-2 pr-3 font-semibold">
                  Child accounts
                </th>
                <td className="py-2 pr-3">&mdash;</td>
                <td className="py-2">Children never sign in</td>
              </tr>
              <tr className="border-b border-border">
                <th scope="row" className="py-2 pr-3 font-semibold">
                  Languages
                </th>
                <td className="py-2 pr-3">English, with Spanish read-aloud storybooks</td>
                <td className="py-2">The whole app in English and Spanish</td>
              </tr>
              <tr className="border-b border-border">
                <th scope="row" className="py-2 pr-3 font-semibold">
                  Ages
                </th>
                <td className="py-2 pr-3">2 to 8</td>
                <td className="py-2">About 2 to 6</td>
              </tr>
              <tr className="border-b border-border">
                <th scope="row" className="py-2 pr-3 font-semibold">
                  Printables
                </th>
                <td className="py-2 pr-3">&mdash;</td>
                <td className="py-2">
                  Free samples, more with Premium (
                  <Link to="/free-printables">try the free sheets</Link>)
                </td>
              </tr>
              <tr>
                <th scope="row" className="py-2 pr-3 font-semibold">
                  Offline
                </th>
                <td className="py-2 pr-3">&mdash;</td>
                <td className="py-2">A Premium feature</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground">
          Khan Academy Kids facts are {AS_OF}, from its{" "}
          <SourceLink href={KHAN_SOURCE}>App Store listing</SourceLink>. Totland{" "}
          <Link to="/pricing">prices</Link>: {TOTLAND_PRICE_NOTE}. A dash means we haven&rsquo;t
          verified that point here.
        </p>
      </section>

      <section>
        <h2>Where Totland is different</h2>
        <ul>
          <li>Built around very short play sessions with spoken prompts.</li>
          <li>The whole app, including narration, in English and Spanish.</li>
          <li>Letter and number tracing, plus printable tracing sheets.</li>
          <li>A calm mode with softer sounds and less animation.</li>
          <li>No accounts for children (a grown-up account is only for the subscription).</li>
        </ul>
      </section>

      <section>
        <h2>Where Khan Academy Kids is stronger</h2>
        <p>
          It&rsquo;s free, has a larger library and a wider age range (2 to 8), and comes from a
          nonprofit organisation.
        </p>
      </section>

      <section>
        <h2>Who should pick which</h2>
        <p>
          Pick Khan Academy Kids if you want a free library for a wide age range. Pick Totland if
          you want a bilingual app with tracing and printables for ages 2 to 6, and a small yearly
          price is fine.
        </p>
      </section>

      <section>
        <h2>Questions about Totland</h2>
        {FAQ.map((f) => (
          <div key={f.q}>
            <h3 className="mt-4 font-semibold text-foreground">{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}
      </section>

      <section>
        <h2>Sources</h2>
        <ul>
          <li>
            <SourceLink href={KHAN_SOURCE}>Khan Academy Kids, App Store listing</SourceLink> (
            {AS_OF})
          </li>
          <li>
            Totland&rsquo;s own <Link to="/pricing">pricing page</Link>.
          </li>
        </ul>
        <p>
          More options:{" "}
          <Link to="/best/ad-free-toddler-learning-apps">
            best ad-free learning apps for toddlers and preschoolers
          </Link>
          .
        </p>
      </section>
    </LegalPage>
  );
}
