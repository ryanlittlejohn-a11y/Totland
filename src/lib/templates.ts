/**
 * Game templates: the reusable round generators every catalog game is built
 * from. A game is data (see catalog.ts) + a template id — no game has its own
 * bespoke architecture, so new games are added by adding a record.
 */
import { COLORS, LETTERS, SHAPES, WORDS, pick, shuffle, type SkillId } from "./content";
import { generateRound, type Option, type Round } from "./games";

export type TemplateId =
  | "letter-find"
  | "letter-sequence"
  | "letter-case"
  | "letter-shadow"
  | "letter-hunt"
  | "letter-puzzle"
  | "phonics-first"
  | "word-picture"
  | "word-missing"
  | "word-build"
  | "rhyme"
  | "count"
  | "number-find"
  | "number-sequence"
  | "number-compare"
  | "number-quantity"
  | "color-find"
  | "color-match"
  | "shape-find"
  | "shape-shadow"
  | "pattern-next"
  | "odd-one-out"
  | "size-sort"
  | "shadow-match"
  | "hidden-object"
  | "wordsearch"
  | "memory"
  | "tracing"
  | "flashcards"
  | "story"
  | "jigsaw";

/** templates that use their own full-screen component instead of choice rounds */
export const SPECIAL_TEMPLATES: TemplateId[] = ["memory", "tracing", "flashcards", "story"];

export interface TemplateOpts {
  /** letter-case: "lower" asks for the lowercase twin, "upper" the uppercase one */
  mode?: "lower" | "upper";
  /** number templates: highest number used */
  max?: number;
}

const NUMBER_WORDS = [
  "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen",
  "eighteen", "nineteen", "twenty",
];

const RHYMES: [string, string, string][] = [
  ["cat", "🐱", "hat"],
  ["dog", "🐶", "frog"],
  ["star", "⭐", "car"],
  ["bee", "🐝", "tree"],
  ["moon", "🌙", "spoon"],
  ["sun", "☀️", "bun"],
  ["snake", "🐍", "cake"],
  ["fox", "🦊", "box"],
];

const PATTERN_ITEMS = ["🍎", "⭐", "🐻", "🔵", "🌻", "🚗", "🐝", "🍌"];

const choiceCount = (level: number) => (level <= 1 ? 2 : level <= 3 ? 3 : 4);
const numberMax = (level: number) => (level <= 1 ? 5 : level <= 2 ? 10 : level <= 4 ? 15 : 20);
const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

function opts(list: (Option | string)[]): Option[] {
  return list.map((o) => (typeof o === "string" ? { id: o, label: o } : o));
}

function letterSequence(level: number): Round {
  const start = Math.floor(Math.random() * (26 - 4));
  const window = LETTERS.slice(start, start + 4);
  const gap = 1 + Math.floor(Math.random() * 2);
  const answer = window[gap]!;
  const shown = window.map((l, i) => (i === gap ? "＿" : l)).join(" ");
  const others = shuffle(LETTERS.filter((l) => !window.includes(l))).slice(0, choiceCount(level) - 1);
  return {
    skill: "letters",
    prompt: `${shown}  — which letter is missing?`,
    spoken: `Which letter is missing? ${window.map((l, i) => (i === gap ? "hmm" : l)).join(", ")}`,
    options: opts(shuffle([answer, ...others]).map((l) => ({ id: l, label: l, big: true }))),
    answerId: answer,
    hint: `After ${window[gap - 1]} comes ${answer}.`,
    reveal: `${answer}! ${window.join(" ")}`,
    columns: 3,
  };
}

function letterCase(level: number, mode: "lower" | "upper"): Round {
  const target = pick(LETTERS);
  const others = shuffle(LETTERS.filter((l) => l !== target)).slice(0, choiceCount(level) - 1);
  const show = (l: string) => (mode === "lower" ? l.toLowerCase() : l.toUpperCase());
  return {
    skill: "letters",
    prompt: mode === "lower" ? `Find the little ${target}` : `Find the big ${target.toLowerCase()}`,
    spoken: mode === "lower" ? `Find the small letter ${target}.` : `Find the big letter ${target}.`,
    options: opts(shuffle([target, ...others]).map((l) => ({ id: l, label: show(l), big: true }))),
    answerId: target,
    hint: `${target} and ${target.toLowerCase()} are twins.`,
    reveal: `${target} ${target.toLowerCase()} — a matching pair!`,
    columns: 3,
  };
}

