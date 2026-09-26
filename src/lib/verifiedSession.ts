import { signOutLocal } from "@/lib/signout-log";
import { supabase } from "@/integrations/supabase/client";

/**
 * Returns true only when the saved sign-in is confirmed valid by the backend.
 * A token that looks right on the device but is rejected by the backend
 * (revoked, signed by an old key, corrupted) is cleared so protected calls
 * never run with it. Network failures return false without signing out.
 */
export async function hasVerifiedSession(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session?.user) return false;
  const token = session.access_token ?? "";
  const expired = typeof session.expires_at === "number" && session.expires_at * 1000 <= Date.now();
  if (token.split(".").length !== 3 || expired) {
    await signOutLocal("sign-in-check", "token malformed or expired on device");
    return false;
  }
  const { data: u, error } = await supabase.auth.getUser(token);
  if (error) {
    const status = (error as { status?: number }).status;
    if (status === 401 || status === 403 || status === 400) {
      await signOutLocal("sign-in-check", `backend rejected token (status ${status})`);
    }
    return false;
  }
  if (!u.user?.email_confirmed_at) return false;
  // Protected calls verify tokens with getClaims, which is stricter than
  // getUser (e.g. tokens signed by a rotated-out key pass getUser but fail
  // getClaims). Check the same way here so such a token is cleared before it
  // can reach a protected call and crash the screen.
  const { data: c, error: claimsError } = await supabase.auth.getClaims(token);
  if (claimsError || !c?.claims?.sub) {
    await signOutLocal("sign-in-check", "token failed claims check");
    return false;
  }
  return true;
}
