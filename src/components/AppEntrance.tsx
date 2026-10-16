import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

import { CHARACTERS } from "@/lib/content";
import { setLang, type Lang } from "@/lib/i18n";
import { isNativeApp } from "@/lib/native";
import { useProfile } from "@/lib/profile";
import { storageSettled } from "@/lib/storage";

/** Grown-up, legal and guide pages open straight away — no intro, no popup. */
const NO_INTRO = ["/terms", "/privacy", "/refund", "/contact", "/guides", "/auth", "/parent", "/lovable", "/api"];
export const skipsIntro = (path: string) => NO_INTRO.some((p) => path.startsWith(p));

const MIN_MS = 1500;
const SEEN_KEY = "totland.entrance.seen";

/**
 * Opening animation shown on a fresh app launch (once per browser session on
 * the web). It covers the saved-progress load, then hands over to the
 * first-time language popup when no language has been chosen yet.
 */
export function AppEntrance() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [phase, setPhase] = useState<"intro" | "leaving" | "done">(() => (skipsIntro(path) ? "done" : "intro"));
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    let alive = true;
    void storageSettled.then(() => alive && setSettled(true));
    if (phase !== "intro") return () => void (alive = false);
    let seen = false;
    try {
      seen = !isNativeApp() && sessionStorage.getItem(SEEN_KEY) === "1";
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* storage unavailable */
    }
    if (seen) {
      setPhase("done");
      return () => void (alive = false);
    }
    const minimum = new Promise((r) => setTimeout(r, MIN_MS));
    void Promise.all([minimum, storageSettled]).then(() => alive && setPhase((p) => (p === "intro" ? "leaving" : p)));
    return () => void (alive = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== "leaving") return;
    const t = setTimeout(() => setPhase("done"), 350);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <>
      {phase !== "done" && (
        <div
          className={`app-entrance ${phase === "leaving" ? "app-entrance--leaving" : ""}`}
          role="presentation"
          onClick={() => setPhase("leaving")}
        >
          <div className="app-entrance__buddies" aria-hidden>
            {CHARACTERS.map((c, i) => (
              <span key={c.id} className="app-entrance__buddy" style={{ animationDelay: `${i * 0.12}s` }}>
                {c.emoji}
              </span>
            ))}
          </div>
          <p className="app-entrance__title font-ui">
            Totland <span className="app-entrance__star" aria-hidden>⭐</span>
          </p>
        </div>
      )}
      {phase === "done" && settled && !skipsIntro(path) && <LanguagePicker />}
    </>
  );
}

function LanguagePicker() {
  const { profile, update, hydrated } = useProfile();
  if (!hydrated || profile.languageChosen) return null;
  const choose = (language: Lang) => {
    setLang(language);
    update((p) => ({ ...p, language, languageChosen: true }));
  };
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-night/60 px-5" role="dialog" aria-modal="true" aria-labelledby="lang-title">
      <div className="w-full max-w-sm rounded-[2rem] bg-card p-6 text-center wood-block anim-pop">
        <p className="text-4xl" aria-hidden>🌍</p>
        <h2 id="lang-title" className="mt-2 font-ui text-xl font-bold text-ink">
          Choose a language · Elige un idioma
        </h2>
        <p className="mt-2 text-sm text-inksoft">
          You can change this anytime in the Parent Dashboard.
          <br />
          <span lang="es">Puedes cambiarlo cuando quieras en el Panel para adultos.</span>
        </p>
        <div className="mt-5 grid gap-3">
          <button type="button" onClick={() => choose("en")} className="rounded-2xl bg-clay py-4 font-ui text-lg font-bold text-primary-foreground wood-block active:translate-y-1">
            English
          </button>
          <button type="button" lang="es" onClick={() => choose("es")} className="rounded-2xl bg-sky py-4 font-ui text-lg font-bold text-night wood-block active:translate-y-1">
            Español
          </button>
        </div>
      </div>
    </div>
  );
}
