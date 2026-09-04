import {
  COLORS,
  LETTERS,
  SHAPES,
  WORDS,
  pick,
  shuffle,
  wordsForLetter,
  type SkillId,
} from "./content";

export interface Option {
  id: string;
  label?: string;
  emoji?: string;
  swatch?: string;
  clip?: string;
  big?: boolean;
  /** render as a dark silhouette (shadow-matching games) */
  shadow?: boolean;
  /** relative size, for bigger/smaller comparisons */
  size?: "sm" | "lg";
}

export interface Round {
  skill: SkillId;
  prompt: string;
  spoken: string;
  options: Option[];
  answerId: string;
  hint: string;
  reveal?: string;
  columns: 2 | 3;
}

/** number of options grows with the child's level */
const choiceCount = (level: number) => (level <= 1 ? 2 : level <= 3 ? 3 : 4);

function letterRound(level: number): Round {
  const target = pick(LETTERS);
  const others = shuffle(LETTERS.filter((l) => l !== target)).slice(0, choiceCount(level) - 1);
  const w = wordsForLetter(target)[0];
  return {
    skill: "letters",
    prompt: `Can you find the letter ${target}?`,
    spoken: `Can you find the letter ${target}?`,
    options: shuffle([target, ...others]).map((l) => ({ id: l, label: l, big: true })),
    answerId: target,
    hint: `${target} looks like this. Tap the ${target}.`,
    reveal: w ? `${target} is for ${w.word}! ${w.emoji}` : `That's ${target}!`,
    columns: 3,
  };
}

function phonicsRound(level: number): Round {
  const target = pick(WORDS);
  const others = shuffle(WORDS.filter((w) => w.letter !== target.letter)).slice(0, choiceCount(level) - 1);
  return {
    skill: "phonics",
    prompt: `Which one starts with ${target.letter}?`,
    spoken: `Which one starts with the sound ${target.letter}?`,
    options: shuffle([target, ...others]).map((w) => ({ id: w.word, emoji: w.emoji, label: w.word })),
    answerId: target.word,
    hint: `${target.letter} says ${target.letter}. Listen: ${target.word}.`,
    reveal: `${target.word} starts with ${target.letter}!`,
    columns: 3,
  };
}

function numberRound(level: number): Round {
  const max = level <= 1 ? 5 : level <= 3 ? 10 : 20;
  const count = 1 + Math.floor(Math.random() * max);
  const item = pick(["🐤", "🐟", "🍎", "⭐", "🐞", "🎈"]);
  const others = shuffle(
    Array.from({ length: max }, (_, i) => i + 1).filter((n) => n !== count),
  ).slice(0, choiceCount(level) - 1);
  return {
    skill: "numbers",
    prompt: `How many ${item} do you see?`,
    spoken: "How many do you see? Count them with me.",
    options: shuffle([count, ...others]).map((n) => ({ id: String(n), label: String(n), big: true })),
    answerId: String(count),
    hint: `Point and count: ${Array.from({ length: count }, (_, i) => i + 1).join(", ")}.`,
    reveal: `${count}! There are ${count} ${item}.`,
    columns: 3,
  };
}

function colorRound(level: number): Round {
  const target = pick(COLORS);
  const others = shuffle(COLORS.filter((c) => c.name !== target.name)).slice(0, choiceCount(level) - 1);
  return {
    skill: "colors",
    prompt: `Tap the ${target.name} one!`,
    spoken: `Can you tap the color ${target.name}?`,
    options: shuffle([target, ...others]).map((c) => ({ id: c.name, swatch: c.swatch })),
    answerId: target.name,
    hint: `${target.name} looks like ${target.emoji}.`,
    reveal: `That's ${target.name}!`,
    columns: 3,
  };
}

