/**
 * Calm mode — a per-child switch (profile.calmMode, optional, default off)
 * layered ON TOP of the family-wide reduced-motion / sound / music settings.
 * It never writes to those settings; it only changes what this child gets.
 *
 * While Calm is active, games never move on by themselves: every round
 * advance goes through `advanceAfter`, which parks the step until the child
 * taps the shared "Next" button (CalmNextButton in PlayFrame).
 */
import { useSyncExternalStore } from "react";
import type { SkillId } from "./content";

type CalmFields = { calmMode?: boolean; reducedMotion?: boolean; music?: boolean };

export const isCalm = (p: CalmFields) => Boolean(p.calmMode);
/** Motion is reduced if the family setting OR this child's Calm mode asks for it. */
export const motionReduced = (p: CalmFields) => Boolean(p.reducedMotion) || isCalm(p);
/** Music plays only if the family setting is on AND this child is not in Calm mode. */
export const musicAllowed = (p: CalmFields) => Boolean(p.music) && !isCalm(p);

/** Today's Adventure in Calm mode: always the same order, never re-sorted by level. */
export const CALM_ADVENTURE_ORDER: readonly SkillId[] = ["letters", "numbers", "words", "puzzles", "colors"];

/** The one quiet tone Calm mode plays (much softer than normal chimes, ~0.07–0.09). */
export const CALM_TONE = { freq: 523, dur: 0.2, gain: 0.025 } as const;

/**
 * What a chime becomes. "normal" = play the usual sound; null = silence
 * (wrong answers make no sound in Calm); otherwise one quiet tone — no jingles.
 */
export function calmSound(kind: "correct" | "retry" | "reward", calm: boolean): "normal" | null | typeof CALM_TONE {
  if (!calm) return "normal";
  return kind === "retry" ? null : CALM_TONE;
}

const STEP_LABELS: Record<string, { icon: string; en: string; es: string }> = {
  letters: { icon: "🔤", en: "Letters", es: "Letras" },
  numbers: { icon: "🔢", en: "Numbers", es: "Números" },
  words: { icon: "🗣️", en: "Words", es: "Palabras" },
  puzzles: { icon: "🧩", en: "Puzzles", es: "Rompecabezas" },
  colors: { icon: "🎨", en: "Colors", es: "Colores" },
};
const CARDS_LABEL = { icon: "🃏", en: "Picture cards", es: "Tarjetas" };

/** The "what's next" cue for Adventure step `step` (the last step is the picture cards). */
export function calmAdventureStep(plan: readonly SkillId[], step: number) {
  return step < plan.length ? (STEP_LABELS[plan[step]!] ?? { icon: "⭐", en: plan[step]!, es: plan[step]! }) : CARDS_LABEL;
}

/* ------------------------------------------------------------ live state */

let active = false;
let pending: (() => void) | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function setCalmActive(on: boolean) {
  active = on;
  if (!on && pending) {
    // Switching Calm off mid-step: run the parked step now so play continues.
    const fn = pending;
    pending = null;
    emit();
    fn();
  }
}
export const calmActive = () => active;

/**
 * Drop-in for `window.setTimeout(fn, ms)` on round-advance / finish steps.
 * Normal: schedules as before and returns the timer id.
 * Calm: parks `fn` until the child taps Next and returns 0 (clearTimeout(0) is a no-op).
 */
export function advanceAfter(fn: () => void, ms: number): number {
  if (!active || typeof window === "undefined") {
    return typeof window === "undefined" ? 0 : window.setTimeout(fn, ms);
  }
  pending = fn;
  emit();
  return 0;
}

/** The child tapped Next: run the parked step exactly once. */
export function runPendingAdvance(): boolean {
  const fn = pending;
  if (!fn) return false;
  pending = null;
  emit();
  fn();
  return true;
}

/** Leaving a play screen drops any parked step. */
export function clearPendingAdvance() {
  if (!pending) return;
  pending = null;
  emit();
}

export const hasPendingAdvance = () => pending !== null;

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
export function usePendingAdvance(): boolean {
  return useSyncExternalStore(subscribe, hasPendingAdvance, () => false);
}
