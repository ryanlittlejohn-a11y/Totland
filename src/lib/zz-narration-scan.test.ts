// TEMPORARY narration enumeration harness — deleted after the scan.
import { test } from "vitest";
import { writeFileSync } from "fs";
import { roundForKind, orderSet } from "./rounds";
import { L, setLang, enginePrompt, PRAISE_ES, noun } from "./i18n";
import { PRAISE, alphabet } from "./content";
import { LETTER_MAZE_REVEALS, MAZE_REVEALS, letterRun, mazeTier } from "./number-maze";
import { JIGSAW_ANIMALS } from "./jigsaw-animals";
import { JIGSAW_VEHICLES } from "./jigsaw-vehicles";
import { letterCardSpecs, letterCard, numberCardSpecs, numberCard } from "./jigsaw-cards";
import { shapeTrainSet } from "./shape-train";
import { stripEmoji } from "./speech";
import { CLUE_KINDS } from "./rounds";

const BESPOKE: [string, string, string][] = [
  ["fishing", "findUpper", "letters"], ["fishing", "missingLetterWord", "words"], ["fishing", "nextNumber", "numbers"],
  ["fishing", "findColor", "colors"], ["fishing", "findShape", "shapes"], ["fishing", "findNumber", "numbers"],
  ["monster", "findUpper", "letters"], ["monster", "countObjects", "numbers"], ["monster", "findColor", "colors"],
  ["monster", "findShape", "shapes"], ["monster", "findNumber", "numbers"],
  ["rain", "findUpper", "letters"], ["rain", "findColor", "colors"], ["rain", "findShape", "shapes"], ["rain", "findNumber", "numbers"],
];

