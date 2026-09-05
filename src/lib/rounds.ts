/**
 * Round generation engine.
 *
 * Every "choice" game in the catalog is produced here from structured content.
 * Rules enforced globally: 2–4 options for young levels, spoken instruction on
 * every round, a hint always available, and never any negative language.
 */
import {
  CATEGORIES,
  COLORS,
  CVC_WORDS,
  LETTERS,
  NUMBER_WORDS,
  RHYMES,
  RHYME_EMOJI,
  SHAPES,
  WORDS,
  pick,
  shuffle,
  wordsForLetter,
} from "./content";
import type { Round, Option } from "./games";

const count = (level: number) => (level <= 1 ? 2 : level <= 3 ? 3 : 4);
const range = (n: number, from = 1) => Array.from({ length: n }, (_, i) => i + from);
const maxNumber = (level: number) => (level <= 1 ? 5 : level <= 2 ? 10 : level <= 4 ? 15 : 20);

function base(partial: Omit<Round, "columns"> & { columns?: 2 | 3 }): Round {
  return { columns: 3, ...partial } as Round;
}

/* ---------------------------------------------------------------- letters */

function findUpper(level: number): Round {
  const target = pick(LETTERS);
  const others = shuffle(LETTERS.filter((l) => l !== target)).slice(0, count(level) - 1);
  const w = wordsForLetter(target)[0];
  return base({
    skill: "letters",
    prompt: `Can you find the letter ${target}?`,
    spoken: `Can you find the letter ${target}?`,
    options: shuffle([target, ...others]).map((l) => ({ id: l, label: l, big: true })),
    answerId: target,
    hint: `Look for the letter ${target}.`,
    reveal: w ? `${target} is for ${w.word}! ${w.emoji}` : `That's ${target}!`,
  });
}

function caseMatch(level: number, upperPrompt: boolean): Round {
  const target = pick(LETTERS);
  const others = shuffle(LETTERS.filter((l) => l !== target)).slice(0, count(level) - 1);
  const shown = upperPrompt ? target : target.toLowerCase();
  const opts = shuffle([target, ...others]).map((l) => ({
    id: l,
    label: upperPrompt ? l.toLowerCase() : l,
    big: true,
  }));
  return base({
    skill: "letters",
    prompt: `Which one is the ${upperPrompt ? "little" : "big"} ${shown}?`,
    spoken: `Find the ${upperPrompt ? "small" : "capital"} letter ${target}.`,
    options: opts,
    answerId: target,
    hint: `Big ${target} and little ${target.toLowerCase()} are the same letter.`,
    reveal: `${target} and ${target.toLowerCase()} — a pair!`,
  });
}

function letterShadow(level: number): Round {
  const target = pick(LETTERS);
  const others = shuffle(LETTERS.filter((l) => l !== target)).slice(0, count(level) - 1);
  return base({
    skill: "letters",
    prompt: `Whose shadow is this?  ▐ ${target} ▌`,
    spoken: `Which letter fits this shadow?`,
    options: shuffle([target, ...others]).map((l) => ({ id: l, label: l, big: true })),
    answerId: target,
    hint: `The shadow has the same shape as ${target}.`,
    reveal: `It was ${target}!`,
  });
}

function missingLetter(level: number): Round {
  const i = Math.floor(Math.random() * (LETTERS.length - 3)) + 1;
  const target = LETTERS[i]!;
  const seq = `${LETTERS[i - 1]}, ___, ${LETTERS[i + 1]}`;
  const others = shuffle(LETTERS.filter((l) => l !== target)).slice(0, count(level) - 1);
  return base({
    skill: "letters",
    prompt: `${seq} — which letter is missing?`,
    spoken: `${LETTERS[i - 1]}, what comes next, ${LETTERS[i + 1]}?`,
    options: shuffle([target, ...others]).map((l) => ({ id: l, label: l, big: true })),
    answerId: target,
    hint: `Sing the alphabet from ${LETTERS[i - 1]}.`,
    reveal: `${LETTERS[i - 1]}, ${target}, ${LETTERS[i + 1]}!`,
  });
}

function letterPuzzle(level: number): Round {
  const target = pick(LETTERS);
  const others = shuffle(LETTERS.filter((l) => l !== target)).slice(0, count(level) - 1);
  return base({
    skill: "puzzles",
    prompt: `Which piece finishes this letter?`,
    spoken: `Which piece finishes the letter ${target}?`,
    options: shuffle([target, ...others]).map((l) => ({ id: l, label: l, big: true })),
    answerId: target,
    hint: `The letter is ${target}.`,
    reveal: `You built ${target}!`,
  });
}

