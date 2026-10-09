import { APP_STORE_LIVE, APP_STORE_URL, PLAY_STORE_LIVE, PLAY_STORE_URL } from "@/lib/app-links";

/**
 * "Get the app" card for the Parent Dashboard. Shows a real Apple/Google
 * download button once a store listing is live, and a calm "in review"
 * state before that — never a dead/broken link either way.
 */
export function GetTheAppCard() {
  if (!APP_STORE_LIVE && !PLAY_STORE_LIVE) {
    return (
      <section className="rounded-3xl bg-card p-5 wood-block">
        <h2 className="font-ui text-lg font-bold text-ink">Get the app</h2>
        <p className="mt-1 text-sm text-inksoft">
          Totland's iOS app is in Apple's review queue right now. We'll light this button up the moment it's live —
          no action needed, just check back here.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-felt px-3 py-2 text-xs font-semibold text-inksoft ring-1 ring-border">
          🍎 Apple App Store — in review
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-card p-5 wood-block">
      <h2 className="font-ui text-lg font-bold text-ink">Get the app</h2>
      <p className="mt-1 text-sm text-inksoft">Download Totland for the best offline experience.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {APP_STORE_LIVE && (
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-night px-4 py-2.5 font-ui text-sm font-semibold text-cream"
          >
            🍎 Download on the App Store
          </a>
        )}
        {PLAY_STORE_LIVE && PLAY_STORE_URL && (
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-night px-4 py-2.5 font-ui text-sm font-semibold text-cream"
          >
            ▶️ Get it on Google Play
          </a>
        )}
      </div>
    </section>
  );
}
