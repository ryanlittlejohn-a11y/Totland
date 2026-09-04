/** Narration + gentle sound feedback. Works offline via the platform voice. */

let enabled = true;

export function setNarration(on: boolean) {
  enabled = on;
  if (!on && typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function say(text: string, opts: { rate?: number; pitch?: number } = {}) {
  if (!enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = opts.rate ?? 0.9;
    u.pitch = opts.pitch ?? 1.2;
    u.lang = "en-US";
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
