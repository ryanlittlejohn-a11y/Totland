import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../components/LegalPage";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Refund Policy | Totland" },
      {
        name: "description",
        content:
          "Totland offers a 30-day money-back guarantee on Premium subscriptions, processed by Paddle.",
      },
      { property: "og:title", content: "Refund Policy | Totland" },
      {
        property: "og:description",
        content:
          "Totland offers a 30-day money-back guarantee on Premium subscriptions, processed by Paddle.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <LegalPage title="Refund Policy" updated="September 5, 2026">
      <section>
        <h2>30-day money-back guarantee</h2>
        <p>
          We want Totland to be right for your family. If you&rsquo;re not
          satisfied with your purchase, you can request a full refund within
          30 days of your order date &mdash; no questions asked.
        </p>
      </section>

      <section>
        <h2>How to request a refund</h2>
        <p>
          Refunds are processed by our payment provider and Merchant of
          Record, Paddle. To request a refund:
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
        <h2>Cancelling a subscription</h2>
        <p>
          You can cancel your Totland Premium subscription at any time
          through Paddle&rsquo;s customer portal at paddle.net. When you
          cancel, your Premium access continues until the end of the current
          paid billing period, and you will not be charged again.
        </p>
      </section>

      <section>
        <h2>Questions</h2>
        <p>
          For billing and refund questions, contact Paddle at paddle.net. For
          anything else about Totland, reach us through the contact options
          in the app&rsquo;s parent section.
        </p>
      </section>
    </LegalPage>
  );
}