function numberPuzzle(level: number): Round {
  const max = maxNumber(level);
  const target = pick(range(max));
  const others = shuffle(range(max).filter((n) => n !== target)).slice(0, count(level) - 1);
  return base({
    skill: "puzzles",
    prompt: `Which piece finishes this number?`,
    spoken: `Which piece finishes the number ${target}?`,
    options: shuffle([target, ...others]).map((n) => ({ id: String(n), label: String(n), big: true })),
    answerId: String(target),
    hint: `The number is ${target}.`,
    reveal: `You built ${target}!`,
  });
}

/* ---------------------------------------------------------------- phonics */

function startsWith(level: number): Round {
  const target = pick(WORDS);
  const others = shuffle(WORDS.filter((w) => w.letter !== target.letter)).slice(0, count(level) - 1);
  return base({
    skill: "phonics",
    prompt: `Which one starts with ${target.letter}?`,
    spoken: `Which one starts with the sound ${target.letter}?`,
    options: shuffle([target, ...others]).map((w) => ({ id: w.word, emoji: w.emoji, label: w.word })),
    answerId: target.word,
    hint: `Listen: ${target.word} starts with ${target.letter}.`,
    reveal: `${target.word} starts with ${target.letter}!`,
  });
}

function letterSound(level: number): Round {
  const target = pick(WORDS);
  const others = shuffle(LETTERS.filter((l) => l !== target.letter)).slice(0, count(level) - 1);
  return base({
    skill: "phonics",
    prompt: `${target.emoji}  Which letter makes that first sound?`,
    spoken: `${target.word}. Which letter starts ${target.word}?`,
    options: shuffle([target.letter, ...others]).map((l) => ({ id: l, label: l, big: true })),
    answerId: target.letter,
    hint: `${target.word} — ${target.letter}.`,
    reveal: `${target.letter} is for ${target.word}!`,
  });
}

function sameSound(level: number): Round {
  const target = pick(WORDS.filter((w) => wordsForLetter(w.letter).length > 1));
  const mate = pick(wordsForLetter(target.letter).filter((w) => w.word !== target.word));
  const others = shuffle(WORDS.filter((w) => w.letter !== target.letter)).slice(0, count(level) - 1);
  return base({
    skill: "phonics",
    prompt: `${target.emoji} ${target.word} — which one has the same first sound?`,
    spoken: `Which word starts like ${target.word}?`,
    options: shuffle([mate, ...others]).map((w) => ({ id: w.word, emoji: w.emoji, label: w.word })),
    answerId: mate.word,
    hint: `Both start with ${target.letter}.`,
    reveal: `${target.word} and ${mate.word} both start with ${target.letter}!`,
  });
}

function rhyme(level: number): Round {
  const [a, b] = pick(RHYMES) as [string, string];
  const pool = RHYMES.flat().filter((w) => w !== a && w !== b);
  const others = shuffle(pool).slice(0, count(level) - 1);
  return base({
    skill: "words",
    prompt: `${RHYME_EMOJI[a]} ${a} — which word rhymes?`,
    spoken: `Which word rhymes with ${a}?`,
    options: shuffle([b, ...others]).map((w) => ({ id: w, emoji: RHYME_EMOJI[w] ?? "🔤", label: w })),
    answerId: b,
    hint: `${a}… ${b}. They sound the same at the end.`,
    reveal: `${a} and ${b} rhyme!`,
  });
}

/* ------------------------------------------------------------------ words */

function pictureWord(level: number): Round {
  const target = pick(WORDS);
  const others = shuffle(WORDS.filter((w) => w.word !== target.word)).slice(0, count(level) - 1);
  return base({
    skill: "words",
    prompt: `${target.emoji}  Which word says it?`,
    spoken: `Which word says ${target.word}?`,
    options: shuffle([target, ...others]).map((w) => ({ id: w.word, label: w.word.toUpperCase() })),
    answerId: target.word,
    hint: `It starts with ${target.letter}.`,
    reveal: `${target.word.toUpperCase()} ${target.emoji}`,
  });
}

