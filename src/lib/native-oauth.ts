import { signOutLocal } from "@/lib/signout-log";
import { supabase } from "@/integrations/supabase/client";
import { apiOrigin } from "./native";

/**
 * Phone-app only sign-in for Apple / Google.
 * The web helper navigates the page to a relative "/~oauth/initiate", which in
 * the packaged app resolves to capacitor://localhost and 404s. Here we open the
 * real hosted sign-in in a secure in-app browser sheet instead; the website's
 * /auth/native-return page hands the session back via app.totland.kids://auth-callback.
 */
const NONCE_KEY = "totland.oauth.nonce";
export const NATIVE_AUTH_SCHEME = "app.totland.kids";

type Pending = { resolve: (r: { error: Error | null }) => void };
let pending: Pending | null = null;

function makeNonce(): string {
  const b = crypto.getRandomValues(new Uint8Array(16));
  return [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

export async function nativeSignInWithOAuth(provider: "apple" | "google"): Promise<{ error: Error | null }> {
  const nonce = makeNonce();
  try {
    localStorage.setItem(NONCE_KEY, nonce);
  } catch {
    /* ignore */
  }
  const origin = apiOrigin();
  const returnTo = `${origin}/auth/native-return?n=${nonce}`;
  const params = new URLSearchParams({ provider, redirect_uri: returnTo, state: nonce });
  const url = `${origin}/~oauth/initiate?${params.toString()}`;

  const { Browser } = await import("@capacitor/browser");
  return new Promise((resolve) => {
    pending = { resolve };
    void Browser.addListener("browserFinished", () => {
      // Sheet closed. If no callback arrived shortly after, treat as cancelled.
      setTimeout(() => {
        if (pending) {
          pending = null;
          resolve({ error: new Error("Sign-in was cancelled") });
        }
      }, 1500);
    });
    Browser.open({ url, presentationStyle: "popover" }).catch((e: unknown) => {
      pending = null;
      resolve({ error: e instanceof Error ? e : new Error(String(e)) });
    });
  });
}

/**
 * Handles app.totland.kids://auth-callback?n=...#access_token=..&refresh_token=..
 * Returns true if the session was set. Only accepts the nonce this app created.
 */
export async function completeNativeOAuth(url: string): Promise<boolean> {
  let ok = false;
  try {
    const parsed = new URL(url);
    const n = parsed.searchParams.get("n");
    let expected: string | null = null;
    try {
      expected = localStorage.getItem(NONCE_KEY);
    } catch {
      /* ignore */
    }
    const frag = new URLSearchParams(parsed.hash.replace(/^#/, ""));
    const access_token = frag.get("access_token");
    const refresh_token = frag.get("refresh_token");
    if (n && expected && n === expected && access_token && refresh_token) {
      try {
        localStorage.removeItem(NONCE_KEY);
      } catch {
        /* ignore */
      }
      const { error } = await supabase.auth.setSession({ access_token, refresh_token });
      ok = !error;
      if (ok) {
        // Confirm once with the backend that the handed-over session is live,
        // so a dead session reports failure instead of flashing signed-in.
        const { data: u, error: userError } = await supabase.auth.getUser();
        if (userError || !u.user) {
          ok = false;
          await signOutLocal("native-sign-in", userError?.message ?? "no user after handover");
        }
      }
    }
  } catch {
    ok = false;
  }
  try {
    const { Browser } = await import("@capacitor/browser");
    await Browser.close();
  } catch {
    /* already closed / unavailable on android */
  }
  const p = pending;
  pending = null;
  p?.resolve({ error: ok ? null : new Error("Sign-in could not be verified") });
  return ok;
}
