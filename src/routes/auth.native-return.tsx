import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

/**
 * Website page that hands a finished sign-in back to the Totland phone app.
 * Only acts when the app's one-time code (?n=) is present; otherwise it does nothing.
 */
export const Route = createFileRoute("/auth/native-return")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Returning to Totland" },
      { name: "description", content: "Finishing grown-up sign-in and returning to the Totland app." },
      { property: "og:title", content: "Returning to Totland" },
      { property: "og:description", content: "Finishing grown-up sign-in for the Totland app." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NativeReturn,
});

function tokensFromUrl(): { access_token: string; refresh_token: string } | null {
  const sources = [window.location.hash.replace(/^#/, ""), window.location.search.replace(/^\?/, "")];
  for (const s of sources) {
    const p = new URLSearchParams(s);
    const a = p.get("access_token");
    const r = p.get("refresh_token");
    if (a && r) return { access_token: a, refresh_token: r };
  }
  return null;
}

/** Removes the saved sign-in from this browser's storage without contacting the backend. */
function clearSheetSession(): void {
  try {
    const key = (supabase.auth as unknown as { storageKey?: string }).storageKey;
    if (key) {
      for (const k of [key, `${key}-code-verifier`, `${key}-user`]) localStorage.removeItem(k);
    }
  } catch {
    /* storage unavailable — nothing to clear */
  }
}

function NativeReturn() {
  const [link, setLink] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get("n");
    if (!n || !/^[a-f0-9]{16,64}$/.test(n)) {
      setFailed(true);
      return;
    }
    let done = false;
    const send = (t: { access_token: string; refresh_token: string }) => {
      if (done) return;
      done = true;
      const frag = new URLSearchParams(t).toString();
      const url = `app.totland.kids://auth-callback?n=${n}#${frag}`;
      // Don't keep a web session on this browser sheet — but clear it on this
      // device only. signOut() would also end the session on the backend,
      // which is the very session the app is about to use.
      clearSheetSession();
      setLink(url);
      window.location.href = url;
    };
    const direct = tokensFromUrl();
    if (direct) return send(direct);

    // Otherwise the web client may have picked the session up itself.
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) send(data.session);
    };
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) send(s);
    });
    void check();
    const t = setTimeout(() => {
      if (!done) setFailed(true);
    }, 8000);
    return () => {
      clearTimeout(t);
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-sm text-center">
        <h1 className="font-ui text-xl font-bold text-foreground">
          {failed ? "Sign-in didn't finish" : "Returning to Totland…"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {failed ? "Please close this window and try again in the app." : "One moment."}
        </p>
        {link && (
          <a href={link} className="mt-6 inline-block rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">
            Return to Totland
          </a>
        )}
      </div>
    </main>
  );
}
