import { isNativeApp, pluginReady, withTimeout } from "./native";

/**
 * Where Totland keeps a child's progress.
 *
 * On the web this is plain localStorage, exactly as it has always been.
 *
 * In the packaged app iOS is allowed to clear WebView storage whenever it
 * likes, which would wipe a child's stars. So the packaged app keeps the same
 * values in Capacitor Preferences (real native storage) instead. Reads stay
 * synchronous by serving them from an in-memory copy that is loaded before the
 * first screen renders; writes update memory immediately and are written
 * through to native storage in the background.
 */

export const STORAGE_KEYS = ["totland.family.v1", "totland.profile.v1"] as const;

const MIGRATED_KEY = "totland.storage.migrated.v1";

let memory: Map<string, string> | null = null;
let queue: Promise<unknown> = Promise.resolve();

async function preferences() {
  const mod = await import("@capacitor/preferences");
  return { Preferences: mod.Preferences };
}

function useMemory() {
  return memory !== null;
}

function localGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function localSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode or full quota — native storage is the real home */
  }
}

export function storageGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  if (useMemory()) return memory!.get(key) ?? null;
  return localGet(key);
}

export function storageSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  if (useMemory()) {
    memory!.set(key, value);
    // Keep localStorage in step too, so a downgrade or a web build still reads it.
    localSet(key, value);
    queue = queue.then(async () => {
      try {
        const { Preferences } = await preferences();
        await Preferences.set({ key, value });
      } catch (e) {
        console.error("native storage write failed", e);
      }
    });
    return;
  }
  localSet(key, value);
}

export function storageRemove(key: string) {
  if (typeof window === "undefined") return;
  if (useMemory()) memory!.delete(key);
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
  if (!isNativeApp()) return;
  queue = queue.then(async () => {
    try {
      const { Preferences } = await preferences();
      await Preferences.remove({ key });
    } catch {
      /* ignore */
    }
  });
}

/**
 * Load native storage into memory, migrating anything that currently only
 * exists in localStorage. Nothing is deleted from localStorage, so a failed
 * migration can never lose a child's progress. No-op on the web.
 */
export async function hydrateStorage(): Promise<void> {
  if (typeof window === "undefined" || !isNativeApp() || memory !== null) return;
  // If the bridge has not registered Preferences, stay on web storage.
  if (!pluginReady("Preferences")) {
    return;
  }
  const loaded = await withTimeout(loadNative(), 4000, null, "native storage load");
  memory = loaded;
}

const STEP_MS = 3000;
const HUNG = Symbol("hung");

async function step<T>(label: string, p: Promise<T>): Promise<T> {
  const r = await withTimeout<T | typeof HUNG>(p, STEP_MS, HUNG, `storage ${label}`);
  if (r === HUNG) throw new Error(`storage ${label} timed out`);
  return r as T;
}

/** Returns the loaded map, or null to stay on localStorage. Never deletes anything. */
async function loadNative(): Promise<Map<string, string> | null> {
  const next = new Map<string, string>();
  try {
    const { Preferences } = await step("import plugin", preferences());
    const { value: migrated } = await step("get migrated", Preferences.get({ key: MIGRATED_KEY }));

    for (const key of STORAGE_KEYS) {
      const { value } = await step(`get ${key}`, Preferences.get({ key }));
      if (value != null) {
        next.set(key, value);
        continue;
      }
      const legacy = localGet(key);
      if (legacy != null) {
        next.set(key, legacy);
        await step(`set ${key}`, Preferences.set({ key, value: legacy }));
      }
    }

    if (!migrated) await step("set migrated", Preferences.set({ key: MIGRATED_KEY, value: new Date().toISOString() }));
    return next;
  } catch (e) {
    // Preferences unavailable or hung: stay on localStorage rather than start empty.
    console.error("native storage unavailable, using web storage", e);
    return null;
  }
}

let settleStorage: () => void = () => {};
/** Resolves once native storage has loaded (or fallen back). Immediate on the web. */
export const storageSettled: Promise<void> = new Promise((r) => (settleStorage = r));

/** Called by StorageBoot once storage is ready; tells every screen to re-read. */
export function markStorageSettled() {
  settleStorage();
  if (typeof window !== "undefined") window.dispatchEvent(new Event("totland:profile"));
}
