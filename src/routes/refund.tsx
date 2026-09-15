import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../components/LegalPage";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Refund Policy | Totland" },
      {
        name: "description",
        content:
          "Totland offers a 30-day money-back guarantee on website Premium purchases through Paddle; App Store purchases are refunded by Apple.",
      },
      { property: "og:title", content: "Refund Policy | Totland" },
      {
        property: "og:description",
        content:
          "How to get a refund or cancel Totland Premium, whether you bought on the website or in the App Store.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://totland.app/refund" }],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <LegalPage title="Refund Policy" updated="September 15, 2026">
      <section>
        <h2>Which path applies to you</h2>
        <p>
          It depends on where you bought Totland Premium. If you subscribed on
          the website, your purchase was handled by Paddle. If you subscribed
          inside the iPhone or iPad app, your purchase was handled by Apple.
          Your receipt email tells you which one it was.
        </p>
      </section>

      <section>
        <h2>Website purchases: 30-day money-back guarantee</h2>
        <p>
          We want Totland to be right for your family. If you&rsquo;re not
          satisfied with a purchase made on the website, you can request a
          full refund within 30 days of your order date &mdash; no questions
          asked. Refunds are processed by our payment provider and Merchant of
          Record, Paddle. To request one:
        </p>
        <ul>
          <li>
            Visit{" "}
            <a
              href="https://paddle.net"
              target="_blank"
              rel="noopener noreferrer"
            >
              paddle.net
            </a>{" "}
            and look up your purchase using the email address you used at
            checkout, or
          </li>
          <li>
            reply to your Paddle order receipt email and ask for a refund.
          </li>
        </ul>
        <p>
          Approved refunds are returned to your original payment method.
          Processing time depends on your bank or card issuer.
        </p>
      </section>

      <section>
        <h2>App Store purchases: refunds from Apple</h2>
        <p>
          Purchases made inside the iPhone or iPad app are sold by Apple, so
          Apple handles refunds and we cannot issue them on your behalf.
          Request a refund at{" "}
          <a
            href="https://reportaproblem.apple.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            reportaproblem.apple.com
          </a>{" "}
          using the Apple Account that made the purchase. Apple applies its own
          refund rules and timelines.
        </p>
      </section>

      <section>
        <h2>Cancelling a subscription</h2>
        <p>
          You can cancel at any time. Website subscriptions are cancelled in
          Paddle&rsquo;s customer portal at paddle.net. App Store subscriptions
          are cancelled on your device in Settings &rarr; your name &rarr;
          Subscriptions. Either way, your Premium access continues until the
          end of the current paid billing period, and you will not be charged
          again.
        </p>
      </section>

      <section>
        <h2>Questions</h2>
        <p>
          For billing questions, contact Paddle at paddle.net or Apple,
          depending on where you purchased. For anything else about Totland,
          use our <a href="/contact">contact page</a> or email{" "}
          <a href="mailto:Support@totland.app">Support@totland.app</a>.
        </p>
      </section>
    </LegalPage>
  );
}
