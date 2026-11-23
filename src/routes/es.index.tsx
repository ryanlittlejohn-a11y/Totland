import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useProfile } from "@/lib/profile";
import { webOnlyBeforeLoad } from "@/lib/web-only-route";
import { Home, homeHead } from "./index";

/**
 * Spanish home (/es). The URL, not the saved profile, decides the language of the page
 * (see useUrlLanguage in __root.tsx). A brand-new visitor who has not picked a language
 * yet gets Spanish saved as their choice, so the app they open next is Spanish too;
 * anyone who has already chosen a language keeps it.
 */
export const Route = createFileRoute("/es/")({
  beforeLoad: webOnlyBeforeLoad,
  head: () => homeHead("es"),
  component: EsHome,
});

function EsHome() {
  const { profile, update, hydrated } = useProfile();
  useEffect(() => {
    if (hydrated && !profile.languageChosen) {
      update((p) => ({ ...p, language: "es", languageChosen: true }));
    }
  }, [hydrated, profile.languageChosen, update]);
  return <Home />;
}
