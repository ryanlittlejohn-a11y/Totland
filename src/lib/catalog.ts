/**
 * Totland game catalog.
 *
 * Every game in the app is a *record*, not bespoke code: the reusable engines
 * in `rounds.ts` + `components/game/*` turn these records into playable
 * activities. Adding a new game means adding a row here.
 */
import type { SkillId } from "./content";

export type EngineId =
  | "choice"
  | "fishing"
  | "monster"
  | "rocket"
  | "jigsaw"
  | "maze"
  | "hunt"
  | "order"
  | "memory"
  | "wordsearch"
  | "tracing"
  | "flashcards"
  | "story"
  | "storybuilder"
  | "adventure";

export type WorldId =
  | "alphabet-forest"
  | "number-valley"
  | "color-cove"
  | "puzzle-park"
  | "storybook-village";

export type AgeMode = "explorer" | "learner" | "reader";

export interface World {
  id: WorldId;
  title: string;
  emoji: string;
  blurb: string;
  tint: "clay" | "amber" | "moss" | "sky" | "plum" | "wood";
}

export const WORLDS: World[] = [
  { id: "alphabet-forest", title: "Alphabet Forest", emoji: "🌳", blurb: "Letters & sounds", tint: "moss" },
  { id: "number-valley", title: "Number Valley", emoji: "🏞️", blurb: "Counting & numbers", tint: "sky" },
  { id: "color-cove", title: "Color Cove", emoji: "🌈", blurb: "Colors & shapes", tint: "plum" },
  { id: "puzzle-park", title: "Puzzle Park", emoji: "🧩", blurb: "Memory & logic", tint: "amber" },
  { id: "storybook-village", title: "Storybook Village", emoji: "📖", blurb: "Words & reading", tint: "clay" },
];

export interface GameRecord {
  id: string;
  number: number;
  title: string;
  emoji: string;
  world: WorldId;
  engine: EngineId;
  /** round-generator variant handled by rounds.ts */
  kind: string;
  category: string;
  skill: SkillId;
  objective: string;
  ageModes: AgeMode[];
  difficultyMin: number;
  difficultyMax: number;
  interaction: "tap" | "tap-many" | "drag" | "sequence" | "flip" | "trace" | "read";
  minutes: number;
  rounds: number;
  rewardStars: number;
  premium: boolean;
  completionThreshold: number;
  retry: "hint-after-two";
}

type Row = [
  n: number,
  title: string,
  emoji: string,
  engine: EngineId,
  kind: string,
  world: WorldId,
  skill: SkillId,
  objective: string,
  modes: string,
  premium?: 1,
];

const A: WorldId = "alphabet-forest";
const N: WorldId = "number-valley";
const C: WorldId = "color-cove";
const P: WorldId = "puzzle-park";
const S: WorldId = "storybook-village";