function wordPictureRound(level: number): Round {
  const target = pick(WORDS);
  const others = shuffle(WORDS.filter((w) => w.word !== target.word)).slice(0, count(level) - 1);
  return base({
    skill: "words",
    prompt: `Which picture is the ${target.word}?`,
    spoken: `Find the ${target.word}.`,
    options: shuffle([target, ...others]).map((w) => ({ id: w.word, emoji: w.emoji, label: w.word })),
    answerId: target.word,
    hint: `Look for the ${target.word}.`,
    reveal: `${target.word} ${target.emoji}`,
  });
}

function missingLetterWord(level: number): Round {
  const target = pick(CVC_WORDS);
  const idx = Math.floor(Math.random() * target.word.length);
  const shown = target.word
    .split("")
    .map((c, i) => (i === idx ? "_" : c))
    .join("")
    .toUpperCase();
  const answer = target.word.charAt(idx).toUpperCase();
  const others = shuffle(LETTERS.filter((l) => l !== answer)).slice(0, count(level) - 1);
  return base({
    skill: "words",
    prompt: `${target.emoji}  ${shown}`,
    spoken: `Which letter finishes the word ${target.word}?`,
    options: shuffle([answer, ...others]).map((l) => ({ id: l, label: l, big: true })),
    answerId: answer,
    hint: `The word is ${target.word}.`,
    reveal: `${target.word.toUpperCase()} ${target.emoji}`,
  });
}

/* ---------------------------------------------------------------- numbers */

function countObjects(level: number): Round {
  const max = maxNumber(level);
  const n = 1 + Math.floor(Math.random() * max);
  const item = pick(["🐤", "🐟", "🍎", "⭐", "🐞", "🎈", "🐑", "🍓"]);
  const others = shuffle(range(max).filter((x) => x !== n)).slice(0, count(level) - 1);
  return base({
    skill: "numbers",
    prompt: "How many do you see?",
    spoken: "How many do you see? Count them with me.",
    visual: item.repeat(n),
    options: shuffle([n, ...others]).map((x) => ({ id: String(x), label: String(x), big: true })),
    answerId: String(n),
    hint: `Point and count: ${range(n).join(", ")}.`,
    reveal: `${n}! There are ${n}.`,
  });
}

function findNumber(level: number): Round {
  const max = maxNumber(level);
  const n = pick(range(max));
  const others = shuffle(range(max).filter((x) => x !== n)).slice(0, count(level) - 1);
  return base({
    skill: "numbers",
    prompt: `Can you find the number ${n}?`,
    spoken: `Can you find the number ${n}?`,
    options: shuffle([n, ...others]).map((x) => ({ id: String(x), label: String(x), big: true })),
    answerId: String(n),
    hint: `${NUMBER_WORDS[n]} looks like ${n}.`,
    reveal: `That's ${n}!`,
  });
}

function numberQuantity(level: number): Round {
  const max = maxNumber(level);
  const n = 1 + Math.floor(Math.random() * Math.min(max, 10));
  const item = pick(["🌻", "🍪", "🐝", "🚗"]);
  const others = shuffle(range(Math.min(max, 10)).filter((x) => x !== n)).slice(0, count(level) - 1);
  return base({
    skill: "numbers",
    prompt: `Show me ${n} — tap the right group`,
    spoken: `Which group has ${n}?`,
    options: shuffle([n, ...others]).map((x) => ({ id: String(x), label: item.repeat(x) })),
    answerId: String(n),
    hint: `Count each group slowly.`,
    reveal: `${n} — exactly right!`,
  });
}

function missingNumber(level: number): Round {
  const max = maxNumber(level);
  const n = 2 + Math.floor(Math.random() * (max - 2));
  const others = shuffle(range(max).filter((x) => x !== n)).slice(0, count(level) - 1);
  return base({
    skill: "numbers",
    prompt: `${n - 1}, ___, ${n + 1}`,
    spoken: `${n - 1}, what comes next, ${n + 1}?`,
    options: shuffle([n, ...others]).map((x) => ({ id: String(x), label: String(x), big: true })),
    answerId: String(n),
    hint: `Count up from ${n - 1}.`,
    reveal: `${n - 1}, ${n}, ${n + 1}!`,
  });
}

