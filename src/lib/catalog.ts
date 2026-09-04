/**
 * The game catalog. Every playable activity in Totland is a data record —
 * the engine renders it. Adding a game means adding a row here, never new
 * bespoke game code.
 */
import type { SkillId } from "./content";
import type { TemplateId, TemplateOpts } from "./templates";

export type WorldId = "alphabet" | "numbers" | "colors" | "puzzles" | "story";
export type AgeMode = "explorer" | "learner" | "reader";
export type Interaction = "tap" | "drag" | "trace" | "read";

export interface CatalogGame {
  id: string;
  n: number;
  title: string;
  world: WorldId;
  skill: SkillId;
  objective: string;
  emoji: string;
  template: TemplateId;
  opts?: TemplateOpts;
  ageMin: number;
  ageMax: number;
  modes: AgeMode[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  interaction: Interaction;
  minutes: number;
  premium: boolean;
  rounds?: number;
}

export interface World {
  id: WorldId;
  title: string;
  emoji: string;
  blurb: string;
  tint: "clay" | "amber" | "moss" | "sky" | "plum" | "wood";
}

export const WORLDS: World[] = [
  { id: "alphabet", title: "Alphabet Forest", emoji: "🌳", blurb: "Letters & phonics", tint: "moss" },
  { id: "numbers", title: "Number Valley", emoji: "🏔️", blurb: "Counting & numbers", tint: "sky" },
  { id: "colors", title: "Color Cove", emoji: "🏖️", blurb: "Colors & shapes", tint: "plum" },
  { id: "puzzles", title: "Puzzle Park", emoji: "🎡", blurb: "Logic & memory", tint: "amber" },
  { id: "story", title: "Storybook Village", emoji: "🏘️", blurb: "Words & reading", tint: "clay" },
];

type Row = [
  n: number,
  title: string,
  world: WorldId,
  skill: SkillId,
  emoji: string,
  template: TemplateId,
  difficulty: 1 | 2 | 3 | 4 | 5,
  objective: string,
  opts?: TemplateOpts,
];

const ROWS: Row[] = [
  // ── Alphabet Forest ─────────────────────────────────────────────
  [1, "Letter Pop", "alphabet", "letters", "🎈", "letter-find", 1, "Recognise uppercase letters"],
  [2, "Alphabet Safari", "alphabet", "letters", "🦒", "letter-hunt", 2, "Spot letters in a busy scene"],
  [3, "Feed the Letter Monster", "alphabet", "letters", "👾", "letter-find", 1, "Match a spoken letter to its symbol"],
  [4, "Letter Bubbles", "alphabet", "letters", "🫧", "letter-find", 1, "Fast letter recognition"],
  [5, "Alphabet Train", "alphabet", "letters", "🚂", "letter-sequence", 2, "Order letters A to Z"],
  [6, "Letter Fishing", "alphabet", "letters", "🎣", "letter-hunt", 2, "Find a target letter"],
  [7, "Letter Rocket", "alphabet", "letters", "🚀", "letter-find", 2, "Letter recognition under playful pressure"],
  [8, "Letter Garden", "alphabet", "letters", "🌷", "letter-sequence", 2, "Alphabetical sequencing"],
  [9, "Missing Letter", "alphabet", "letters", "🕳️", "letter-sequence", 3, "Complete an alphabet sequence"],
  [10, "Alphabet Bridge", "alphabet", "letters", "🌉", "letter-sequence", 3, "Build sequences of letters"],
  [11, "Uppercase Match", "alphabet", "letters", "🅰️", "letter-case", 1, "Match identical uppercase letters", { mode: "upper" }],
  [12, "Upper to Lowercase", "alphabet", "letters", "🔡", "letter-case", 2, "Match A to a", { mode: "lower" }],
  [13, "Lower to Uppercase", "alphabet", "letters", "🔠", "letter-case", 2, "Match a to A", { mode: "upper" }],
  [14, "Letter Shadow", "alphabet", "letters", "🌑", "letter-shadow", 2, "Match a letter to its silhouette"],
  [15, "Letter Maze", "alphabet", "letters", "🧭", "letter-hunt", 3, "Follow one letter through a maze"],
  [16, "Letter Detective", "alphabet", "letters", "🔍", "letter-hunt", 3, "Find every copy of a letter"],
  [17, "Letter Rain", "alphabet", "letters", "🌧️", "letter-find", 2, "Quick letter spotting"],
  [18, "Letter Memory", "alphabet", "memory", "🧠", "memory", 2, "Remember matching letters"],
  [19, "Letter Puzzle", "alphabet", "puzzles", "🧩", "letter-puzzle", 3, "Assemble a letter"],
  [20, "Alphabet Race", "alphabet", "letters", "🏁", "letter-sequence", 3, "Move forward by ordering letters"],
  // ── Phonics & words ─────────────────────────────────────────────
  [21, "What Starts With B?", "story", "phonics", "🅱️", "phonics-first", 2, "Beginning sounds"],
  [22, "Sound Match", "story", "phonics", "👂", "phonics-first", 2, "Match a sound to a letter"],
  [23, "Beginning Sound Train", "story", "phonics", "🚋", "phonics-first", 3, "Sort pictures by first sound"],
  [24, "Sound Detective", "story", "phonics", "🕵️", "phonics-first", 3, "Identify the beginning sound"],
  [25, "Word Builder", "story", "words", "🔨", "word-build", 3, "Build simple words"],
  [26, "Picture Word Match", "story", "words", "🖼️", "word-picture", 2, "Match a picture to its word"],
  [27, "Word Puzzle", "story", "puzzles", "🧩", "word-missing", 3, "Spell a pictured object"],
  [28, "Missing Letter Word", "story", "words", "✏️", "word-missing", 3, "C_T becomes CAT"],
  [29, "Word Fishing", "story", "words", "🐟", "word-build", 3, "Catch the letters you need"],
  [30, "Word Rocket", "story", "words", "🛰️", "word-build", 4, "Build a word to launch"],
  [31, "Rhyming Pairs", "story", "phonics", "🎵", "rhyme", 3, "Hear and match rhymes"],
  [32, "Same Sound", "story", "phonics", "🔊", "phonics-first", 3, "Words sharing a first sound"],
  [33, "Word Memory", "story", "memory", "🃏", "memory", 3, "Match picture and word"],
  [34, "Word Train", "story", "words", "🚃", "word-build", 3, "Put letters in order"],
  [35, "First Word Builder", "story", "words", "🌟", "word-build", 2, "Very first words"],
  // ── Number Valley ───────────────────────────────────────────────
  [36, "Count the Animals", "numbers", "numbers", "🐑", "count", 1, "Count to ten"],
  [37, "Number Pop", "numbers", "numbers", "🎈", "number-find", 1, "Recognise numerals"],
  [38, "Number Bubbles", "numbers", "numbers", "🫧", "number-find", 1, "Numeral recognition"],
  [39, "Number Fishing", "numbers", "numbers", "🎣", "number-find", 2, "Find a spoken number"],
  [40, "Number Train", "numbers", "numbers", "🚂", "number-sequence", 2, "Order numbers"],
  [41, "Number Match", "numbers", "numbers", "🔗", "number-quantity", 2, "Numeral to quantity"],
  [42, "Count the Stars", "numbers", "numbers", "⭐", "count", 1, "Counting practice"],
  [43, "Number Monster", "numbers", "numbers", "👹", "number-quantity", 2, "Give the right quantity"],
  [44, "Number Garden", "numbers", "numbers", "🌼", "number-quantity", 2, "Plant a given number"],
  [45, "Number Rocket", "numbers", "numbers", "🚀", "number-find", 2, "Numeral recognition"],
  [46, "Missing Number", "numbers", "numbers", "🕳️", "number-sequence", 3, "1, 2, _, 4"],
  [47, "Number Maze", "numbers", "numbers", "🧭", "number-sequence", 3, "Count in order"],
  [48, "More or Less", "numbers", "numbers", "⚖️", "number-compare", 3, "Compare quantities", { mode: "lower" }],
  [49, "Bigger Number", "numbers", "numbers", "📈", "number-compare", 3, "Compare numerals", { mode: "upper" }],
  [50, "Number Memory", "numbers", "memory", "🧠", "memory", 3, "Match numeral and quantity"],
  [51, "Counting Train", "numbers", "numbers", "🚋", "count", 2, "Count objects in groups"],
  [52, "Number Puzzle", "numbers", "puzzles", "🧩", "number-sequence", 3, "Assemble numbers"],
  [53, "Count the Fruit", "numbers", "numbers", "🍎", "count", 1, "Count everyday objects"],
  [54, "Number Hunt", "numbers", "numbers", "🔍", "number-find", 3, "Find every copy of a number"],
  [55, "Number Rain", "numbers", "numbers", "🌧️", "number-sequence", 3, "Catch numbers in sequence"],
  // ── Color Cove ──────────────────────────────────────────────────
  [56, "Color Pop", "colors", "colors", "🎈", "color-find", 1, "Name and find colors"],
  [57, "Color Match", "colors", "colors", "🎨", "color-match", 1, "Match colors"],
  [58, "Rainbow Sort", "colors", "colors", "🌈", "color-match", 2, "Sort by color"],
  [59, "Color Detective", "colors", "colors", "🔍", "color-find", 2, "Find every object of a color"],
  [60, "Color Memory", "colors", "memory", "🧠", "memory", 2, "Match color pairs"],
  [61, "Shape Pop", "colors", "shapes", "🔷", "shape-find", 1, "Recognise shapes"],
  [62, "Shape Match", "colors", "shapes", "🔶", "shape-find", 1, "Match identical shapes"],
  [63, "Shape Builder", "colors", "shapes", "🏗️", "shape-find", 3, "Build with shapes"],
  [64, "Shape Sort", "colors", "shapes", "📦", "shape-find", 2, "Sort shapes"],
  [65, "Shape Shadow", "colors", "shapes", "🌑", "shape-shadow", 2, "Match shapes to silhouettes"],
  [66, "Shape Memory", "colors", "memory", "🧠", "memory", 2, "Match shape pairs"],
  [67, "Shape Hunt", "colors", "shapes", "🔎", "shape-find", 3, "Find shapes in a scene"],
  [68, "Shape Puzzle", "colors", "puzzles", "🧩", "shape-shadow", 3, "Build a picture from shapes"],
  [69, "Shape Train", "colors", "shapes", "🚋", "pattern-next", 3, "Shape patterns"],
  [70, "What's Missing?", "colors", "shapes", "❓", "shape-find", 3, "Complete a shape sequence"],
  // ── Puzzle Park ─────────────────────────────────────────────────
  [71, "Animal Memory", "puzzles", "memory", "🐘", "memory", 1, "Classic memory pairs"],
  [72, "Letter Memory", "puzzles", "memory", "🔤", "memory", 2, "Letter pairs"],
  [73, "Number Memory", "puzzles", "memory", "🔢", "memory", 2, "Number pairs"],
  [74, "Picture Memory", "puzzles", "memory", "🖼️", "memory", 1, "Picture pairs"],
  [75, "Picture to Word", "puzzles", "words", "🔤", "word-picture", 3, "Link picture and word"],
  [76, "What's Different?", "puzzles", "puzzles", "🔀", "odd-one-out", 2, "Spot the difference"],
  [77, "Which Comes Next?", "puzzles", "puzzles", "➡️", "pattern-next", 3, "Complete a sequence"],
  [78, "Sort the Toys", "puzzles", "puzzles", "🧸", "odd-one-out", 2, "Sort by a rule"],
  [79, "Big or Small", "puzzles", "puzzles", "📏", "size-sort", 1, "Compare size", { mode: "upper" }],
  [80, "Long or Short", "puzzles", "puzzles", "📐", "size-sort", 1, "Compare length", { mode: "lower" }],
  [81, "Simple Jigsaw", "puzzles", "puzzles", "🧩", "jigsaw", 1, "Four-piece jigsaw"],
  [82, "Animal Jigsaw", "puzzles", "puzzles", "🦓", "shadow-match", 2, "Six-piece jigsaw"],
  [83, "Alphabet Jigsaw", "puzzles", "puzzles", "🔤", "letter-puzzle", 2, "Assemble letters"],
  [84, "Number Jigsaw", "puzzles", "puzzles", "🔢", "number-sequence", 2, "Assemble numbers"],
  [85, "Picture Puzzle", "puzzles", "puzzles", "🖼️", "shadow-match", 3, "Complete an image"],
  [86, "Word Search: Letters", "puzzles", "wordsearch", "🔎", "wordsearch", 2, "Find letters in a grid", { mode: "upper" }],
  [87, "Word Search: Animals", "puzzles", "wordsearch", "🐾", "wordsearch", 3, "Find animal words"],
  [88, "Word Search: Colors", "puzzles", "wordsearch", "🎨", "wordsearch", 3, "Find color words"],
  [89, "Word Search: Numbers", "puzzles", "wordsearch", "🔢", "wordsearch", 3, "Find number words"],
  [90, "Word Search: Food", "puzzles", "wordsearch", "🍓", "wordsearch", 3, "Find food words"],
  [91, "Hidden Objects", "puzzles", "puzzles", "🫖", "hidden-object", 2, "Find requested objects"],
  [92, "Picture Path", "puzzles", "puzzles", "🛤️", "pattern-next", 3, "Follow a sequence"],
  [93, "Match the Shadows", "puzzles", "puzzles", "🌑", "shadow-match", 2, "Objects to shadows"],
  [94, "Complete the Picture", "puzzles", "puzzles", "🖌️", "hidden-object", 3, "Choose the missing piece"],
  [95, "Pattern Builder", "puzzles", "puzzles", "🔁", "pattern-next", 3, "Recreate patterns"],
  // ── Creative & early reading ────────────────────────────────────
  [96, "Letter Tracing", "alphabet", "tracing", "✏️", "tracing", 2, "Trace uppercase and lowercase letters"],
  [97, "Number Tracing", "numbers", "tracing", "🖊️", "tracing", 2, "Trace numbers 1–20"],
  [98, "Story Builder", "story", "stories", "📚", "story", 3, "Make a simple story"],
  [99, "Read With Me", "story", "stories", "📖", "story", 3, "Narrated beginner reading"],
  [100, "Flash Card Deck", "story", "flashcards", "🃏", "flashcards", 1, "Hear and see first words"],
];

const FREE_GAMES = new Set([1, 2, 4, 5, 11, 12, 18, 21, 26, 36, 37, 40, 42, 46, 53, 56, 57, 61, 62, 65, 71, 74, 76, 79, 81, 91, 96, 99, 100]);

const modesFor = (d: number): AgeMode[] =>
  d <= 1 ? ["explorer", "learner", "reader"] : d <= 3 ? ["learner", "reader"] : ["reader"];

export const GAMES: CatalogGame[] = ROWS.map(([n, title, world, skill, emoji, template, difficulty, objective, opts]) => ({
  id: `g${String(n).padStart(3, "0")}`,
  n,
  title,
  world,
  skill,
  emoji,
  template,
  opts,
  objective,
  ageMin: difficulty <= 1 ? 2 : difficulty <= 3 ? 3 : 4,
  ageMax: 6,
  modes: modesFor(difficulty),
  difficulty,
  interaction: template === "tracing" ? "trace" : template === "story" ? "read" : "tap",
  minutes: template === "story" ? 3 : 2,
  premium: !FREE_GAMES.has(n),
}));

export const gameById = (id: string) => GAMES.find((g) => g.id === id);
export const gamesInWorld = (w: WorldId) => GAMES.filter((g) => g.world === w);
export const freeGames = () => GAMES.filter((g) => !g.premium);
export const GAME_COUNT = GAMES.length;

export const AGE_MODES: { id: AgeMode; title: string; ages: string; blurb: string; emoji: string }[] = [
  { id: "explorer", title: "Explorer", ages: "2–3", blurb: "Colors, shapes, sounds, tapping", emoji: "🐣" },
  { id: "learner", title: "Learner", ages: "3–4", blurb: "Alphabet, counting, first words", emoji: "🐻" },
  { id: "reader", title: "Reader", ages: "4–6", blurb: "Phonics, spelling, reading", emoji: "🦉" },
];

export function gamesForMode(mode: AgeMode, premium: boolean) {
  return GAMES.filter((g) => g.modes.includes(mode) && (premium || !g.premium));
}
