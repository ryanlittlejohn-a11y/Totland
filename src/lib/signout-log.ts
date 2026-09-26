import { supabase } from "@/integrations/supabase/client";

export type SignOutSource =
  | "deletion"
  | "premium-check"
  | "child-sync"
  | "sign-in-check"
  | "native-sign-in"
  | "user-button";

/**
 * Device-only sign-out that always logs where it came from, so a surprise
 * sign-out on a test device can be traced to one place.
 */
export async function signOutLocal(source: SignOutSource, reason: string): Promise<void> {
  console.warn(`[signout] source=${source} reason=${reason}`);
  await supabase.auth.signOut({ scope: "local" }).catch(() => {});
}