function moreOrLess(level: number): Round {
  const item = pick(["🍎", "🐟", "⭐"]);
  const a = 1 + Math.floor(Math.random() * maxNumber(level));
  let b = 1 + Math.floor(Math.random() * maxNumber(level));
  while (b === a) b = 1 + Math.floor(Math.random() * maxNumber(level));
  const more = a > b ? "a" : "b";
  return base({
    skill: "numbers",
    prompt: "Which group has more?",
    spoken: "Which group has more?",
    options: shuffle([
      { id: "a", label: item.repeat(a) },
      { id: "b", label: item.repeat(b) },
    ]) as Option[],
    answerId: more,
    hint: "Count both groups and compare.",
    reveal: `${Math.max(a, b)} is more than ${Math.min(a, b)}.`,
    columns: 2,
  });
}

function biggerNumber(level: number): Round {
  const max = maxNumber(level);
  const a = pick(range(max));
  let b = pick(range(max));
  while (b === a) b = pick(range(max));
  const bigger = String(Math.max(a, b));
  return base({
    skill: "numbers",
    prompt: "Which number is bigger?",
    spoken: "Which number is bigger?",
    options: shuffle([a, b]).map((n) => ({ id: String(n), label: String(n), big: true })),
    answerId: bigger,
    hint: "The bigger number comes later when you count.",
    reveal: `${bigger} is bigger!`,
    columns: 2,
  });
}

/* --------------------------------------------------------- colors, shapes */

function findColor(level: number): Round {
  const target = pick(COLORS);
  const others = shuffle(COLORS.filter((c) => c.name !== target.name)).slice(0, count(level) - 1);
  return base({
    skill: "colors",
    prompt: `Tap the ${target.name} one!`,
    spoken: `Can you tap the colour ${target.name}?`,
    options: shuffle([target, ...others]).map((c) => ({ id: c.name, swatch: c.swatch, label: c.name })),
    answerId: target.name,
    hint: `${target.name} looks like ${target.emoji}.`,
    reveal: `That's ${target.name}!`,
  });
}

function colorMatch(level: number): Round {
  const target = pick(COLORS);
  const others = shuffle(COLORS.filter((c) => c.name !== target.name)).slice(0, count(level) - 1);
  return base({
    skill: "colors",
    prompt: `${target.emoji}  Which one is the same colour?`,
    spoken: `Find the colour that matches.`,
    options: shuffle([target, ...others]).map((c) => ({ id: c.name, swatch: c.swatch, label: c.name })),
    answerId: target.name,
    hint: `It is ${target.name}.`,
    reveal: `Both are ${target.name}!`,
  });
}

function sortColor(level: number): Round {
  const target = pick(COLORS);
  const others = shuffle(COLORS.filter((c) => c.name !== target.name)).slice(0, count(level) - 1);
  return base({
    skill: "colors",
    prompt: `Put the ${target.name} thing in the ${target.name} basket`,
    spoken: `Which one belongs in the ${target.name} basket?`,
    options: shuffle([target, ...others]).map((c) => ({ id: c.name, emoji: c.emoji, label: c.name })),
    answerId: target.name,
    hint: `Look for something ${target.name}.`,
    reveal: `${target.emoji} is ${target.name}!`,
  });
}

function findShape(level: number): Round {
  const target = pick(SHAPES);
  const others = shuffle(SHAPES.filter((s) => s.name !== target.name)).slice(0, count(level) - 1);
  return base({
    skill: "shapes",
    prompt: `Where is the ${target.name}?`,
    spoken: `Where is the ${target.name}?`,
    options: shuffle([target, ...others]).map((s) => ({ id: s.name, clip: s.clip, label: s.name })),
    answerId: target.name,
    hint: `A ${target.name} looks like ${target.emoji}.`,
    reveal: `Yes — a ${target.name}!`,
  });
}

function shapeShadow(level: number): Round {
  const r = findShape(level);
  return { ...r, prompt: "Which shape fits the shadow?", spoken: "Which shape fits this shadow?" };
}

function shapeMatch(level: number): Round {
  const r = findShape(level);
  const name = r.answerId;
  return { ...r, prompt: `Find the other ${name}`, spoken: `Find the shape that matches the ${name}.` };
}

function sortShape(level: number): Round {
  const r = findShape(level);
  return {
    ...r,
    prompt: `Which one goes in the ${r.answerId} box?`,
    spoken: `Which shape goes in the ${r.answerId} box?`,
  };
}

function shapeMissing(level: number): Round {
  const target = pick(SHAPES);
  const others = shuffle(SHAPES.filter((s) => s.name !== target.name)).slice(0, count(level) - 1);
  return base({
    skill: "shapes",
    prompt: `Something is missing — which shape completes it?`,
    spoken: `Which shape is missing?`,
    options: shuffle([target, ...others]).map((s) => ({ id: s.name, clip: s.clip, label: s.name })),
    answerId: target.name,
    hint: `Look at the empty space — it is a ${target.name}.`,
    reveal: `The ${target.name} fits!`,
  });
}

