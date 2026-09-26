import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../components/LegalPage";
import { WORD_FIND_THEMES } from "@/lib/wordfinds";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions | Totland" },
      {
        name: "description",
        content:
          "Terms and conditions for using Totland, the toddler learning adventure app by Ryan Littlejohn, including subscriptions, Apple purchases and account deletion.",
      },
      { property: "og:title", content: "Terms & Conditions | Totland" },
      {
        property: "og:description",
        content:
          "Terms and conditions for using Totland, the toddler learning adventure app.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://totland.app/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage title="Terms &amp; Conditions" updated="September 15, 2026">
      <section>
        <h2>1. Who we are</h2>
        <p>
          Totland is operated by Ryan Littlejohn, an individual seller based in
          Texas, United States (&ldquo;we&rdquo;, &ldquo;us&rdquo;, the
          &ldquo;Seller&rdquo;). By creating an account, purchasing a
          subscription, or continuing to use Totland (the
          &ldquo;Service&rdquo;), you agree to these Terms &amp; Conditions.
          If you do not agree, please do not use the Service.
        </p>
        <p>
          Totland is a play-based educational app for toddlers and
          preschoolers (approximately ages 2&ndash;6), offering mini-games,
          puzzles, word finds, flash cards, tracing, and storybooks that teach
          letters, numbers, colors, shapes, and early reading. Accounts and
          subscriptions are purchased and managed by a parent or legal
          guardian; children use the app under adult supervision and never
          create accounts themselves.
        </p>
      </section>

      <section>
        <h2>2. Eligibility and authority</h2>
        <p>
          You must be at least 18 years old (or the age of legal majority in
          your jurisdiction) to create an account or purchase a subscription.
          If you use the Service on behalf of an organization, you represent
          that you have authority to bind that organization to these terms.
        </p>
      </section>

      <section>
        <h2>3. Your account and child profiles</h2>
        <p>
          You are responsible for maintaining the confidentiality of your
          account credentials and for all activity that occurs under your
          account. You agree to provide accurate information when registering
          and to keep it up to date. You can sign in with an email address,
          Google, or Apple, and we require your email address to be verified
          before subscription features are enabled.
        </p>
        <p>
          Children&rsquo;s play profiles are not accounts. They are stored on
          the device, and if you are signed in they can optionally be synced
          to your parent account so several devices in the family stay in
          step. You are responsible for the nicknames and ages you enter for
          your children and should avoid entering unnecessary personal
          details.
        </p>
      </section>

      <section>
        <h2>4. Free and Premium features</h2>
        <p>
          Totland can be used free of charge with a set of free activities,
          including the first 30 Word Find puzzles, which can be replayed as
          often as you like. The free version requires an internet connection
          to play.
        </p>
        <p>Totland Premium unlocks:</p>
        <ul>
          <li>all {WORD_FIND_THEMES.length} Word Find puzzles;</li>
          <li>the premium learning worlds and their activities;</li>
          <li>
            offline play, so activities continue to work without an internet
            connection.
          </li>
        </ul>
        <p>
          We may add, change, or retire individual activities over time; the
          overall nature of the Service will remain a learning app for young
          children.
        </p>
      </section>

      <section>
        <h2>5. License and acceptable use</h2>
        <p>
          We grant you a limited, non-exclusive, non-transferable,
          non-sublicensable license to access and use the Service for
          personal, non-commercial educational use within your subscription
          plan. You must not misuse the Service, including by:
        </p>
        <ul>
          <li>using the Service for any unlawful purpose;</li>
          <li>fraud, spam, or deceptive practices;</li>
          <li>infringing intellectual-property rights of any party;</li>
          <li>
            interfering with the Service&rsquo;s security or operation,
            including introducing malware, probing or scanning for
            vulnerabilities, or scraping content;
          </li>
          <li>
            reverse engineering the Service, reselling or redistributing it,
            or circumventing technical limits or the parental gate.
          </li>
        </ul>
      </section>

      <section>
        <h2>6. Intellectual property and content you add</h2>
        <p>
          We retain all ownership of the Service and its intellectual
          property, including the software, games, puzzles, characters,
          artwork, audio, documentation, and branding. Nothing in these terms
          transfers any ownership to you.
        </p>
        <p>
          Where the Service lets you add your own material &mdash; for example
          in the Content Studio in the parent area &mdash; you keep ownership
          of what you add, and you confirm that you have the right to use it
          and that it is appropriate for young children. You grant us
          permission to store and display that material inside your own copy
          of the app so the Service can function. We may remove material that
          breaches these terms.
        </p>
      </section>

      <section>
        <h2>7. Payments and subscriptions</h2>
        <p>
          Totland Premium is offered as a monthly or yearly subscription.
          Where you buy it determines who sells it to you:
        </p>
        <ul>
          <li>
            <strong>On the website:</strong> our order process is conducted by
            our online reseller Paddle.com. Paddle.com is the Merchant of
            Record for those orders and handles billing, tax, invoicing and
            returns. Payment, billing, taxes, renewal, and cancellation
            mechanics are governed by{" "}
            <a
              href="https://www.paddle.com/legal/checkout-buyer-terms"
              target="_blank"
              rel="noopener noreferrer"
            >
              Paddle&rsquo;s Buyer Terms
            </a>
            . You can manage or cancel through Paddle&rsquo;s customer portal
            at paddle.net.
          </li>
          <li>
            <strong>In the iPhone or iPad app:</strong> the purchase is made
            through Apple&rsquo;s in-app purchase system. Apple is the seller
            for those purchases, the charge appears on your Apple account, and
            billing, renewal, cancellation and refunds are handled by Apple
            through your device&rsquo;s subscription settings.
          </li>
        </ul>
        <p>
          Subscriptions renew automatically at the selected billing frequency
          until cancelled. Cancellation takes effect at the end of the current
          paid billing period, and you keep Premium access until that period
          ends.
        </p>
      </section>

      <section>
        <h2>8. Refunds</h2>
        <p>
          Refunds are handled according to our{" "}
          <a href="/refund">Refund Policy</a>: a 30-day money-back guarantee
          processed by Paddle for website purchases, and Apple&rsquo;s refund
          process for purchases made in the iPhone or iPad app.
        </p>
      </section>

      <section>
        <h2>9. App Clip</h2>
        <p>
          On supported Apple devices, a small App Clip may open a short free
          sample activity without installing the full app and without signing
          in. The App Clip collects no account information and is provided for
          demonstration only; these terms apply to it in the same way.
        </p>
      </section>

      <section>
        <h2>10. Service level</h2>
        <p>
          The Service is provided &ldquo;as is&rdquo; and &ldquo;as
          available.&rdquo; We do not guarantee that the Service will be
          uninterrupted, timely, secure, or error-free, and we may modify or
          discontinue features with reasonable notice where practicable.
        </p>
      </section>

      <section>
        <h2>11. Disclaimers and limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, we disclaim all implied
          warranties, including merchantability and fitness for a particular
          purpose. Educational content is provided for general learning and
          play; it is not a substitute for professional educational,
          medical, or developmental advice.
        </p>
        <p>
          To the fullest extent permitted by law, we are not liable for
          indirect, incidental, consequential, or special damages (including
          loss of profits, data, or goodwill), and our aggregate liability is
          capped at the fees you paid for the Service in the 12 months
          preceding the claim. Nothing in these terms limits liability for
          fraud, death, or personal injury caused by negligence, or any
          liability that cannot be limited by law.
        </p>
      </section>

      <section>
        <h2>12. Deleting your account</h2>
        <p>
          You can delete your account at any time from Parents &rarr;
          Subscription &rarr; Your account inside the app. Deletion is
          permanent and removes your account, any synced child profiles, and
          your subscription record from our systems. If a subscription is
          still billing, cancel it first with Paddle (website purchases) or
          Apple (in-app purchases), because deleting your account here does
          not cancel billing held by them.
        </p>
      </section>

      <section>
        <h2>13. Suspension and termination</h2>
        <p>
          We may suspend or terminate your access to the Service if you
          materially breach these terms, fail to pay amounts due, present a
          security or fraud risk, or repeatedly or seriously violate our
          policies. When access ends, your right to use the Service stops
          immediately; locally stored child progress remains on your device,
          and subscription records are retained as described in the Privacy
          Notice.
        </p>
      </section>

      <section>
        <h2>14. General</h2>
        <p>
          You may not assign these terms without our consent; we may assign
          them in connection with a merger, acquisition, or sale of assets.
          We are not liable for delays or failures caused by events beyond
          our reasonable control. These terms are governed by the laws of the
          State of Texas, United States, without regard to conflict-of-laws
          principles, and the courts located in Texas will have exclusive
          jurisdiction over disputes, except where applicable consumer law
          provides otherwise.
        </p>
        <p>
          Questions about these terms can be sent through our{" "}
          <a href="/contact">contact page</a> or by email to{" "}
          <a href="mailto:Support@totland.app">Support@totland.app</a>. Billing
          questions go to Paddle via paddle.net (website purchases) or to Apple
          (in-app purchases).
        </p>
      </section>
    </LegalPage>
  );
}
