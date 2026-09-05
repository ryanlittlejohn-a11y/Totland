import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../components/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Notice | Totland" },
      {
        name: "description",
        content:
          "How Totland collects, uses, and protects personal data. Child play data stays on the device; only parent account data is processed.",
      },
      { property: "og:title", content: "Privacy Notice | Totland" },
      {
        property: "og:description",
        content:
          "How Totland collects, uses, and protects personal data. Child play data stays on the device.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage title="Privacy Notice" updated="September 5, 2026">
      <section>
        <h2>1. Who we are</h2>
        <p>
          Totland is operated by Ryan Littlejohn, an individual based in
          Texas, United States. For the purposes of applicable data
          protection laws, Ryan Littlejohn is the data controller of the
          personal data described in this notice.
        </p>
        <p>
          Totland is designed privacy-first for children: all gameplay,
          progress, rewards, and learning profiles are stored locally on the
          device and are never transmitted to us. We do not knowingly collect
          any personal data from children. The only personal data we process
          belongs to the parent or guardian who creates an account to manage
          a subscription.
        </p>
      </section>

      <section>
        <h2>2. Data we collect</h2>
        <ul>
          <li>
            <strong>Account data (parents):</strong> email address and
            authentication credentials when you create a parent account,
            including sign-in via Google if you choose it.
          </li>
          <li>
            <strong>Subscription data:</strong> your subscription status,
            plan, billing period dates, and Paddle customer and subscription
            identifiers, so we can activate and maintain your Premium access.
            Payment card details are collected and processed by Paddle, not
            by us.
          </li>
          <li>
            <strong>Support messages:</strong> if you contact us, we receive
            the content of your message and your contact details.
          </li>
          <li>
            <strong>Technical data:</strong> basic device and log information
            (such as IP address and error logs) needed to keep the service
            secure and running.
          </li>
        </ul>
        <p>
          We do not collect children&rsquo;s names, ages, voice recordings,
          photos, gameplay history, or usage analytics from the child
          experience.
        </p>
      </section>

      <section>
        <h2>3. Why we use it (purposes and legal bases)</h2>
        <ul>
          <li>
            <strong>Creating and managing your account</strong> &mdash;
            performance of our contract with you.
          </li>
          <li>
            <strong>Providing Premium access</strong>, including verifying
            your subscription status and restoring purchases &mdash;
            performance of our contract with you.
          </li>
          <li>
            <strong>Security and fraud prevention</strong> &mdash; our
            legitimate interest in keeping the service safe.
          </li>
          <li>
            <strong>Customer support</strong> &mdash; our legitimate interest
            in responding to your requests.
          </li>
          <li>
            <strong>Legal and tax obligations</strong> &mdash; compliance
            with laws that apply to us.
          </li>
        </ul>
        <p>
          We do not use your data for advertising, and we do not send
          marketing emails without your consent.
        </p>
      </section>

      <section>
        <h2>4. Who we share data with</h2>
        <ul>
          <li>
            <strong>Paddle (Merchant of Record):</strong> Paddle processes
            the sale of Totland Premium, including payments, subscription
            management, tax compliance, and invoicing. See{" "}
            <a
              href="https://www.paddle.com/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Paddle&rsquo;s privacy policy
            </a>
            .
          </li>
          <li>
            <strong>Service providers:</strong> hosting, authentication, and
            database providers that process data on our behalf under
            contract, solely to operate the service.
          </li>
          <li>
            <strong>Professional advisers</strong> (legal, accounting) where
            necessary.
          </li>
          <li>
            <strong>Authorities</strong> where disclosure is required by law.
          </li>
        </ul>
        <p>We never sell personal data.</p>
      </section>

      <section>
        <h2>5. International transfers</h2>
        <p>
          Our service providers (including Paddle and our hosting providers)
          may process data outside your state or country, including in the
          United States and other jurisdictions. Where required, transfers
          are protected by appropriate safeguards such as standard
          contractual clauses or adequacy decisions.
        </p>
      </section>

      <section>
        <h2>6. Retention</h2>
        <p>
          We keep your account and subscription data for as long as your
          account is active and as needed to meet legal, tax, and accounting
          obligations. When data is no longer needed, it is deleted or
          anonymised. Child play data lives only on your device and is
          removed when you delete the app or clear its data.
        </p>
      </section>

      <section>
        <h2>7. Your rights</h2>
        <p>
          Depending on where you live (including under US state privacy laws
          such as the Texas Data Privacy and Security Act, and the GDPR for
          UK/EEA users), you may have the right to:
        </p>
        <ul>
          <li>access the personal data we hold about you;</li>
          <li>correct inaccurate data;</li>
          <li>delete your data;</li>
          <li>restrict or object to certain processing;</li>
          <li>data portability;</li>
          <li>withdraw consent where processing is based on consent;</li>
          <li>
            lodge a complaint with a supervisory authority or your state
            attorney general.
          </li>
        </ul>
        <p>
          To exercise any of these rights, contact us through the app&rsquo;s
          parent section. We respond to verified requests within one month
          (or the period required by applicable law).
        </p>
      </section>

      <section>
        <h2>8. Security</h2>
        <p>
          We use appropriate technical and organisational measures to protect
          personal data, including encryption in transit, access controls,
          and row-level security on our databases. Payment data is handled by
          Paddle under PCI-DSS-compliant processes.
        </p>
      </section>

      <section>
        <h2>9. Cookies and local storage</h2>
        <p>
          Totland uses essential storage only: local storage on your device
          to keep you signed in and to save children&rsquo;s progress and
          settings. We do not use analytics or marketing cookies or
          third-party trackers. You can clear this storage at any time
          through your browser settings.
        </p>
      </section>

      <section>
        <h2>10. Changes and contact</h2>
        <p>
          We may update this notice from time to time and will post the new
          version here with an updated date. For privacy questions or
          requests, contact us through the app&rsquo;s parent section.
        </p>
      </section>
    </LegalPage>
  );
}