function patternNext(level: number): Round {
  const [a, b] = shuffle(SHAPES).slice(0, 2) as [typeof SHAPES[number], typeof SHAPES[number]];
  const seq = [a, b, a, b];
  const answer = a;
  const others = shuffle(SHAPES.filter((s) => s.name !== answer.name)).slice(0, count(level) - 1);
  return base({
    skill: "shapes",
    prompt: `${seq.map((s) => s.emoji).join(" ")} … what comes next?`,
    spoken: "Which shape comes next in the pattern?",
    options: shuffle([answer, ...others]).map((s) => ({ id: s.name, clip: s.clip, label: s.name })),
    answerId: answer.name,
    hint: `The pattern goes ${a.name}, ${b.name}, ${a.name}, ${b.name}…`,
    reveal: `A ${answer.name} comes next!`,
  });
}

/* ------------------------------------------------------------------ logic */

function whichDifferent(level: number): Round {
  const same = pick(WORDS);
  const odd = pick(WORDS.filter((w) => w.word !== same.word));
  const n = count(level) + 1;
  const opts: Option[] = shuffle([
    ...Array.from({ length: n - 1 }, (_, i) => ({ id: `same-${i}`, emoji: same.emoji, label: same.word })),
    { id: "odd", emoji: odd.emoji, label: odd.word },
  ]);
  return base({
    skill: "puzzles",
    prompt: "Which one is different?",
    spoken: "Which one is different?",
    options: opts,
    answerId: "odd",
    hint: "Most of them look the same — find the one that does not.",
    reveal: `The ${odd.word} was different!`,
  });
}

function whichNext(level: number): Round {
  const max = maxNumber(level);
  const start = 1 + Math.floor(Math.random() * (max - 3));
  const answer = start + 3;
  const others = shuffle(range(max + 2).filter((n) => n !== answer)).slice(0, count(level) - 1);
  return base({
    skill: "puzzles",
    prompt: `${start}, ${start + 1}, ${start + 2}, …`,
    spoken: `${start}, ${start + 1}, ${start + 2}. What comes next?`,
    options: shuffle([answer, ...others]).map((n) => ({ id: String(n), label: String(n), big: true })),
    answerId: String(answer),
    hint: `Keep counting after ${start + 2}.`,
    reveal: `${answer} comes next!`,
  });
}

function sortRule(level: number): Round {
  const cat = pick(CATEGORIES);
  const other = pick(CATEGORIES.filter((c) => c.id !== cat.id));
  const answer = pick(cat.items);
  const others = shuffle(other.items).slice(0, count(level) - 1);
  return base({
    skill: "puzzles",
    prompt: `Which one belongs with: ${cat.title}?`,
    spoken: `Which one belongs with ${cat.title}?`,
    options: shuffle([answer, ...others]).map((it) => ({ id: it.label, emoji: it.emoji, label: it.label })),
    answerId: answer.label,
    hint: `Think about ${cat.title.toLowerCase()}.`,
    reveal: `${answer.emoji} belongs with ${cat.title}!`,
  });
}

function bigSmall(): Round {
  const big = pick([
    { label: "elephant", emoji: "🐘" },
    { label: "whale", emoji: "🐳" },
    { label: "bus", emoji: "🚌" },
    { label: "tree", emoji: "🌳" },
  ]);
  const small = pick([
    { label: "ant", emoji: "🐜" },
    { label: "bee", emoji: "🐝" },
    { label: "key", emoji: "🔑" },
    { label: "acorn", emoji: "🌰" },
  ]);
  const askBig = Math.random() < 0.5;
  return base({
    skill: "puzzles",
    prompt: askBig ? "Which one is BIG?" : "Which one is small?",
    spoken: askBig ? "Which one is big?" : "Which one is small?",
    options: shuffle([
      { id: "big", emoji: big.emoji, label: big.label },
      { id: "small", emoji: small.emoji, label: small.label },
    ]),
    answerId: askBig ? "big" : "small",
    hint: askBig ? "A big thing takes up lots of space." : "A small thing fits in your hand.",
    reveal: askBig ? `A ${big.label} is big!` : `An ${small.label} is small!`,
    columns: 2,
  });
}

