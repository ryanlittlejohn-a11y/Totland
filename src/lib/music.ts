/** Soft looping background soundtracks.
 *  One track for the main screens, another inside activities. Both sit well
 *  under narration: volume is low and ducks further while Hannah is speaking.
 *  Autoplay blocks are handled by retrying on first tap. */
import { ACTIVITY_TRACK, MENU_TRACK, STORY_TRACK, type Track } from "./music-track";
import { onGesture, onUnlock } from "./audio-unlock";
import { reportIssue } from "./crash-report";
import { apiOrigin } from "./native";

/** Slider 0–1 maps to 0–0.25 playback volume; default 0.5 ≈ 7% (very soft). */
const MAX_VOLUME = 0.25;
const DEFAULT_LEVEL = 0.5;

const ACTIVITY_PREFIXES = ["/play", "/game", "/adventure"];

/** Which soundtrack a route belongs to. */
export function isActivityRoute(pathname: string): boolean {
  return ACTIVITY_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
}

let storyOverride = 0; // >0 while a storybook is open

function trackFor(pathname: string): string | null {
  if (storyOverride > 0 && STORY_TRACK_URL) return STORY_TRACK_URL;
  return isActivityRoute(pathname) ? ACTIVITY_TRACK_URL : MENU_TRACK_URL;
}

let audio: HTMLAudioElement | null = null;
let currentUrl: string | null = null;
let wanted = false;
let ducked = false;
let level = DEFAULT_LEVEL; // parent-set loudness, 0–1
let route = "/";
let gestureHooked = false;
let fadeTimer: ReturnType<typeof setInterval> | null = null;

function target(): number {
  const base = MAX_VOLUME * level;
  return ducked ? base * 0.3 : base;
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

/** When a track address fails, the hosted copy is remembered here and used
 *  from then on. */
const hosted = new Map<string, string>();

function sourceFor(url: string): string {
  return hosted.get(url) ?? url;
}

function ensureAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  const url = trackFor(route);
  if (!url) return null;
  if (!audio) {
    audio = new Audio(sourceFor(url));
    audio.loop = true;
    audio.preload = "auto";
    currentUrl = url;
    audio.addEventListener("error", handleLoadError);
    // The soundtrack starts itself on the first tap (see hookGesture), so it
    // must not be muted-primed like the narration element.

  } else if (currentUrl !== url) {
    // Keep the same element (it already has permission to make sound) and
    // simply swap the tune.
    audio.pause();
    audio.src = sourceFor(url);
    currentUrl = url;
    audio.load();
  }
  audio.volume = target();
  return audio;
}

/** A soundtrack that cannot load used to fail in total silence. Log it, and
 *  try the hosted copy once in case the bundled address was wrong. */
function handleLoadError() {
  const url = currentUrl;
  if (!audio || !url) return;
  reportIssue(`soundtrack failed to load: ${sourceFor(url)}`);
  if (!url.startsWith("/") || hosted.has(url)) return;
  hosted.set(url, `${apiOrigin()}${url}`);
  audio.src = sourceFor(url);
  audio.load();
  if (wanted) void tryPlay();
}

function hookGesture() {
  if (gestureHooked || typeof window === "undefined") return;
  gestureHooked = true;
  onGesture(() => {
    if (wanted && audio?.paused) void tryPlay();
  });
}

async function tryPlay() {
  const el = ensureAudio();
  if (!el) return;
  hookGesture(); // always retry on the next tap if the browser refuses
  try {
    el.volume = target();
    await el.play();
  } catch {
    onUnlock(() => {
      if (wanted) void tryPlay();
    });
  }
}


/** Point the player at a new screen so the right soundtrack is selected. */
export function setMusicRoute(pathname: string) {
  if (route === pathname) return;
  route = pathname;
  if (wanted && audio && trackFor(route) !== currentUrl) void tryPlay();
}

/** Storybooks swap in their own soundtrack while open. */
export function setStoryMusic(on: boolean) {
  storyOverride = Math.max(0, storyOverride + (on ? 1 : -1));
  if (wanted && audio && trackFor(route) !== currentUrl) void tryPlay();
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

let previewCount = 0;

/** Live preview from the parent dashboard (silent routes) while settings are shown. */
export function previewMusic(on: boolean) {
  previewCount = Math.max(0, previewCount + (on ? 1 : -1));
  if (on || previewCount > 0) startMusic();
  else stopMusic();
}

/** Apply the parent dashboard on/off switch. */
export function setMusic(on: boolean) {
  if (on) startMusic();
  else if (previewCount === 0) stopMusic();
}

/** Set the music loudness (0–1; 0.5 is the default soft level). */
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