function letterShadow(level: number): Round {
  const target = pick(LETTERS);
  const others = shuffle(LETTERS.filter((l) => l !== target)).slice(0, choiceCount(level) - 1);
  return {
    skill: "letters",
    prompt: `Which shadow belongs to ${target}?`,
    spoken: `Which shadow belongs to the letter ${target}?`,
    options: opts(shuffle([target, ...others]).map((l) => ({ id: l, label: l, big: true, shadow: true }))),
    answerId: target,
    hint: `Look for the same shape as ${target}.`,
    reveal: `That shadow is ${target}!`,
    columns: 3,
  };
}

function letterHunt(level: number): Round {
  const target = pick(LETTERS);
  const size = level <= 2 ? 6 : 9;
  const cells = Array.from({ length: size }, () => pick(LETTERS.filter((l) => l !== target)));
  const at = Math.floor(Math.random() * size);
  cells[at] = target;
  return {
    skill: "letters",
    prompt: `Hunt for the letter ${target}`,
    spoken: `Can you hunt for the letter ${target}?`,
    options: cells.map((c, i) => ({ id: `${c}-${i}`, label: c, big: true })),
    answerId: `${target}-${at}`,
    hint: `Look row by row for ${target}.`,
    reveal: `You found ${target}!`,
    columns: 3,
  };
}

function wordBuild(level: number): Round {
  const target = pick(WORDS);
  const answer = target.letter;
  const others = shuffle(LETTERS.filter((l) => l !== answer)).slice(0, choiceCount(level) - 1);
  return {
    skill: "words",
    prompt: `${target.emoji}  Which letter starts ${target.word.toUpperCase()}?`,
    spoken: `Which letter do we need to start the word ${target.word}?`,
    options: opts(shuffle([answer, ...others]).map((l) => ({ id: l, label: l, big: true }))),
    answerId: answer,
    hint: `${target.word} begins with ${answer}.`,
    reveal: `${target.word.toUpperCase()} ${target.emoji}`,
    columns: 3,
  };
}

function rhymeRound(level: number): Round {
  const [word, emoji, rhyme] = pick(RHYMES);
  const others = shuffle(RHYMES.filter((r) => r[2] !== rhyme))
    .slice(0, choiceCount(level) - 1)
    .map((r) => r[2]);
  return {
    skill: "phonics",
    prompt: `${emoji}  Which word rhymes with ${word}?`,
    spoken: `Which word rhymes with ${word}?`,
    options: opts(shuffle([rhyme, ...others])),
    answerId: rhyme,
    hint: `${word} … ${rhyme}. They sound the same at the end.`,
    reveal: `${word} and ${rhyme} rhyme!`,
    columns: 3,
  };
}

function numberFind(level: number): Round {
  const max = numberMax(level);
  const target = 1 + Math.floor(Math.random() * max);
  const others = shuffle(range(max).filter((n) => n !== target)).slice(0, choiceCount(level) - 1);
  return {
    skill: "numbers",
    prompt: `Can you find the number ${target}?`,
    spoken: `Can you find the number ${target}?`,
    options: opts(shuffle([target, ...others]).map((n) => ({ id: String(n), label: String(n), big: true }))),
    answerId: String(target),
    hint: `${target} is the one that looks like this: ${target}.`,
    reveal: `That's ${NUMBER_WORDS[target - 1]}!`,
    columns: 3,
  };
}

function numberSequence(level: number): Round {
  const max = numberMax(level);
  const start = 1 + Math.floor(Math.random() * Math.max(1, max - 4));
  const window = [start, start + 1, start + 2, start + 3];
  const gap = 1 + Math.floor(Math.random() * 2);
  const answer = window[gap]!;
  const others = shuffle(range(max + 2).filter((n) => !window.includes(n))).slice(0, choiceCount(level) - 1);
  return {
    skill: "numbers",
    prompt: `${window.map((n, i) => (i === gap ? "＿" : n)).join("  ")} — what comes here?`,
    spoken: "Which number is missing?",
    options: opts(shuffle([answer, ...others]).map((n) => ({ id: String(n), label: String(n), big: true }))),
    answerId: String(answer),
    hint: `After ${window[gap - 1]} comes ${answer}.`,
    reveal: `${window.join(", ")} — well counted!`,
    columns: 3,
  };
}

