import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";

import { supabase } from "@/integrations/supabase/client";
import { deleteChild, listChildren, upsertChild, type RemoteChild } from "@/lib/children.functions";
import { hasVerifiedSession } from "@/lib/verifiedSession";
import {
  defaultProfile,
  loadFamily,
  saveFamily,
  type ChildRecord,
  type Family,
  type Profile,
} from "@/lib/profile";

/**
 * Keeps each child's progress on the family account. Play always writes to the
 * device first; this pushes local changes up and pulls anything newer down, so
 * a child's stars follow them to another phone or tablet.
 */
export function useChildSync() {
  const list = useServerFn(listChildren);
  const upsert = useServerFn(upsertChild);
  const remove = useServerFn(deleteChild);

  useEffect(() => {
    let running = false;

    const signedIn = hasVerifiedSession;

    const sync = async () => {
      if (running) return;
      if (typeof navigator !== "undefined" && navigator.onLine === false) return;
      if (!(await signedIn())) return;
      running = true;
      try {
        const remote = (await list()) as RemoteChild[];
        const remoteById = new Map(remote.map((r) => [r.id, r]));
        const local = loadFamily();
        const next: ChildRecord[] = [];

        for (const child of local.children) {
          if (child.deleted) {
            if (remoteById.has(child.id)) await remove({ data: { id: child.id } });
            remoteById.delete(child.id);
            continue; // drop it locally once the account knows
          }
          const r = remoteById.get(child.id);
          remoteById.delete(child.id);
          const remoteNewer = r ? new Date(r.updatedAt).getTime() > new Date(child.updatedAt).getTime() : false;

          if (r && remoteNewer && !child.dirty) {
            next.push({
              id: r.id,
              profile: { ...defaultProfile(), ...(JSON.parse(r.data) as Partial<Profile>), childName: r.name, age: r.age },
              updatedAt: r.updatedAt,
              dirty: false,
            });
            continue;
          }

          await upsert({
            data: {
              id: child.id,
              name: child.profile.childName,
              age: child.profile.age,
              outfit: child.profile.outfit,
              avatarBg: child.profile.avatarBg,
              data: JSON.stringify(child.profile),
            },
          });
          next.push({ ...child, dirty: false });
        }

        // Children this device has never seen (added on another device).
        for (const r of remoteById.values()) {
          next.push({
            id: r.id,
            profile: { ...defaultProfile(), ...(JSON.parse(r.data) as Partial<Profile>), childName: r.name, age: r.age },
            updatedAt: r.updatedAt,
            dirty: false,
          });
        }

        if (!next.length) return;
        const family: Family = {
          ...local,
          children: next,
          activeChildId: next.some((c) => c.id === local.activeChildId) ? local.activeChildId : next[0]!.id,
        };
        saveFamily(family);
      } catch (err) {
        // A rejected session on the backend: clear it so the error stops repeating.
        if (err instanceof Error && /unauthorized|invalid token/i.test(err.message)) {
          await supabase.auth.signOut({ scope: "local" }).catch(() => {});
        }
        // Offline or a backend hiccup: keep playing from the device copy.
      } finally {
        running = false;
      }
    };

    void sync();
    const timer = window.setInterval(sync, 60_000);
    window.addEventListener("online", sync);
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") void sync();
    });

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("online", sync);
      sub.subscription.unsubscribe();
    };
  }, [list, upsert, remove]);
}