// modes: e=explorer l=learner r=reader
const ROWS: Row[] = [
  [1, "Letter Pop", "🎈", "choice", "findUpper", A, "letters", "Recognise uppercase letters", "elr"],
  [2, "Alphabet Safari", "🦒", "hunt", "letters", A, "letters", "Spot letters in a busy scene", "elr"],
  [3, "Feed the Letter Monster", "👾", "monster", "findUpper", A, "letters", "Match a spoken letter name", "elr"],
  [4, "Letter Bubbles", "🫧", "choice", "findUpper", A, "letters", "Letter recognition under choice", "elr"],
  [5, "Alphabet Train", "🚂", "order", "letters", A, "letters", "Alphabetical order", "lr"],
  [6, "Letter Fishing", "🎣", "fishing", "findUpper", A, "letters", "Letter recognition", "elr"],
  [7, "Letter Rocket", "🚀", "choice", "findUpper", A, "letters", "Letter recognition", "elr"],
  [8, "Letter Garden", "🌷", "order", "letters", A, "letters", "Sequence letters A to Z", "lr"],
  [9, "Missing Letter", "❓", "choice", "missingLetter", A, "letters", "Complete an alphabet sequence", "lr"],
  [10, "Alphabet Bridge", "🌉", "order", "letters", A, "letters", "Build a bridge in order", "lr"],
  [11, "Uppercase Match", "🔠", "memory", "letters", A, "memory", "Match identical letters", "elr"],
  [12, "Upper to Lowercase", "🔡", "choice", "upperToLower", A, "letters", "Link A to a", "lr"],
  [13, "Lower to Uppercase", "🔤", "choice", "lowerToUpper", A, "letters", "Link a to A", "lr"],
  [14, "Letter Shadow", "🌑", "choice", "letterShadow", A, "letters", "Match a letter to its silhouette", "elr"],
  [15, "Letter Maze", "🌀", "hunt", "letters", A, "letters", "Follow one letter through a maze", "lr"],
  [16, "Letter Detective", "🔍", "hunt", "letters", A, "letters", "Find every copy of a letter", "elr"],
  [17, "Letter Rain", "🌧️", "choice", "findUpper", A, "letters", "Quick letter recognition", "lr"],
  [18, "Letter Memory", "🧠", "memory", "letters", A, "memory", "Remember letter pairs", "elr"],
  [19, "Letter Puzzle", "🧩", "choice", "letterPuzzle", P, "puzzles", "Assemble a letter", "lr"],
  [20, "Alphabet Race", "🏁", "order", "letters", A, "letters", "Race through the alphabet", "lr"],

  [21, "What Starts With B?", "🅱️", "choice", "startsWith", A, "phonics", "Beginning sounds", "lr"],
  [22, "Sound Match", "👂", "choice", "letterSound", A, "phonics", "Match sound to letter", "lr"],
  [23, "Beginning Sound Train", "🚋", "choice", "startsWith", A, "phonics", "Sort by beginning sound", "lr"],
  [24, "Sound Detective", "🕵️", "choice", "letterSound", A, "phonics", "Identify a beginning sound", "lr"],
  [25, "Word Builder", "🧱", "order", "buildWord", S, "words", "Spell a simple word", "r"],
  [26, "Picture Word Match", "🖼️", "choice", "pictureWord", S, "words", "Match picture to word", "lr"],
  [27, "Word Puzzle", "🪄", "order", "buildWord", S, "words", "Assemble letters into a word", "r", 1],
  [28, "Missing Letter Word", "✏️", "choice", "missingLetterWord", S, "words", "Complete C_T", "lr"],
  [29, "Word Fishing", "🐟", "choice", "missingLetterWord", S, "words", "Catch the missing letter", "lr", 1],
  [30, "Word Rocket", "🛸", "rocket", "buildWord", S, "words", "Build a word to launch", "r", 1],
  [31, "Rhyming Pairs", "🎵", "choice", "rhyme", S, "words", "Hear rhyming words", "lr", 1],
  [32, "Same Sound", "🔁", "choice", "sameSound", A, "phonics", "Same beginning sound", "lr", 1],
  [33, "Word Memory", "🗂️", "memory", "wordPicture", S, "memory", "Match word to picture", "r", 1],
  [34, "Word Train", "🚃", "order", "buildWord", S, "words", "Letters in the right order", "r", 1],
  [35, "First Word Builder", "🅰️", "order", "buildWord", S, "words", "Very first spelling", "lr"],

  [36, "Count the Animals", "🐑", "choice", "countObjects", N, "numbers", "Count and choose the number", "elr"],
  [37, "Number Pop", "🎈", "choice", "findNumber", N, "numbers", "Numeral recognition", "elr"],
  [38, "Number Bubbles", "🫧", "choice", "findNumber", N, "numbers", "Numeral recognition", "elr"],
  [39, "Number Fishing", "🎣", "choice", "findNumber", N, "numbers", "Numeral recognition", "elr"],
  [40, "Number Train", "🚂", "order", "numbers", N, "numbers", "Number order", "lr"],
  [41, "Number Match", "🔗", "choice", "numberQuantity", N, "numbers", "Numeral to quantity", "lr"],
  [42, "Count the Stars", "⭐", "choice", "countObjects", N, "numbers", "Counting", "elr"],
  [43, "Number Monster", "👹", "choice", "countObjects", N, "numbers", "Give the right amount", "elr"],
  [44, "Number Garden", "🌻", "choice", "numberQuantity", N, "numbers", "Plant that many flowers", "elr"],
  [45, "Number Rocket", "🚀", "choice", "findNumber", N, "numbers", "Numeral recognition", "elr"],
  [46, "Missing Number", "➖", "choice", "missingNumber", N, "numbers", "Complete 1, 2, _, 4", "lr"],
  [47, "Number Maze", "🌀", "maze", "numbers", N, "numbers", "Move through numbers in order", "lr"],
  [48, "More or Less", "⚖️", "choice", "moreOrLess", N, "numbers", "Compare quantities", "lr"],
  [49, "Bigger Number", "🔝", "choice", "biggerNumber", N, "numbers", "Compare numerals", "lr"],
  [50, "Number Memory", "🧠", "memory", "numbers", N, "memory", "Match numeral pairs", "elr"],
  [51, "Counting Train", "🚋", "choice", "countObjects", N, "numbers", "Count the carriages", "elr"],
  [52, "Number Puzzle", "🧩", "choice", "numberPuzzle", P, "puzzles", "Assemble a numeral", "lr"],
  [53, "Count the Fruit", "🍏", "choice", "countObjects", N, "numbers", "Counting to twenty", "lr"],
  [54, "Number Hunt", "🔍", "hunt", "numbers", N, "numbers", "Find every copy of a number", "elr"],
  [55, "Number Rain", "🌧️", "order", "numbers", N, "numbers", "Catch numbers in order", "lr"],

  [56, "Color Pop", "🎈", "choice", "findColor", C, "colors", "Colour recognition", "elr"],
  [57, "Color Match", "🎨", "choice", "colorMatch", C, "colors", "Match same colour", "elr"],
  [58, "Rainbow Sort", "🌈", "choice", "sortColor", C, "colors", "Sort by colour", "elr"],
  [59, "Color Detective", "🕵️", "hunt", "colors", C, "colors", "Find every object of a colour", "elr"],
  [60, "Color Memory", "🧠", "memory", "colors", C, "memory", "Match colour pairs", "elr"],
  [61, "Shape Pop", "🔷", "choice", "findShape", C, "shapes", "Shape recognition", "elr"],
  [62, "Shape Match", "🔶", "choice", "shapeMatch", C, "shapes", "Match identical shapes", "elr"],
  [63, "Shape Builder", "🏗️", "choice", "shapeMissing", C, "shapes", "Build with shapes", "lr"],
  [64, "Shape Sort", "🗃️", "choice", "sortShape", C, "shapes", "Sort shapes into groups", "elr"],
  [65, "Shape Shadow", "🌑", "choice", "shapeShadow", C, "shapes", "Match shape to silhouette", "elr"],
  [66, "Shape Memory", "🧠", "memory", "shapes", C, "memory", "Match shape pairs", "elr"],
  [67, "Shape Hunt", "🔍", "hunt", "shapes", C, "shapes", "Find shapes in a scene", "elr"],
  [68, "Shape Puzzle", "🧩", "choice", "jigsawPiece", P, "puzzles", "Assemble a picture", "lr"],
  [69, "Shape Train", "🚃", "choice", "patternNext", C, "shapes", "Continue a shape pattern", "lr"],
  [70, "What's Missing?", "❔", "choice", "shapeMissing", C, "shapes", "Spot the missing shape", "lr"],

  [71, "Animal Memory", "🐾", "memory", "animals", P, "memory", "Classic memory pairs", "elr"],
  [72, "Letter Memory Park", "🔠", "memory", "letters", P, "memory", "Letter pairs", "elr"],
  [73, "Number Memory Park", "🔢", "memory", "numbers", P, "memory", "Number pairs", "elr"],
  [74, "Picture Memory", "🖼️", "memory", "animals", P, "memory", "Picture pairs", "elr"],
  [75, "Picture to Word", "🔤", "memory", "wordPicture", P, "memory", "Word and picture pairs", "r", 1],
  [76, "What's Different?", "🙃", "choice", "whichDifferent", P, "puzzles", "Odd one out", "elr"],
  [77, "Which Comes Next?", "➡️", "choice", "whichNext", P, "puzzles", "Complete a sequence", "lr"],
  [78, "Sort the Toys", "🧸", "choice", "sortRule", P, "puzzles", "Sort by category", "elr"],
  [79, "Big or Small", "🐘", "choice", "bigSmall", P, "puzzles", "Compare size", "elr"],
  [80, "Long or Short", "📏", "choice", "longShort", P, "puzzles", "Compare length", "elr"],

  [81, "Simple Jigsaw", "🧩", "choice", "jigsawPiece", P, "puzzles", "Four-piece jigsaw", "elr"],
  [82, "Animal Jigsaw", "🐨", "jigsaw", "jigsawPiece", P, "puzzles", "Six-piece jigsaw", "lr", 1],
  [83, "Alphabet Jigsaw", "🔠", "choice", "letterPuzzle", P, "puzzles", "Assemble letters", "lr"],
  [84, "Number Jigsaw", "🔢", "choice", "numberPuzzle", P, "puzzles", "Assemble numbers", "lr"],
  [85, "Picture Puzzle", "🖼️", "choice", "completePicture", P, "puzzles", "Complete an image", "lr", 1],
  [86, "Word Search: Letters", "🔎", "wordsearch", "letters", P, "wordsearch", "Find letters in a grid", "elr"],
  [87, "Word Search: Animals", "🔎", "wordsearch", "animals", P, "wordsearch", "Find animal words", "r", 1],
  [88, "Word Search: Colors", "🔎", "wordsearch", "colors", P, "wordsearch", "Find colour words", "r", 1],
  [89, "Word Search: Numbers", "🔎", "wordsearch", "numbers", P, "wordsearch", "Find number words", "r", 1],
  [90, "Word Search: Food", "🔎", "wordsearch", "food", P, "wordsearch", "Find food words", "r", 1],
  [91, "Hidden Objects", "🫣", "hunt", "pictures", P, "puzzles", "Find requested objects", "elr"],
  [92, "Picture Path", "🛤️", "order", "numbers", P, "puzzles", "Follow the right sequence", "lr"],
  [93, "Match the Shadows", "🌒", "choice", "shapeShadow", P, "puzzles", "Object to shadow", "elr"],
  [94, "Complete the Picture", "🎨", "choice", "completePicture", P, "puzzles", "Choose the missing piece", "lr", 1],
  [95, "Pattern Builder", "🔁", "choice", "patternNext", P, "puzzles", "Recreate a pattern", "lr"],

  [96, "Letter Tracing", "✏️", "tracing", "letters", A, "tracing", "Trace upper and lowercase letters", "elr"],
  [97, "Number Tracing", "🖊️", "tracing", "numbers", N, "tracing", "Trace numbers 1 to 20", "lr"],
  [98, "Story Builder", "📝", "storybuilder", "build", S, "stories", "Make your own little story", "lr", 1],
  [99, "Read With Me", "📖", "story", "read", S, "stories", "Narrated beginner story", "elr"],
  [100, "Daily Adventure", "🗺️", "adventure", "daily", S, "words", "A personalised session", "elr"],
  [101, "Word Tracing: 2 Letters", "✍️", "tracing", "words2", S, "tracing", "Trace two-letter words", "lr"],
  [102, "Word Tracing: 3 Letters", "✍️", "tracing", "words3", S, "tracing", "Trace three-letter words", "lr"],
  [103, "Word Tracing: 4 Letters", "✍️", "tracing", "words4", S, "tracing", "Trace four-letter words", "r", 1],
  [104, "Word Tracing: 5 Letters", "✍️", "tracing", "words5", S, "tracing", "Trace five-letter words", "r", 1],
];

