/** Mobile browsers only allow sound that a tap started. We prime every audio
 *  element we own on the very first touch so later playback — the second and
 *  third soundtracks, and Hannah's narration — is never refused. */

const elements = new Set<HTMLAudioElement>();
const onceUnlocked = new Set<() => void>();
const onEveryGesture = new Set<() => void>();

let unlocked = false;
let hooked = false;

/** A fraction of a second of silence — enough for the browser to count the
 *  element as "played by a tap" before it has any real audio loaded. */
const SILENCE =
  "data:audio/mpeg;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCA" +
  "gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgP/7kMQAAAAA" +
  "AAAAAAAAAAAAAAAAAA==";

async function prime(el: HTMLAudioElement): Promise<void> {
  if (!el.paused) return;
  const wasMuted = el.muted;
  const hadSource = Boolean(el.src);
  el.muted = true;
  if (!hadSource) el.src = SILENCE;
  try {
    await el.play();
    el.pause();
  } catch {
    /* still locked — the next tap tries again */
  } finally {
    el.muted = wasMuted;
    if (!hadSource) el.removeAttribute("src");
  }
}

function withTimeout(work: Promise<unknown>): Promise<unknown> {
  return Promise.race([
    work,
    new Promise((resolve) => setTimeout(resolve, 500)),
  ]);
}

function handleGesture() {
  if (unlocked) {
    for (const fn of onEveryGesture) fn();
    return;
  }
  unlocked = true;
  // Prime first, then let waiters play — otherwise priming's pause() aborts
  // the very playback we just unlocked. Never wait longer than half a second.
  void withTimeout(Promise.allSettled([...elements].map(prime))).then(() => {
    for (const fn of onceUnlocked) fn();
    onceUnlocked.clear();
    for (const fn of onEveryGesture) fn();
  });
}



function hook() {
  if (hooked || typeof window === "undefined") return;
  hooked = true;
  window.addEventListener("pointerdown", handleGesture, { passive: true });
  window.addEventListener("touchend", handleGesture, { passive: true });
  window.addEventListener("keydown", handleGesture);
}

hook();

/** Track an audio element so it gets unlocked on the first tap. */
export function registerAudio(el: HTMLAudioElement) {
  hook();
  elements.add(el);
  if (unlocked) void prime(el);
}

/** Run once as soon as sound is allowed (immediately if it already is). */
export function onUnlock(fn: () => void) {
  hook();
  if (unlocked) fn();
  else onceUnlocked.add(fn);
}

/** Run on every tap — used to retry playback that the browser refused. */
export function onGesture(fn: () => void) {
  hook();
  onEveryGesture.add(fn);
}

export function audioUnlocked(): boolean {
  return unlocked;
}
