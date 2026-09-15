import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../components/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Notice | Totland" },
      {
        name: "description",
        content:
          "How Totland collects, uses, and protects personal data. Child play data stays on the device unless a parent chooses to sync it to their account.",
      },
      { property: "og:title", content: "Privacy Notice | Totland" },
      {
        property: "og:description",
        content:
          "How Totland collects, uses, and protects personal data, including voice, contact messages and subscriptions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://totland.app/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage title="Privacy Notice" updated="September 15, 2026">
      <section>
        <h2>1. Who we are</h2>
        <p>
          Totland is operated by Ryan Littlejohn, an individual based in
          Texas, United States. For the purposes of applicable data
          protection laws, Ryan Littlejohn is the data controller of the
          personal data described in this notice.
        </p>
        <p>
          Totland is designed privacy-first for children. There are no child
          accounts, no advertising, and no third-party tracking. Gameplay,
          progress, rewards, and learning profiles are stored on the device by
          default. The only data that leaves the device is described below.
        </p>
      </section>

      <section>
        <h2>2. Data we collect</h2>
        <ul>
          <li>
            <strong>Account data (parents):</strong> email address and
            authentication details when you create a parent account, including
            sign-in with Google or Apple if you choose it. We ask you to verify
            your email address.
          </li>
          <li>
            <strong>Child profiles, only if you sync them:</strong> if you are
            signed in and use family profiles, the nickname, age and learning
            progress you entered for each child are saved to your parent
            account so your devices stay in step. This is optional &mdash; if
            you never sign in, child profiles stay on the device only. Please
            use a nickname rather than a full name.
          </li>
          <li>
            <strong>Subscription data:</strong> your subscription status, plan,
            billing period dates, and the customer and subscription identifiers
            from Paddle or, for in-app purchases, Apple via RevenueCat, so we
            can activate and maintain your Premium access. Payment card details
            are collected and processed by Paddle or Apple, not by us.
          </li>
          <li>
            <strong>Support messages:</strong> if you use the contact form or
            email us, we store and receive your name, email address and the
            content of your message.
          </li>
          <li>
            <strong>Spoken text for the voice:</strong> to speak a line aloud
            in our narrated voice, the wording of that line (and the language)
            is sent to our speech provider, which returns the audio. The audio
            is saved and reused, so the same line is never sent twice. No
            microphone is used and no child&rsquo;s voice is ever recorded or
            transmitted.
          </li>
          <li>
            <strong>Technical data:</strong> basic device and log information
            (such as IP address and error logs) needed to keep the service
            secure and running, plus anonymous crash and performance reports
            (error text and timing) that contain no personal or child data.
          </li>
        </ul>
        <p>
          We do not collect children&rsquo;s full names, voice recordings,
          photos, contact details, or advertising identifiers, and we do not
          run usage analytics inside the child experience.
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
            <strong>Syncing child profiles you choose to save</strong> &mdash;
            performance of our contract with you.
          </li>
          <li>
            <strong>Generating spoken narration</strong> &mdash; performance of
            our contract with you and our legitimate interest in an accessible,
            pre-reader-friendly app.
          </li>
          <li>
            <strong>Security, crash reporting and fraud prevention</strong>{" "}
            &mdash; our legitimate interest in keeping the service safe and
            working.
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
            <strong>Paddle (Merchant of Record, website purchases):</strong>{" "}
            Paddle processes the sale of Totland Premium bought on the website,
            including payments, subscription management, tax compliance, and
            invoicing. See{" "}
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
            <strong>Apple and RevenueCat (in-app purchases):</strong> purchases
            made in the iPhone or iPad app are sold by Apple; RevenueCat helps
            us confirm your entitlement so Premium unlocks on your devices.
          </li>
          <li>
            <strong>Our speech provider:</strong> receives the text to be
            spoken and the language, as described above.
          </li>
          <li>
            <strong>Email delivery:</strong> confirmations, account emails and
            support notifications are sent from our notify.totland.app sending
            domain through our email provider.
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
          Our service providers may process data outside your state or
          country, including in the United States and other jurisdictions.
          Where required, transfers are protected by appropriate safeguards
          such as standard contractual clauses or adequacy decisions.
        </p>
      </section>

      <section>
        <h2>6. Retention</h2>
        <p>
          We keep your account, synced child profiles and subscription data for
          as long as your account is active and as needed to meet legal, tax,
          and accounting obligations. Support messages are kept while we handle
          your request and for a reasonable period afterwards. Generated voice
          audio is stored as reusable files keyed to the wording spoken, and
          contains no information about who listened to it. Child play data
          stored on the device is removed when you delete the app or clear its
          data.
        </p>
      </section>

      <section>
        <h2>7. Deleting your account</h2>
        <p>
          You can delete your account yourself at any time: open the app, go to
          Parents &rarr; Subscription &rarr; Your account, and confirm. This
          permanently removes your account, any synced child profiles and your
          subscription record. If a subscription is still billing, cancel it
          first with Paddle or Apple, since deleting your account here does not
          cancel billing held by them. You can also ask us to delete your data
          through the <a href="/contact">contact page</a>.
        </p>
      </section>

      <section>
        <h2>8. Your rights</h2>
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
          To exercise any of these rights, use our{" "}
          <a href="/contact">contact page</a> or email{" "}
          <a href="mailto:Support@totland.app">Support@totland.app</a>. We
          respond to verified requests within one month (or the period required
          by applicable law).
        </p>
      </section>

      <section>
        <h2>9. Security</h2>
        <p>
          We use appropriate technical and organisational measures to protect
          personal data, including encryption in transit, access controls,
          private storage, and row-level security on our databases. Payment
          data is handled by Paddle or Apple under their own compliant
          processes.
        </p>
      </section>

      <section>
        <h2>10. Cookies and local storage</h2>
        <p>
          Totland uses essential storage only: local storage on your device
          to keep you signed in and to save children&rsquo;s progress and
          settings, and a local cache of downloaded voice audio and activity
          content so the app works quickly and offline with Premium. We do not
          use analytics or marketing cookies or third-party trackers. You can
          clear this storage at any time through your browser or device
          settings.
        </p>
      </section>

      <section>
        <h2>11. Changes and contact</h2>
        <p>
          We may update this notice from time to time and will post the new
          version here with an updated date. For privacy questions or
          requests, use our <a href="/contact">contact page</a> or email{" "}
          <a href="mailto:Support@totland.app">Support@totland.app</a>.
        </p>
      </section>
    </LegalPage>
  );
}