function numberCompare(level: number, mode: "more" | "bigger"): Round {
  const max = numberMax(level);
  let a = 1 + Math.floor(Math.random() * max);
  let b = 1 + Math.floor(Math.random() * max);
  while (b === a) b = 1 + Math.floor(Math.random() * max);
  const answer = Math.max(a, b);
  const item = pick(["🍓", "🐟", "🎈", "⭐"]);
  if (mode === "more") {
    return {
      skill: "numbers",
      prompt: "Which group has more?",
      spoken: "Which group has more? Count them both.",
      options: [a, b].map((n) => ({
        id: String(n),
        label: item.repeat(Math.min(n, 10)),
      })),
      answerId: String(answer),
      hint: "Count each group slowly with your finger.",
      reveal: `${answer} is more than ${Math.min(a, b)}.`,
      columns: 2,
    };
  }
  return {
    skill: "numbers",
    prompt: "Which number is bigger?",
    spoken: "Which number is bigger?",
    options: [a, b].map((n) => ({ id: String(n), label: String(n), big: true })),
    answerId: String(answer),
    hint: "The bigger number comes later when we count.",
    reveal: `${answer} is bigger than ${Math.min(a, b)}.`,
    columns: 2,
  };
}

function numberQuantity(level: number): Round {
  const max = numberMax(level);
  const target = 1 + Math.floor(Math.random() * max);
  const item = pick(["🐞", "🍎", "⭐", "🐤"]);
  const others = shuffle(range(max).filter((n) => n !== target)).slice(0, choiceCount(level) - 1);
  return {
    skill: "numbers",
    prompt: `Which group shows ${target}?`,
    spoken: `Which group shows ${target}?`,
    options: shuffle([target, ...others]).map((n) => ({
      id: String(n),
      label: item.repeat(Math.min(n, 10)),
    })),
    answerId: String(target),
    hint: `Count until you reach ${target}.`,
    reveal: `${target} — ${NUMBER_WORDS[target - 1]}!`,
    columns: 2,
  };
}

function colorMatch(level: number): Round {
  const target = pick(COLORS);
  const others = shuffle(COLORS.filter((c) => c.name !== target.name)).slice(0, choiceCount(level) - 1);
  return {
    skill: "colors",
    prompt: `Which one is the same color as this ${target.emoji}?`,
    spoken: `Find something the same color as this ${target.emoji}.`,
    options: shuffle([target, ...others]).map((c) => ({ id: c.name, swatch: c.swatch })),
    answerId: target.name,
    hint: `${target.emoji} is ${target.name}.`,
    reveal: `Both are ${target.name}!`,
    columns: 3,
  };
}

function shapeShadow(level: number): Round {
  const target = pick(SHAPES);
  const others = shuffle(SHAPES.filter((s) => s.name !== target.name)).slice(0, choiceCount(level) - 1);
  return {
    skill: "shapes",
    prompt: `Which shadow fits the ${target.name}?`,
    spoken: `Which shadow fits the ${target.name}?`,
    options: shuffle([target, ...others]).map((s) => ({ id: s.name, clip: s.clip, shadow: true })),
    answerId: target.name,
    hint: `A ${target.name} looks like ${target.emoji}.`,
    reveal: `Yes — the ${target.name}!`,
    columns: 3,
  };
}

function patternNext(level: number): Round {
  const [a, b] = shuffle(PATTERN_ITEMS).slice(0, 2) as [string, string];
  const reps = level <= 2 ? 2 : 3;
  const seq = Array.from({ length: reps * 2 }, (_, i) => (i % 2 === 0 ? a : b));
  const answer = seq.length % 2 === 0 ? a : b;
  const others = shuffle(PATTERN_ITEMS.filter((x) => x !== answer)).slice(0, choiceCount(level) - 1);
  return {
    skill: "puzzles",
    prompt: `${seq.join(" ")} …  What comes next?`,
    spoken: "What comes next in the pattern?",
    options: shuffle([answer, ...others]).map((e) => ({ id: e, emoji: e })),
    answerId: answer,
    hint: `The pattern goes ${a}, ${b}, ${a}, ${b}.`,
    reveal: "You finished the pattern!",
    columns: 3,
  };
}

function oddOneOut(level: number): Round {
  const [same, odd] = shuffle(PATTERN_ITEMS).slice(0, 2) as [string, string];
  const count = choiceCount(level) + 1;
  const items = Array.from({ length: count - 1 }, (_, i) => ({ id: `same-${i}`, emoji: same }));
  const answer = { id: "odd", emoji: odd };
  return {
    skill: "puzzles",
    prompt: "Which one is different?",
    spoken: "Which one is different?",
    options: shuffle([...items, answer]),
    answerId: "odd",
    hint: "Most of them look the same — find the odd one.",
    reveal: "You spotted the different one!",
    columns: 3,
  };
}

