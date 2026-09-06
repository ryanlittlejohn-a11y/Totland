/** Soft looping background soundtrack.
 *  Sits well under narration: base volume is low and it ducks further while
 *  Hannah is speaking. Autoplay blocks are handled by retrying on first tap. */
import { MUSIC_URL } from "./music-track";

const BASE_VOLUME = 0.07;
const DUCK_VOLUME = 0.02;

let audio: HTMLAudioElement | null = null;
let wanted = false;
let ducked = false;
let level = 1; // parent-set loudness multiplier, 0–1
let gestureHooked = false;
let fadeTimer: ReturnType<typeof setInterval> | null = null;

function target(): number {
  return (ducked ? DUCK_VOLUME : BASE_VOLUME) * level;
}

function fadeTo(value: number) {
  if (!audio) return;
  if (fadeTimer) clearInterval(fadeTimer);
  const el = audio;
  fadeTimer = setInterval(() => {
    const diff = value - el.volume;
    if (Math.abs(diff) < 0.006) {
      el.volume = value;
      if (fadeTimer) clearInterval(fadeTimer);
      fadeTimer = null;
      return;
    }
    el.volume = Math.min(1, Math.max(0, el.volume + diff * 0.25));
  }, 40);
}

function ensureAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined" || !MUSIC_URL) return null;
  if (!audio) {
    audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = target();
  }
  return audio;
}

function hookGesture() {
  if (gestureHooked || typeof window === "undefined") return;
  gestureHooked = true;
  const retry = () => {
    if (wanted) void tryPlay();
  };
  window.addEventListener("pointerdown", retry, { passive: true });
  window.addEventListener("keydown", retry);
}

async function tryPlay() {
  const el = ensureAudio();
  if (!el) return;
  try {
    el.volume = target();
    await el.play();
  } catch {
    hookGesture(); // blocked until the child taps — retry then
  }
}

/** Begin (or resume) the soundtrack. */
export function startMusic() {
  wanted = true;
  hookGesture();
  void tryPlay();
}

/** Pause the soundtrack, keeping its position. */
export function stopMusic() {
  wanted = false;
  audio?.pause();
}

/** Apply the parent dashboard on/off switch. */
export function setMusic(on: boolean) {
  if (on) startMusic();
  else stopMusic();
}

/** Set the music loudness (0–1, where 1 is the default soft level). */
export function setMusicVolume(value: number) {
  level = Math.min(1, Math.max(0, value));
  if (audio && !audio.paused) fadeTo(target());
  else if (audio) audio.volume = target();
}

/** Dip the music while narration plays. */
export function duckMusic(on: boolean) {
  if (ducked === on) return;
  ducked = on;
  if (audio && !audio.paused) fadeTo(target());
  else if (audio) audio.volume = target();
}
