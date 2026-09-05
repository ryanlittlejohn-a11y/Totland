/** Narration + gentle sound feedback. Works offline via the platform voice. */

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
  if (!on && typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/** Prefer warm, natural-sounding voices over robotic defaults. */
const PREFERRED_VOICES = [
  "samantha", // iOS/macOS — warm and clear
  "karen", "moira", "tessa", // iOS accents, gentle
  "google us english", // Chrome — natural female voice
  "zira", // Windows — softer than David
  "aria", "jenny", // Edge neural voices
];

let cachedVoice: SpeechSynthesisVoice | null = null;

function pickWarmVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
  for (const pref of PREFERRED_VOICES) {
    const match = voices.find((v) => v.name.toLowerCase().includes(pref));
    if (match) {
      cachedVoice = match;
      return match;
    }
  }
  cachedVoice = voices.find((v) => v.localService && v.lang === "en-US") ?? voices[0] ?? null;
  return cachedVoice;
}

// Voices load asynchronously in some browsers — re-resolve when ready.
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null;
    pickWarmVoice();
  };
}

export function say(text: string, opts: { rate?: number; pitch?: number } = {}) {
  if (!enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voice = pickWarmVoice();
    if (voice) u.voice = voice;
    u.rate = opts.rate ?? 0.85; // slightly slower, calmer pacing for little ears
    u.pitch = opts.pitch ?? 1.15; // gentle warmth without sounding squeaky
    u.volume = 0.95;
    u.lang = voice?.lang ?? "en-US";
    window.speechSynthesis.speak(u);
  } catch {
    /* narration is optional */
  }
}

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