function sizeSort(mode: "big" | "small"): Round {
  const item = pick(PATTERN_ITEMS);
  const answer = mode === "big" ? "big" : "small";
  return {
    skill: "puzzles",
    prompt: mode === "big" ? "Which one is bigger?" : "Which one is smaller?",
    spoken: mode === "big" ? "Which one is bigger?" : "Which one is smaller?",
    options: shuffle([
      { id: "big", emoji: item, size: "lg" as const },
      { id: "small", emoji: item, size: "sm" as const },
    ]),
    answerId: answer,
    hint: "Look at how much space each one takes up.",
    reveal: mode === "big" ? "That one is bigger!" : "That one is smaller!",
    columns: 2,
  };
}

function shadowMatch(level: number): Round {
  const target = pick(WORDS);
  const others = shuffle(WORDS.filter((w) => w.word !== target.word)).slice(0, choiceCount(level) - 1);
  return {
    skill: "puzzles",
    prompt: `Which shadow is the ${target.word}?`,
    spoken: `Which shadow belongs to the ${target.word}?`,
    options: shuffle([target, ...others]).map((w) => ({ id: w.word, emoji: w.emoji, shadow: true })),
    answerId: target.word,
    hint: `Think about the shape of a ${target.word}.`,
    reveal: `${target.word} ${target.emoji}`,
    columns: 3,
  };
}

function hiddenObject(level: number): Round {
  const target = pick(WORDS);
  const size = level <= 2 ? 6 : 9;
  const fillers = shuffle(WORDS.filter((w) => w.word !== target.word)).slice(0, size);
  const cells = fillers.map((w, i) => ({ id: `f-${i}`, emoji: w.emoji }));
  const at = Math.floor(Math.random() * cells.length);
  cells[at] = { id: "target", emoji: target.emoji };
  return {
    skill: "puzzles",
    prompt: `Find the ${target.word}`,
    spoken: `Can you find the ${target.word}?`,
    options: cells,
    answerId: "target",
    hint: `Look for ${target.emoji}.`,
    reveal: `You found the ${target.word}!`,
    columns: 3,
  };
}

function wordSearchWords(level: number): Round {
  const target = pick(WORDS);
  const size = level <= 2 ? 6 : 9;
  const fillers = shuffle(WORDS.filter((w) => w.word !== target.word)).slice(0, size);
  const cells = fillers.map((w, i) => ({ id: `w-${i}`, label: w.word }));
  const at = Math.floor(Math.random() * cells.length);
  cells[at] = { id: "target", label: target.word };
  return {
    skill: "wordsearch",
    prompt: `${target.emoji}  Find the word "${target.word}"`,
    spoken: `Find the word ${target.word}.`,
    options: cells,
    answerId: "target",
    hint: `The word ${target.word} starts with ${target.letter}.`,
    reveal: `${target.word.toUpperCase()} ${target.emoji}`,
    columns: 3,
  };
}

/** Single entry point: every choice-based game in the catalog comes from here. */
export function generateTemplateRound(t: TemplateId, level: number, o: TemplateOpts = {}): Round {
  switch (t) {
    case "letter-sequence":
      return letterSequence(level);
    case "letter-case":
      return letterCase(level, o.mode ?? "lower");
    case "letter-shadow":
      return letterShadow(level);
    case "letter-hunt":
      return letterHunt(level);
    case "letter-puzzle":
      return generateRound("puzzles", level);
    case "phonics-first":
      return generateRound("phonics", level);
    case "word-picture":
      return generateRound("words", level);
    case "word-missing":
      return generateRound("puzzles", level);
    case "word-build":
      return wordBuild(level);
    case "rhyme":
      return rhymeRound(level);
    case "count":
      return generateRound("numbers", level);
    case "number-find":
      return numberFind(level);
    case "number-sequence":
      return numberSequence(level);
    case "number-compare":
      return numberCompare(level, o.mode === "upper" ? "bigger" : "more");
    case "number-quantity":
      return numberQuantity(level);
    case "color-find":
      return generateRound("colors", level);
    case "color-match":
      return colorMatch(level);
    case "shape-find":
      return generateRound("shapes", level);
    case "shape-shadow":
      return shapeShadow(level);
    case "pattern-next":
      return patternNext(level);
    case "odd-one-out":
      return oddOneOut(level);
    case "size-sort":
      return sizeSort(o.mode === "upper" ? "big" : "small");
    case "shadow-match":
      return shadowMatch(level);
    case "hidden-object":
      return hiddenObject(level);
    case "wordsearch":
      return o.mode === "upper" ? generateRound("wordsearch", level) : wordSearchWords(level);
    case "jigsaw":
      return generateRound("puzzles", level);
    default:
      return generateRound("letters", level);
  }
}

export const templateSkill = (t: TemplateId): SkillId => generateTemplateRound(t, 1).skill;