function longShort(): Round {
  const askLong = Math.random() < 0.5;
  const long = { id: "long", label: "▬▬▬▬▬▬" };
  const short = { id: "short", label: "▬▬" };
  return base({
    skill: "puzzles",
    prompt: askLong ? "Which one is long?" : "Which one is short?",
    spoken: askLong ? "Which one is long?" : "Which one is short?",
    options: shuffle([long, short]),
    answerId: askLong ? "long" : "short",
    hint: "Look at how far each one stretches.",
    reveal: askLong ? "That one is long!" : "That one is short!",
    columns: 2,
  });
}

function jigsawPiece(level: number): Round {
  const target = pick(WORDS);
  const others = shuffle(WORDS.filter((w) => w.word !== target.word)).slice(0, count(level) - 1);
  return base({
    skill: "puzzles",
    prompt: `🧩 Which piece completes the ${target.word} picture?`,
    spoken: `Which piece completes the ${target.word}?`,
    options: shuffle([target, ...others]).map((w) => ({ id: w.word, emoji: w.emoji, label: w.word })),
    answerId: target.word,
    hint: `The picture is a ${target.word}.`,
    reveal: `The ${target.word} is complete! ${target.emoji}`,
  });
}

function completePicture(level: number): Round {
  const r = jigsawPiece(level);
  return { ...r, prompt: "Which piece is missing from the picture?", spoken: "Which piece is missing?" };
}

/* --------------------------------------------------------------- dispatch */

export function roundForKind(kind: string, level: number): Round {
  switch (kind) {
    case "findUpper": return findUpper(level);
    case "upperToLower": return caseMatch(level, true);
    case "lowerToUpper": return caseMatch(level, false);
    case "letterShadow": return letterShadow(level);
    case "missingLetter": return missingLetter(level);
    case "letterPuzzle": return letterPuzzle(level);
    case "numberPuzzle": return numberPuzzle(level);
    case "startsWith": return startsWith(level);
    case "letterSound": return letterSound(level);
    case "sameSound": return sameSound(level);
    case "rhyme": return rhyme(level);
    case "pictureWord": return pictureWord(level);
    case "wordPicture": return wordPictureRound(level);
    case "missingLetterWord": return missingLetterWord(level);
    case "countObjects": return countObjects(level);
    case "findNumber": return findNumber(level);
    case "numberQuantity": return numberQuantity(level);
    case "missingNumber": return missingNumber(level);
    case "moreOrLess": return moreOrLess(level);
    case "biggerNumber": return biggerNumber(level);
    case "findColor": return findColor(level);
    case "colorMatch": return colorMatch(level);
    case "sortColor": return sortColor(level);
    case "findShape": return findShape(level);
    case "shapeMatch": return shapeMatch(level);
    case "shapeShadow": return shapeShadow(level);
    case "sortShape": return sortShape(level);
    case "shapeMissing": return shapeMissing(level);
    case "patternNext": return patternNext(level);
    case "whichDifferent": return whichDifferent(level);
    case "whichNext": return whichNext(level);
    case "sortRule": return sortRule(level);
    case "bigSmall": return bigSmall();
    case "longShort": return longShort();
    case "jigsawPiece": return jigsawPiece(level);
    case "completePicture": return completePicture(level);
    default: return findUpper(level);
  }
}

/* --------------------------------------------- non-choice engine configs */

