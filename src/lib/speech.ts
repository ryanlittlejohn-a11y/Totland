/** Narration + gentle sound feedback.
 *  Primary voice: ElevenLabs "Hannah", cached on the device so repeat lines
 *  play instantly and keep working offline. Falls back to the platform voice
 *  when a brand-new line is needed with no connection. */
import { getLang, speechLang } from "./i18n";
import { speakText } from "./tts.functions";
import { duckMusic } from "./music";
import { onGesture, registerAudio } from "./audio-unlock";

/** Remove emoji/pictographs so the voice only speaks words. */
export function stripEmoji(text: string): string {
  return text
    .replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

let enabled = true;

export function setNarration(on: boolean) {
  enabled = on;
  if (!on) {
    stopAudio();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }
}

/* ------------------------------------------------------------------ *
 * Device-voice fallback (used only when Hannah's audio isn't available)
 * ------------------------------------------------------------------ */

const PREFERRED_VOICES_ES = [
  "monica", "paulina", "helena", "laura", "google español", "sabina", "elvira",
];

const PREFERRED_VOICES = [
  "samantha", "karen", "moira", "tessa", "google us english", "zira", "aria", "jenny",
];

let cachedVoice: SpeechSynthesisVoice | null = null;
let cachedFor = "";

function pickWarmVoice(): SpeechSynthesisVoice | null {
  if (cachedFor !== getLang()) cachedVoice = null;
  cachedFor = getLang();
  if (cachedVoice) return cachedVoice;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const es = getLang() === "es";
  const prefix = es ? "es" : "en";
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith(prefix));
  for (const pref of es ? PREFERRED_VOICES_ES : PREFERRED_VOICES) {
    const match = voices.find((v) => v.name.toLowerCase().includes(pref));
    if (match) {
      cachedVoice = match;
      return match;
    }
  }
  cachedVoice = voices.find((v) => v.localService) ?? voices[0] ?? null;
  return cachedVoice;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null;
    pickWarmVoice();
  };
}

function sayWithDeviceVoice(text: string, opts: { rate?: number; pitch?: number }) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voice = pickWarmVoice();
    if (voice) u.voice = voice;
    u.rate = opts.rate ?? 0.85;
    u.pitch = opts.pitch ?? 1.15;
    u.volume = 0.95;
    u.lang = voice?.lang ?? speechLang();
    u.onend = () => duckMusic(false);
    u.onerror = () => duckMusic(false);
    duckMusic(true);
    window.speechSynthesis.speak(u);
  } catch {
    /* narration is optional */
  }
}

/* ------------------------------------------------------------------ *
 * Hannah voice: fetch once, cache forever on the device
 * ------------------------------------------------------------------ */

const VOICE_CACHE = "totland-voice-v1";
const VOICE_BLOCKED_KEY = "totland.voice-unavailable";

function voiceRequestsBlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(VOICE_BLOCKED_KEY) === "1";
  } catch {
    return false;
  }
}

function blockVoiceRequests() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(VOICE_BLOCKED_KEY, "1");
  } catch {
    /* session storage can be unavailable in private browsing */
  }
}

function keyFor(text: string, lang: string): string {
  let h = 2166136261;
  const s = `${lang}:${text}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `https://voice.totland.local/${lang}-${(h >>> 0).toString(36)}-${s.length}.mp3`;
}

/** Only a handful of recent clips stay in memory; the rest live in the device
 *  cache. Holding every clip of a session is what exhausted memory on phones. */
const MEMORY_LIMIT = 12;
const memory = new Map<string, string>(); // cache key -> object URL

function remember(key: string, url: string) {
  memory.delete(key);
  memory.set(key, url);
  while (memory.size > MEMORY_LIMIT) {
    const oldest = memory.keys().next().value as string | undefined;
    if (oldest === undefined) break;
    const stale = memory.get(oldest);
    memory.delete(oldest);
    if (stale) {
      try {
        URL.revokeObjectURL(stale);
      } catch {
        /* already gone */
      }
    }
  }
}

async function cachedBlobUrl(text: string, lang: string): Promise<string | null> {
  const key = keyFor(text, lang);
  const hit = memory.get(key);
  if (hit) {
    remember(key, hit); // keep the freshly used clip at the front
    return hit;
  }
  if (typeof caches === "undefined") return null;
  try {
    const cache = await caches.open(VOICE_CACHE);
    const res = await cache.match(key);
    if (!res) return null;
    const url = URL.createObjectURL(await res.blob());
    remember(key, url);
    return url;
  } catch {
    return null;
  }
}

/** Decode base64 through the platform decoder (off the main thread) instead of
 *  a per-character loop, which blocked touch handling on phones. */
async function toBlob(base64: string): Promise<Blob> {
  const res = await fetch(`data:audio/mpeg;base64,${base64}`);
  return res.blob();
}

