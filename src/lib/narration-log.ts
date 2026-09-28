/** On-device-only narration diagnostics: the last 50 events, kept in memory and
 *  localStorage. Never sent anywhere — a grown-up can copy it from Settings. */

export type NarrationEvent =
  | "setting-off"
  | "cache-hit"
  | "hannah-ok"
  | "hannah-unavailable"
  | "hannah-failed"
  | "hannah-refused"
  | "device-attempt"
  | "device-started"
  | "device-error"
  | "device-missing";

export interface NarrationLogEntry {
  t: string;
  event: NarrationEvent;
  detail?: string;
}

const KEY = "totland.narration-log";
const LIMIT = 50;
let entries: NarrationLogEntry[] | null = null;

function load(): NarrationLogEntry[] {
  if (entries) return entries;
  entries = [];
  if (typeof window === "undefined") return entries;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (Array.isArray(parsed)) entries = parsed.slice(-LIMIT) as NarrationLogEntry[];
  } catch {
    /* unreadable — start fresh */
  }
  return entries;
}

export function logNarration(event: NarrationEvent, detail?: string) {
  const list = load();
  list.push({ t: new Date().toISOString(), event, ...(detail ? { detail: detail.slice(0, 120) } : {}) });
  while (list.length > LIMIT) list.shift();
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage full — memory copy still works */
  }
}

export function readNarrationLog(): NarrationLogEntry[] {
  return [...load()];
}

export function formatNarrationLog(): string {
  return readNarrationLog()
    .map((e) => `${e.t} ${e.event}${e.detail ? ` — ${e.detail}` : ""}`)
    .join("\n");
}