function shapeRound(level: number): Round {
  const target = pick(SHAPES);
  const others = shuffle(SHAPES.filter((s) => s.name !== target.name)).slice(0, choiceCount(level) - 1);
  return {
    skill: "shapes",
    prompt: `Where is the ${target.name}?`,
    spoken: `Where is the ${target.name}?`,
    options: shuffle([target, ...others]).map((s) => ({ id: s.name, clip: s.clip })),
    answerId: target.name,
    hint: `A ${target.name} looks like ${target.emoji}.`,
    reveal: `Yes — a ${target.name}!`,
    columns: 3,
  };
}

function wordRound(level: number): Round {
  const target = pick(WORDS);
  const others = shuffle(WORDS.filter((w) => w.word !== target.word)).slice(0, choiceCount(level) - 1);
  return {
    skill: "words",
    prompt: `Which picture is the ${target.word}?`,
    spoken: `Find the ${target.word}.`,
    options: shuffle([target, ...others]).map((w) => ({ id: w.word, emoji: w.emoji })),
    answerId: target.word,
    hint: `Look for the ${target.word}.`,
    reveal: `${target.word} ${target.emoji}`,
    columns: 3,
  };
}

function puzzleRound(level: number): Round {
  const target = pick(WORDS);
  const missingIndex = Math.min(1, target.word.length - 1);
  const shown = target.word
    .split("")
    .map((ch, i) => (i === missingIndex ? "_" : ch))
    .join("");
  const answer = target.word.charAt(missingIndex).toUpperCase();
  const others = shuffle(LETTERS.filter((l) => l !== answer)).slice(0, choiceCount(level) - 1);
  return {
    skill: "puzzles",
    prompt: `${target.emoji}  ${shown.toUpperCase()} — which piece fits?`,
    spoken: `Which letter finishes the word ${target.word}?`,
    options: shuffle([answer, ...others]).map((l) => ({ id: l, label: l, big: true })),
    answerId: answer,
    hint: `The word is ${target.word}.`,
    reveal: `${target.word.toUpperCase()} ${target.emoji}`,
    columns: 3,
  };
}

function wordSearchRound(level: number): Round {
  const target = pick(LETTERS);
  const size = level <= 2 ? 9 : 12;
  const cells = Array.from({ length: size }, () => pick(LETTERS.filter((l) => l !== target)));
  const at = Math.floor(Math.random() * size);
  cells[at] = target;
  return {
    skill: "wordsearch",
    prompt: `Find the hidden ${target} in the grid`,
    spoken: `Look carefully. Find the letter ${target}.`,
    options: cells.map((c, i) => ({ id: `${c}-${i}`, label: c })),
    answerId: `${target}-${at}`,
    hint: `Look slowly, row by row, for ${target}.`,
    reveal: `You found ${target}!`,
    columns: 3,
  };
}

export function generateRound(skill: SkillId, level: number): Round {
  switch (skill) {
    case "numbers":
      return numberRound(level);
    case "colors":
      return colorRound(level);
    case "shapes":
      return shapeRound(level);
    case "words":
      return wordRound(level);
    case "phonics":
      return phonicsRound(level);
    case "puzzles":
      return puzzleRound(level);
    case "wordsearch":
      return wordSearchRound(level);
    default:
      return letterRound(level);
  }
}

/** Today's Adventure: a short mixed session that adapts to the child. */
export function adventurePlan(levels: Partial<Record<SkillId, number>>): SkillId[] {
  const base: SkillId[] = ["letters", "numbers", "words", "puzzles", "colors"];
  return base.sort((a, b) => (levels[a] ?? 1) - (levels[b] ?? 1));
}

/** Memory game deck. */
export function memoryDeck(level: number) {
  const pairs = level <= 1 ? 3 : level <= 3 ? 4 : 6;
  const chosen = shuffle(WORDS).slice(0, pairs);
  return shuffle(
    chosen.flatMap((w, i) => [
      { key: `${i}-a`, pairId: w.word, emoji: w.emoji },
      { key: `${i}-b`, pairId: w.word, emoji: w.emoji },
    ]),
  );
}