const MODE_MAP: Record<string, AgeMode> = { e: "explorer", l: "learner", r: "reader" };

const slug = (t: string) =>
  t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const GAMES: GameRecord[] = ROWS.map((r) => {
  const [n, title, emoji, engine, kind, world, skill, objective, modes, premium] = r;
  const ageModes = modes.split("").map((c) => MODE_MAP[c]!) as AgeMode[];
  return {
    id: slug(title),
    number: n,
    title,
    emoji,
    world,
    engine,
    kind,
    category: world,
    skill,
    objective,
    ageModes,
    difficultyMin: 1,
    difficultyMax: 5,
    interaction:
      engine === "hunt" ? "tap-many"
      : engine === "fishing" || engine === "monster" || engine === "rocket" || engine === "jigsaw" ? "drag"
      : engine === "order" ? "sequence"
      : engine === "memory" ? "flip"
      : engine === "tracing" || engine === "maze" ? "trace"
      : engine === "story" || engine === "storybuilder" ? "read"
      : "tap",
    minutes: engine === "adventure" ? 8 : 2,
    rounds: engine === "choice" || engine === "fishing" || engine === "monster" ? 5 : 1,
    rewardStars: 3,
    premium: premium === 1,
    completionThreshold: 0.6,
    retry: "hint-after-two",
  } satisfies GameRecord;
});

export const gameById = (id: string) => GAMES.find((g) => g.id === id);
export const gamesInWorld = (world: WorldId) => GAMES.filter((g) => g.world === world);
export const freeGames = () => GAMES.filter((g) => !g.premium);

export function gamesForMode(mode: AgeMode) {
  return GAMES.filter((g) => g.ageModes.includes(mode));
}

export const AGE_MODES: { id: AgeMode; title: string; ages: string; blurb: string; emoji: string }[] = [
  { id: "explorer", title: "Explorer", ages: "about 2–3", blurb: "Colors, shapes, sounds, tapping", emoji: "🐣" },
  { id: "learner", title: "Learner", ages: "about 3–4", blurb: "Alphabet, counting, first words", emoji: "🐤" },
  { id: "reader", title: "Reader", ages: "about 4–6", blurb: "Phonics, spelling, reading", emoji: "🦉" },
];