export function huntSet(kind: string, level: number) {
  const size = level <= 1 ? 9 : level <= 3 ? 12 : 16;
  const targets = level <= 1 ? 2 : level <= 3 ? 3 : 4;

  const make = (targetLabel: string, targetNode: Option, distractors: Option[]) => {
    const cells: Option[] = shuffle([
      ...Array.from({ length: targets }, (_, i) => ({ ...targetNode, id: `t-${i}` })),
      ...Array.from({ length: size - targets }, (_, i) => ({ ...pick(distractors), id: `d-${i}` })),
    ]);
    return { label: targetLabel, cells, targetIds: cells.filter((c) => c.id.startsWith("t")).map((c) => c.id) };
  };

  if (kind === "numbers") {
    const max = maxNumber(level);
    const n = pick(range(max));
    return make(
      `the number ${n}`,
      { id: "t", label: String(n), big: true },
      range(max).filter((x) => x !== n).map((x) => ({ id: "d", label: String(x), big: true })),
    );
  }
  if (kind === "colors") {
    const c = pick(COLORS);
    return make(
      `everything ${c.name}`,
      { id: "t", swatch: c.swatch, label: c.name },
      COLORS.filter((o) => o.name !== c.name).map((o) => ({ id: "d", swatch: o.swatch, label: o.name })),
    );
  }
  if (kind === "shapes") {
    const s = pick(SHAPES);
    return make(
      `every ${s.name}`,
      { id: "t", clip: s.clip, label: s.name },
      SHAPES.filter((o) => o.name !== s.name).map((o) => ({ id: "d", clip: o.clip, label: o.name })),
    );
  }
  if (kind === "pictures") {
    const w = pick(WORDS);
    return make(
      `every ${w.word}`,
      { id: "t", emoji: w.emoji, label: w.word },
      WORDS.filter((o) => o.word !== w.word).map((o) => ({ id: "d", emoji: o.emoji, label: o.word })),
    );
  }
  const l = pick(LETTERS);
  return make(
    `the letter ${l}`,
    { id: "t", label: l, big: true },
    LETTERS.filter((o) => o !== l).map((o) => ({ id: "d", label: o, big: true })),
  );
}

export function orderSet(kind: string, level: number) {
  if (kind === "numbers") {
    const len = level <= 1 ? 3 : level <= 3 ? 5 : 7;
    const start = 1 + Math.floor(Math.random() * Math.max(1, maxNumber(level) - len));
    const seq = range(len, start).map((n) => ({ id: String(n), label: String(n), big: true }));
    return { label: "Put the numbers in order, smallest first", spoken: "Tap the numbers in order, starting with the smallest.", seq };
  }
  if (kind === "buildWord") {
    const w = pick(CVC_WORDS);
    const seq = w.word.split("").map((c, i) => ({ id: `${c}-${i}`, label: c.toUpperCase(), big: true }));
    return { label: `Spell ${w.word.toUpperCase()} ${w.emoji}`, spoken: `Spell the word ${w.word}.`, seq };
  }
  const len = level <= 1 ? 3 : level <= 3 ? 4 : 6;
  const start = Math.floor(Math.random() * (26 - len));
  const seq = LETTERS.slice(start, start + len).map((l) => ({ id: l, label: l, big: true }));
  return { label: "Tap the letters in alphabet order", spoken: "Tap the letters in alphabet order.", seq };
}

export function memorySet(kind: string, level: number) {
  const pairs = level <= 1 ? 3 : level <= 3 ? 4 : 6;
  if (kind === "letters") {
    return shuffle(LETTERS).slice(0, pairs).flatMap((l, i) => [
      { key: `${i}-a`, pairId: l, emoji: l, label: `letter ${l}` },
      { key: `${i}-b`, pairId: l, emoji: l, label: `letter ${l}` },
    ]);
  }
  if (kind === "numbers") {
    return shuffle(range(20)).slice(0, pairs).flatMap((n, i) => [
      { key: `${i}-a`, pairId: String(n), emoji: String(n), label: `number ${n}` },
      { key: `${i}-b`, pairId: String(n), emoji: String(n), label: `number ${n}` },
    ]);
  }
  if (kind === "colors") {
    return shuffle(COLORS).slice(0, pairs).flatMap((c, i) => [
      { key: `${i}-a`, pairId: c.name, emoji: c.emoji, label: c.name },
      { key: `${i}-b`, pairId: c.name, emoji: c.emoji, label: c.name },
    ]);
  }
  if (kind === "shapes") {
    return shuffle(SHAPES).slice(0, Math.min(pairs, SHAPES.length)).flatMap((s, i) => [
      { key: `${i}-a`, pairId: s.name, emoji: s.emoji, label: s.name },
      { key: `${i}-b`, pairId: s.name, emoji: s.emoji, label: s.name },
    ]);
  }
  if (kind === "wordPicture") {
    return shuffle(WORDS).slice(0, pairs).flatMap((w, i) => [
      { key: `${i}-a`, pairId: w.word, emoji: w.emoji, label: w.word },
      { key: `${i}-b`, pairId: w.word, emoji: w.word.toUpperCase(), label: w.word },
    ]);
  }
  return shuffle(WORDS).slice(0, pairs).flatMap((w, i) => [
    { key: `${i}-a`, pairId: w.word, emoji: w.emoji, label: w.word },
    { key: `${i}-b`, pairId: w.word, emoji: w.emoji, label: w.word },
  ]);
}
