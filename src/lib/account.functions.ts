import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type DeleteAccountResult = { ok: true } | { ok: false; step: "children" | "subscriptions" | "account" };

/**
 * Permanently deletes the signed-in grown-up account: their child profiles,
 * their subscription records, and finally the auth user itself. Only ever acts
 * on the caller — the user id comes from the verified bearer token, never from
 * input. Each step is safe to repeat: rows already removed are simply skipped,
 * and the login is only removed after all of the user's data is gone.
 */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DeleteAccountResult> => {
    const userId = context.userId;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const children = await supabaseAdmin.from("child_profiles").delete().eq("user_id", userId);
    if (children.error) {
      console.error("[deleteMyAccount] children step failed", children.error);
      return { ok: false, step: "children" };
    }

    const subs = await supabaseAdmin.from("subscriptions").delete().eq("user_id", userId);
    if (subs.error) {
      console.error("[deleteMyAccount] subscriptions step failed", subs.error);
      return { ok: false, step: "subscriptions" };
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error && (error as { status?: number }).status !== 404) {
      console.error("[deleteMyAccount] account step failed", error);
      return { ok: false, step: "account" };
    }

    return { ok: true };
  });
