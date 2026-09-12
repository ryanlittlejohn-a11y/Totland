/** Lines kids hear constantly. Downloaded once in Hannah's voice so repeat
 *  play — including offline play — never falls back to the device voice. */
import { COLORS, LETTERS, NUMBER_WORDS, PRAISE, SHAPES, WORDS } from "./content";
import { getLang, noun, PRAISE_ES } from "./i18n";
import { prewarmVoice } from "./speech";
import { isNativeApp } from "./native";

function commonLines(lang: "en" | "es"): string[] {
  const es = lang === "es";
  const lines: string[] = [];

  for (const l of LETTERS) lines.push(l);
  for (const n of NUMBER_WORDS) lines.push(es ? n : n);
  for (const w of WORDS.slice(0, 26)) lines.push(noun(w.word));
  for (const c of COLORS) lines.push(noun(c.name));
  for (const s of SHAPES) lines.push(noun(s.name));

  lines.push(...(es ? PRAISE_ES.correct : PRAISE.correct));
  lines.push(...(es ? PRAISE_ES.retry : PRAISE.retry));

  lines.push(
    es ? "Encuentra las parejas." : "Find the matching pairs.",
    es ? "Toca la tarjeta" : "tap the card",
    es ? "¡Excelente trabajo! Ganaste una calcomanía nueva." : "Amazing work! You earned a new sticker.",
    es ? "¡Encontraste uno!" : "Found one!",
    es ? "¡Sí! Sigue así." : "Yes! Keep going.",
    es ? "¡Buen intento! ¿Cuál sigue?" : "Great try! Which one comes next?",
    es ? "¡Lo lograste! Toda la fila está en orden." : "You did it! The whole line is in order.",
  );

  return lines;
}

let started = false;

/** Fire-and-forget: caches the common lines in the background, once per load.
 *  Skipped entirely inside the packaged iPhone/iPad/Android app — downloading a
 *  hundred clips right after launch made the app unresponsive on real devices.
 *  Lines are still saved as they are heard, so offline play builds up anyway. */
export function prewarmCommonNarration() {
  if (started || typeof window === "undefined") return;
  started = true;
  if (isNativeApp()) return;
  const lang = getLang();
  window.setTimeout(() => {
    void prewarmVoice(commonLines(lang), lang);
  }, 15000);
}
