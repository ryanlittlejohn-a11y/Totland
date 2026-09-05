import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../components/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions | Totland" },
      {
        name: "description",
        content:
          "Terms and conditions for using Totland, the toddler learning adventure app by Ryan Littlejohn.",
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
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage title="Terms &amp; Conditions" updated="September 5, 2026">
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
          puzzles, flash cards, tracing, and storybooks that teach letters,
          numbers, colors, shapes, and early reading. Accounts and
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
        <h2>3. Your account</h2>
        <p>
          You are responsible for maintaining the confidentiality of your
          account credentials and for all activity that occurs under your
          account. You agree to provide accurate information when registering
          and to keep it up to date. Children&rsquo;s play profiles are stored
          locally on the device and are not accounts.
        </p>
      </section>

      <section>
        <h2>4. License and acceptable use</h2>
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
        <h2>5. Intellectual property</h2>
        <p>
          We retain all ownership of the Service and its intellectual
          property, including the software, games, characters, artwork, audio,
          documentation, and branding. Nothing in these terms transfers any
          ownership to you.
        </p>
      </section>

      <section>
        <h2>6. Payments and subscriptions</h2>
        <p>
          Totland Premium is offered as a monthly or yearly subscription. Our
          order process is conducted by our online reseller Paddle.com.
          Paddle.com is the Merchant of Record for all our orders. Paddle
          provides all customer service inquiries and handles returns.
        </p>
        <p>
          Payment, billing, taxes, subscription renewal, and cancellation
          mechanics are governed by{" "}
          <a
            href="https://www.paddle.com/legal/checkout-buyer-terms"
            target="_blank"
            rel="noopener noreferrer"
          >
            Paddle&rsquo;s Buyer Terms
          </a>
          . Subscriptions renew automatically at the selected billing
          frequency until cancelled. You can manage or cancel your
          subscription through Paddle&rsquo;s customer portal at paddle.net;
          cancellation takes effect at the end of the current paid billing
          period, and you keep Premium access until that period ends.
        </p>
      </section>

      <section>
        <h2>7. Refunds</h2>
        <p>
          Refunds are handled according to our{" "}
          <a href="/refund">Refund Policy</a>, which offers a 30-day
          money-back guarantee processed by Paddle.
        </p>
      </section>

      <section>
        <h2>8. Service level</h2>
        <p>
          The Service is provided &ldquo;as is&rdquo; and &ldquo;as
          available.&rdquo; We do not guarantee that the Service will be
          uninterrupted, timely, secure, or error-free, and we may modify or
          discontinue features with reasonable notice where practicable.
        </p>
      </section>

      <section>
        <h2>9. Disclaimers and limitation of liability</h2>
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
        <h2>10. Suspension and termination</h2>
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
        <h2>11. General</h2>
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
          Questions about these terms can be sent to us through the contact
          options provided in the app&rsquo;s parent section, or to Paddle
          for billing-related inquiries via paddle.net.
        </p>
      </section>
    </LegalPage>
  );
}
