import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../components/LegalPage";

export const Route = createFileRoute("/delete-account")({
  head: () => ({
    meta: [
      { title: "Delete Your Totland Account" },
      {
        name: "description",
        content:
          "How to delete your Totland grown-up account and its saved child profiles, in the app or by emailing support.",
      },
      { property: "og:title", content: "Delete Your Totland Account" },
      {
        property: "og:description",
        content: "Request deletion of your Totland account and data, with or without the app installed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://totland.app/delete-account" }],
  }),
  component: DeleteAccountPage,
});

function DeleteAccountPage() {
  return (
    <LegalPage
      title="How to Delete Your Totland Account and Saved Child Profiles"
      updated="October 17, 2026"
      spanishNote
    >
      <section>
        <h2>If you have the app</h2>
        <p>
          Open Totland, go to the grown-up area, sign in, then open Subscription and choose
          “Delete account”. Deletion happens straight away.
        </p>
      </section>
      <section>
        <h2>If you don't have the app</h2>
        <p>
          Email <a href="mailto:support@totland.app?subject=Delete%20my%20Totland%20account">support@totland.app</a>{" "}
          from the email address you signed in with, and ask us to delete your account. We'll confirm
          once it's done.
        </p>
      </section>
      <section>
        <h2>What gets deleted</h2>
        <p>
          Your grown-up account, the child profiles saved to it, your subscription record with us and
          support messages you sent while signed in. Play progress stored only on a device stays on
          that device. Deleting your account does not cancel an App Store or Google Play subscription
          — cancel that in the store.
        </p>
      </section>
    </LegalPage>
  );
}
