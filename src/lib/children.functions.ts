import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface RemoteChild {
  id: string;
  name: string;
  age: number;
  outfit: string;
  avatarBg: string;
  data: Record<string, unknown>;
  updatedAt: string;
}

/** Every child saved under the signed-in parent's account. */
export const listChildren = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<RemoteChild[]> => {
    const { data, error } = await context.supabase
      .from("child_profiles")
      .select("id, name, age, outfit, avatar_bg, data, updated_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      age: row.age,
      outfit: row.outfit,
      avatarBg: row.avatar_bg,
      data: (row.data ?? {}) as Record<string, unknown>,
      updatedAt: row.updated_at,
    }));
  });

export const upsertChild = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      id: string;
      name: string;
      age: number;
      outfit: string;
      avatarBg: string;
      data: Record<string, unknown>;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("child_profiles").upsert(
      {
        id: data.id,
        user_id: context.userId,
        name: data.name,
        age: data.age,
        outfit: data.outfit,
        avatar_bg: data.avatarBg,
        data: data.data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (error) throw error;
    return { ok: true };
  });

export const deleteChild = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("child_profiles")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });
