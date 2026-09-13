import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Permanently deletes the signed-in grown-up account: their child profiles,
 * their subscription records, and the auth user itself. Only ever acts on the
 * caller — the user id comes from the verified bearer token, never from input.
 */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const children = await context.supabase
      .from("child_profiles")
      .delete()
      .eq("user_id", context.userId);
    if (children.error) throw children.error;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const subs = await supabaseAdmin.from("subscriptions").delete().eq("user_id", context.userId);
    if (subs.error) throw subs.error;

    const { error } = await supabaseAdmin.auth.admin.deleteUser(context.userId);
    if (error) throw error;

    return { ok: true };
  });