test("enumerate", () => {
  const out = new Set<string>();
  for (const lang of ["en", "es"] as const) {
    setLang(lang);
    const add = (t: string | undefined) => {
      if (!t) return;
      const c = stripEmoji(t).replace(/\s+/g, " ").trim();
      if (c) out.add(`${lang}\t${c}`);
    };
    const praise = lang === "es" ? PRAISE_ES.correct : PRAISE.correct;
    praise.forEach(add);
    for (const [engine, kind, skill] of BESPOKE) {
      const answerName = L(
        skill === "colors" ? "color" : skill === "shapes" ? "shape" : skill === "numbers" ? "number" : "letter",
        skill === "colors" ? "color" : skill === "shapes" ? "figura" : skill === "numbers" ? "número" : "letra",
      );
      add(engine === "fishing" ? L("Oops, it slipped away! Try another one.", "¡Uy, se escapó! Prueba otra.")
        : engine === "monster" ? L(`Sniff, sniff! Try another ${answerName}.`, `¡Snif, snif! Prueba ${answerName === "figura" || answerName === "letra" ? "otra" : "otro"} ${answerName}.`)
        : L(`Splash! Try another ${answerName} — take your time.`, `¡Splash! Prueba ${answerName === "figura" || answerName === "letra" ? "otra" : "otro"} ${answerName} — tómate tu tiempo.`));
      const verb = engine === "fishing" ? "catch" : engine === "monster" ? "feedMonster" : "catchPatient";
      for (let lvl = 1; lvl <= 6; lvl++) for (let i = 0; i < 400; i++) {
        const r = roundForKind(kind, lvl);
        add(CLUE_KINDS.has(kind) ? r.spoken : enginePrompt(verb as never, skill, r.answerId));
        add(r.reveal);
      }
    }
    // Number Rain in order
    add(L("Catch the numbers in order, smallest first.", "Atrapa los números en orden, del más pequeño al más grande."));
    add(L(`Splash! Try another number — take your time.`, `¡Splash! Prueba otro número — tómate tu tiempo.`));
    for (let lvl = 1; lvl <= 6; lvl++) for (let i = 0; i < 50; i++) orderSet("numbers", lvl).seq.forEach((s) => add(s.label));
    // Rockets
    add(L("Load the numbers in order, smallest first, to launch the rocket!", "¡Carga los números en orden, del más pequeño al más grande, para lanzar el cohete!"));
    add(L("Load the letters in alphabet order to launch the rocket!", "¡Carga las letras en orden alfabético para lanzar el cohete!"));
    add(L(`That slot needs a different number. Try again!`, `Ese tanque necesita otro número. ¡Inténtalo de nuevo!`));
    add(L(`That slot needs a different letter. Try again!`, `Ese tanque necesita otra letra. ¡Inténtalo de nuevo!`));
    for (const kind of ["letters", "numbers", "buildWord"]) for (let lvl = 1; lvl <= 6; lvl++) for (let i = 0; i < 200; i++) {
      const set = orderSet(kind, lvl);
      const word = set.seq.map((s) => s.label).join("");
      set.seq.forEach((s) => add(s.label));
      const ordering = kind !== "buildWord";
      if (!ordering) add(L(`Spell ${word} to launch the rocket!`, `¡Escribe ${word} para lanzar el cohete!`));
      const reveal = ordering ? `${set.seq.map((s) => s.label).join(", ")}!`
        : lang === "es" ? `¡${word.split("").join("-")} forma ${word.toLowerCase()}!` : `${word.split("").join("-")} spells ${word.toLowerCase()}!`;
      add(`${L("Blast off! ", "¡Despegue! ")}${reveal}`);
    }
    // Mazes
    for (const letters of [true, false]) {
      add(letters ? undefined : L("Trace the path: start at 1 and follow the numbers!", "Traza el camino: ¡empieza en 1 y sigue los números!"));
      for (const rv of letters ? LETTER_MAZE_REVEALS : MAZE_REVEALS)
        add(lang === "es" ? `¡Lo lograste! Hiciste ${rv.es}. ` : `You did it! You made ${rv.en}! `);
    }
    for (let lvl = 1; lvl <= 6; lvl++) {
      const pts = mazeTier(lvl).points;
      for (let n = 1; n <= pts; n++) { add(String(n)); add(L(`Find ${n}!`, `¡Busca el ${n}!`)); }
      for (let i = 0; i < 300; i++) {
        const run = letterRun(alphabet(), pts);
        add(L(`Trace the path: start at ${run[0]} and follow the alphabet!`, `Traza el camino: ¡empieza en la ${run[0]} y sigue el abecedario!`));
        run.forEach((x) => { add(x); add(L(`Find ${x}!`, `¡Busca la ${x}!`)); });
      }
    }
    // Jigsaws
    add(L("Hmm, try another spot!", "¡Mmm, prueba en otro lugar!"));
    for (const a of [...JIGSAW_ANIMALS, ...JIGSAW_VEHICLES]) {
      add(lang === "es" ? `¡Arma el ${a.es}!` : `Put the ${a.en} back together!`);
      add(lang === "es" ? `¡Hiciste un ${a.es}! ` : `You made a ${a.en}! `);
    }
    for (const c of [...letterCardSpecs().map(letterCard), ...numberCardSpecs(20).map(numberCard)]) {
      add(lang === "es" ? c.promptEs : c.promptEn);
      add(lang === "es" ? c.doneEs : c.doneEn);
    }
    // Shape Train
    add(L("Finish the shape train! What comes next?", "¡Completa el tren de figuras! ¿Qué sigue?"));
    add(L("That car needs a different shape. Look at the pattern!", "Ese vagón necesita otra figura. ¡Mira el patrón!"));
    for (let lvl = 1; lvl <= 6; lvl++) for (let i = 0; i < 300; i++) {
      const s = shapeTrainSet(lvl);
      s.cars.forEach((c) => add(noun(c.shape)));
      const pattern = s.cars.map((c) => noun(c.shape)).join(", ");
      add(L(`Choo choo! ${pattern}!`, `¡Chu chu! ¡${pattern}!`));
    }
  }
  writeFileSync("/tmp/new-game-lines.tsv", [...out].join("\n"));
}, 120000);