/** Download a line. `wantUrl: false` (prewarming) never creates an object URL,
 *  so background caching costs no memory at all. */
async function fetchAndStore(
  text: string,
  lang: string,
  wantUrl = true,
): Promise<string | null> {
  if (voiceRequestsBlocked()) return null;
  try {
    const result = await speakText({ data: { text, lang } });
    if (result.status !== "ok") {
      blockVoiceRequests();
      return null;
    }
    const blob = await toBlob(result.audio);
    const key = keyFor(text, lang);
    if (typeof caches !== "undefined") {
      try {
        const cache = await caches.open(VOICE_CACHE);
        await cache.put(key, new Response(blob, { headers: { "Content-Type": "audio/mpeg" } }));
      } catch {
        /* storage full or unavailable — still play this once */
      }
    }
    if (!wantUrl) return null;
    const url = URL.createObjectURL(blob);
    remember(key, url);
    return url;
  } catch {
    return null;
  }
}

/** One narration element for the whole session: created up front and primed on
 *  the first tap, so Hannah is never blocked partway through an activity. */
const player: HTMLAudioElement | null = typeof window === "undefined" ? null : new Audio();
if (player) {
  player.preload = "auto";
  registerAudio(player);
}
let playToken = 0;
let pendingUrl: string | null = null;

if (typeof window !== "undefined") {
  onGesture(() => {
    if (!pendingUrl) return;
    const url = pendingUrl;
    pendingUrl = null;
    playUrl(url, playToken);
  });
}

function stopAudio() {
  if (player) {
    player.pause();
    player.currentTime = 0;
  }
  duckMusic(false);
}

function playUrl(url: string, token: number) {
  if (token !== playToken || !enabled) return;
  if (!player) return;
  player.onended = () => duckMusic(false);
  player.onpause = () => duckMusic(false);
  player.pause();
  player.src = url;
  player.volume = 1;
  player.muted = false;
  duckMusic(true);
  void player.play().catch(() => {
    duckMusic(false);
    pendingUrl = url; // refused: replay on the next tap
  });
}


/** Speak a line in Hannah's voice (cached), falling back to the device voice. */
export function say(text: string, opts: { rate?: number; pitch?: number } = {}) {
  if (!enabled || typeof window === "undefined") return;
  const clean = text.trim();
  if (!clean) return;
  const lang = getLang();
  const token = ++playToken;

  stopAudio();
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();

  void (async () => {
    const cached = await cachedBlobUrl(clean, lang);
    if (cached) {
      playUrl(cached, token);
      return;
    }
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      if (token === playToken) sayWithDeviceVoice(clean, opts);
      return;
    }
    const fresh = await fetchAndStore(clean, lang);
    if (fresh) playUrl(fresh, token);
    else if (token === playToken) sayWithDeviceVoice(clean, opts);
  })();
}

/** Wait for a quiet moment before doing more background work. */
function idle(ms: number): Promise<void> {
  return new Promise((resolve) => {
    const go = () => resolve();
    const ric = (window as unknown as {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
    }).requestIdleCallback;
    window.setTimeout(() => (ric ? ric(go, { timeout: 2000 }) : go()), ms);
  });
}

/** Quietly download common lines so offline play still sounds like Hannah.
 *  Deliberately slow: one line at a time, pausing between small batches, so a
 *  phone never has to juggle a hundred downloads while a child is playing. */
export async function prewarmVoice(lines: string[], lang = getLang()) {
  if (typeof window === "undefined" || typeof caches === "undefined") return;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return;
  const queue = [...new Set(lines.map((l) => l.trim()).filter(Boolean))];
  let done = 0;
  while (queue.length) {
    if (typeof navigator !== "undefined" && navigator.onLine === false) return;
    const line = queue.shift()!;
    const key = keyFor(line, lang);
    try {
      const cache = await caches.open(VOICE_CACHE);
      if (await cache.match(key)) continue;
    } catch {
      return;
    }
    await fetchAndStore(line, lang, false);
    done += 1;
    await idle(done % 5 === 0 ? 4000 : 600);
  }
}

/* ------------------------------------------------------------------ *
 * Sound feedback
 * ------------------------------------------------------------------ */

let ctx: AudioContext | null = null;
function tone(freq: number, when: number, dur: number, gain: number) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, ctx.currentTime + when);
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + when + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + when + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(ctx.currentTime + when);
  osc.stop(ctx.currentTime + when + dur);
}

export function chime(kind: "correct" | "retry" | "reward", on = true) {
  if (!on || typeof window === "undefined") return;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    if (kind === "correct") {
      tone(660, 0, 0.16, 0.09);
      tone(880, 0.11, 0.22, 0.08);
    } else if (kind === "reward") {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.25, 0.07));
    } else {
      tone(392, 0, 0.18, 0.05);
    }
  } catch {
    /* sound is optional */
  }
}
