import { APP_STORE_LIVE, APP_STORE_URL, PLAY_STORE_LIVE, PLAY_STORE_URL } from "@/lib/app-links";
import { L } from "@/lib/i18n";
import { isNativeApp } from "@/lib/native";

/**
 * "Get the app" card for the Parent Dashboard. Shows a real Apple/Google
 * download button once a store listing is live, and a calm "in review"
 * state before that — never a dead/broken link either way.
 */
export function GetTheAppCard() {
  // Website-only: inside the packaged app (iOS or Android) this card would
  // advertise another store (App Review 2.3.10), so it is not rendered at all.
  if (isNativeApp()) return null;
  if (!APP_STORE_LIVE && !PLAY_STORE_LIVE) {
    return (
      <section className="rounded-3xl bg-card p-5 wood-block">
        <h2 className="font-ui text-lg font-bold text-ink">{L("Get the app", "Descarga la app")}</h2>
        <p className="mt-1 text-sm text-inksoft">
          {L(
            "Totland's app is in review with Apple and Google right now. We'll light up each button the moment it's live — no action needed, just check back here.",
            "La app de Totland está en revisión con Apple y Google. Activaremos cada botón en cuanto esté disponible; no tienes que hacer nada, solo vuelve a mirar aquí.",
          )}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 rounded-xl bg-felt px-3 py-2 text-xs font-semibold text-inksoft ring-1 ring-border">
            🍎 Apple App Store — {L("in review", "en revisión")}
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl bg-felt px-3 py-2 text-xs font-semibold text-inksoft ring-1 ring-border">
            ▶️ Google Play — {L("in review", "en revisión")}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-card p-5 wood-block">
      <h2 className="font-ui text-lg font-bold text-ink">{L("Get the app", "Descarga la app")}</h2>
      <p className="mt-1 text-sm text-inksoft">{L("Download Totland to play on your phone or tablet. Offline play comes with Premium.", "Descarga Totland para jugar en tu móvil o tableta. Jugar sin conexión viene con Premium.")}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {APP_STORE_LIVE && (
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-night px-4 py-2.5 font-ui text-sm font-semibold text-cream"
          >
            🍎 {L("Download on the App Store", "Descargar en el App Store")}
          </a>
        )}
        {PLAY_STORE_LIVE && PLAY_STORE_URL && (
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-night px-4 py-2.5 font-ui text-sm font-semibold text-cream"
          >
            ▶️ {L("Get it on Google Play", "Disponible en Google Play")}
          </a>
        )}
      </div>
    </section>
  );
}
