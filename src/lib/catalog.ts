/**
 * Totland game catalog.
 *
 * Every game in the app is a *record*, not bespoke code: the reusable engines
 * in `rounds.ts` + `components/game/*` turn these records into playable
 * activities. Adding a new game means adding a row here.
 */
import type { SkillId } from "./content";
import { wordSearchIsPremium } from "./wordsearch-map";

export type EngineId =
  | "choice"
  | "fishing"
  | "monster"
  | "rocket"
  | "jigsaw"
  | "maze"
  | "rain"
  | "hunt"
  | "order"
  | "memory"
  | "wordsearch"
  | "tracing"
  | "flashcards"
  | "story"
  | "storybuilder"
  | "adventure"
  | "pop"
  | "sort"
  | "assemble"
  | "train"
  | "garden"
  | "paint"
  | "tapcount"
  | "draw"
  | "dots";

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
  [1, "Letter Pop", "🎈", "pop", "findUpper", A, "letters", "Recognise uppercase letters", "elr"],
  [2, "Alphabet Safari", "🦒", "hunt", "letters", A, "letters", "Spot letters in a busy scene", "elr"],
  [3, "Feed the Letter Monster", "👾", "monster", "findUpper", A, "letters", "Match a spoken letter name", "elr"],
  [4, "Letter Bubbles", "🫧", "pop", "bubbleLetters", A, "letters", "Letter recognition under choice", "elr", 1],
  [5, "Alphabet Train", "🚂", "order", "letters", A, "letters", "Alphabetical order", "lr"],
  [6, "Letter Fishing", "🎣", "fishing", "findUpper", A, "letters", "Letter recognition", "elr"],
  [7, "Letter Rocket", "🚀", "rocket", "letters", A, "letters", "Load the letters in alphabet order", "elr", 1],
  [8, "Letter Garden", "🌷", "order", "letters", A, "letters", "Sequence letters A to Z", "lr", 1],
  [9, "Missing Letter", "❓", "choice", "missingLetter", A, "letters", "Complete an alphabet sequence", "lr", 1],
  [10, "Alphabet Bridge", "🌉", "order", "letters", A, "letters", "Build a bridge in order", "lr", 1],
  [11, "Uppercase Match", "🔠", "memory", "letters", A, "memory", "Match identical letters", "elr"],
  [12, "Upper to Lowercase", "🔡", "choice", "upperToLower", A, "letters", "Link A to a", "lr", 1],
  [13, "Lower to Uppercase", "🔤", "choice", "lowerToUpper", A, "letters", "Link a to A", "lr", 1],
  [14, "Letter Shadow", "🌑", "choice", "letterShadow", A, "letters", "Match a letter to its silhouette", "elr", 1],
  [15, "Letter Maze", "🌀", "maze", "letters", A, "letters", "Trace the path in alphabet order", "lr", 1],
  [16, "Letter Detective", "🔍", "hunt", "letters", A, "letters", "Find every copy of a letter", "elr", 1],
  [17, "Letter Rain", "🌧️", "rain", "findUpper", A, "letters", "Relaxed letter recognition with no timer", "lr"],
  [18, "Letter Memory", "🧠", "memory", "letters", A, "memory", "Remember letter pairs", "elr", 1],
  [19, "Letter Puzzle", "🧩", "assemble", "assembleLetter", P, "puzzles", "Assemble a letter", "lr", 1],
  [20, "Alphabet Race", "🏁", "order", "letters", A, "letters", "Race through the alphabet", "lr", 1],

  [21, "What Starts With B?", "🅱️", "choice", "startsWith", A, "phonics", "Beginning sounds", "lr"],
  [22, "Sound Match", "👂", "choice", "letterSound", A, "phonics", "Match sound to letter", "lr"],
  [23, "Beginning Sound Train", "🚋", "train", "trainSound", A, "phonics", "Sort by beginning sound", "lr", 1],
  [24, "Sound Detective", "🕵️", "hunt", "sounds", A, "phonics", "Identify a beginning sound", "lr", 1],
  [25, "Word Builder", "🧱", "order", "buildWord", S, "words", "Spell a simple word", "r", 1],
  [26, "Picture Word Match", "🖼️", "choice", "pictureWord", S, "words", "Match picture to word", "lr"],
  [27, "Word Puzzle", "🪄", "order", "buildWord", S, "words", "Assemble letters into a word", "r", 1],
  [28, "Missing Letter Word", "✏️", "choice", "missingLetterWord", S, "words", "Complete C_T", "lr", 1],
  [29, "Word Fishing", "🐟", "fishing", "missingLetterWord", S, "words", "Catch the missing letter", "lr", 1],
  [30, "Word Rocket", "🛸", "rocket", "buildWord", S, "words", "Build a word to launch", "r"],
  [31, "Rhyming Pairs", "🎵", "choice", "rhyme", S, "words", "Hear rhyming words", "lr", 1],
  [32, "Same Sound", "🔁", "choice", "sameSound", A, "phonics", "Same beginning sound", "lr", 1],
  [33, "Word Memory", "🗂️", "memory", "wordPicture", S, "memory", "Match word to picture", "r", 1],
  [34, "Word Train", "🚃", "order", "buildWord", S, "words", "Letters in the right order", "r", 1],
  [35, "First Word Builder", "🅰️", "order", "buildWord", S, "words", "Very first spelling", "lr"],

  [36, "Count the Animals", "🐑", "tapcount", "tapCount", N, "numbers", "Count and choose the number", "elr"],
  [37, "Number Pop", "🎈", "pop", "findNumber", N, "numbers", "Numeral recognition", "elr"],
  [38, "Number Bubbles", "🫧", "pop", "bubbleNumbers", N, "numbers", "Numeral recognition", "elr", 1],
  [39, "Number Fishing", "🎣", "fishing", "nextNumber", N, "numbers", "Catch the number that comes next", "elr", 1],
  [40, "Number Train", "🚂", "order", "numbers", N, "numbers", "Number order", "lr"],
  [41, "Number Match", "🔗", "choice", "numberQuantity", N, "numbers", "Numeral to quantity", "lr"],
  [42, "Count the Stars", "⭐", "garden", "fillJar", N, "numbers", "Counting", "elr", 1],
  [43, "Number Monster", "👹", "monster", "countObjects", N, "numbers", "Count, then feed the monster that number", "elr", 1],
  [44, "Number Garden", "🌻", "garden", "plantCount", N, "numbers", "Plant that many flowers", "elr", 1],
  [45, "Number Rocket", "🚀", "rocket", "numbers", N, "numbers", "Load the numbers in counting order", "elr", 1],
  [46, "Missing Number", "➖", "choice", "missingNumber", N, "numbers", "Complete 1, 2, _, 4", "lr", 1],
  [47, "Number Maze", "🌀", "maze", "numbers", N, "numbers", "Move through numbers in order", "lr"],
  [48, "More or Less", "⚖️", "choice", "moreOrLess", N, "numbers", "Compare quantities", "lr", 1],
  [49, "Bigger Number", "🔝", "choice", "biggerNumber", N, "numbers", "Compare numerals", "lr", 1],
  [50, "Number Memory", "🧠", "memory", "numbers", N, "memory", "Match numeral pairs", "elr", 1],
  [51, "Counting Train", "🚋", "train", "trainCount", N, "numbers", "Count the carriages", "elr", 1],
  [52, "Number Puzzle", "🧩", "assemble", "assembleNumber", P, "puzzles", "Assemble a numeral", "lr", 1],
  [53, "Count the Fruit", "🍏", "garden", "fillBasket", N, "numbers", "Counting to twenty", "lr", 1],
  [54, "Number Hunt", "🔍", "hunt", "numbers", N, "numbers", "Find every copy of a number", "elr"],
  [55, "Number Rain", "🌧️", "rain", "numbersInOrder", N, "numbers", "Catch numbers in order", "lr", 1],

  [56, "Color Pop", "🎈", "pop", "findColor", C, "colors", "Colour recognition", "elr"],
  [57, "Color Match", "🎨", "paint", "paintPicture", C, "colors", "Match same colour", "elr"],
  [58, "Rainbow Sort", "🌈", "sort", "sortColor", C, "colors", "Sort by colour", "elr"],
  [59, "Color Detective", "🕵️", "hunt", "colors", C, "colors", "Find every object of a colour", "elr"],
  [60, "Color Memory", "🧠", "memory", "colors", C, "memory", "Match colour pairs", "elr"],
  [61, "Shape Pop", "🔷", "pop", "findShape", C, "shapes", "Shape recognition", "elr"],
  [62, "Shape Match", "🔶", "sort", "shapeSorter", C, "shapes", "Match identical shapes", "elr"],
  [63, "Shape Builder", "🏗️", "assemble", "shapeBuild", C, "shapes", "Build with shapes", "lr", 1],
  [64, "Shape Sort", "🗃️", "sort", "sortShape", C, "shapes", "Sort shapes into groups", "elr"],
  [65, "Shape Shadow", "🌑", "sort", "shadowShape", C, "shapes", "Match shape to silhouette", "elr"],
  [66, "Shape Memory", "🧠", "memory", "shapes", C, "memory", "Match shape pairs", "elr", 1],
  [67, "Shape Hunt", "🔍", "hunt", "shapes", C, "shapes", "Find shapes in a scene", "elr", 1],
  [68, "Shape Puzzle", "🧩", "assemble", "assembleShape", P, "puzzles", "Assemble a picture", "lr", 1],
  [69, "Shape Train", "🚃", "rocket", "shapeTrain", C, "shapes", "Continue a shape pattern", "lr", 1],
  [70, "What's Missing?", "❔", "choice", "shapeMissing", C, "shapes", "Spot the missing shape", "lr", 1],

  [71, "Animal Memory", "🐾", "memory", "animals", P, "memory", "Classic memory pairs", "elr"],
  [72, "Letter Memory Park", "🔠", "memory", "letters", P, "memory", "Letter pairs", "elr", 1],
  [73, "Number Memory Park", "🔢", "memory", "numbers", P, "memory", "Number pairs", "elr", 1],
  [74, "Picture Memory", "🖼️", "memory", "animals", P, "memory", "Picture pairs", "elr", 1],
  [75, "Picture to Word", "🔤", "memory", "wordPicture", P, "memory", "Word and picture pairs", "r", 1],
  [76, "What's Different?", "🙃", "choice", "whichDifferent", P, "puzzles", "Odd one out", "elr"],
  [77, "Which Comes Next?", "➡️", "choice", "whichNext", P, "puzzles", "Complete a sequence", "lr", 1],
  [78, "Sort the Toys", "🧸", "sort", "sortRule", P, "puzzles", "Sort by category", "elr", 1],
  [79, "Big or Small", "🐘", "sort", "sizeBoxes", P, "puzzles", "Compare size", "elr"],
  [80, "Long or Short", "📏", "sort", "lengthOrder", P, "puzzles", "Compare length", "elr", 1],

  [81, "Simple Jigsaw", "🧩", "jigsaw", "jigsawEasy", P, "puzzles", "Easy jigsaw with big pieces", "elr"],
  [82, "Animal Jigsaw", "🐨", "jigsaw", "jigsawPiece", P, "puzzles", "Build animal jigsaws", "lr"],
  [83, "Alphabet Jigsaw", "🔠", "jigsaw", "letterCards", P, "puzzles", "Assemble letters", "lr", 1],
  [84, "Number Jigsaw", "🔢", "jigsaw", "numberCards", P, "puzzles", "Assemble numbers", "lr", 1],
  [85, "Picture Puzzle", "🖼️", "assemble", "assemblePicture", P, "puzzles", "Complete an image", "lr", 1],
  [86, "Word Search: Letters", "🔎", "wordsearch", "letters", P, "wordsearch", "Find letters in a grid", "elr"],
  [87, "Word Search: Animals", "🔎", "wordsearch", "animals", P, "wordsearch", "Find animal words", "r", 1],
  [88, "Word Search: Colors", "🔎", "wordsearch", "colors", P, "wordsearch", "Find colour words", "r", 1],
  [89, "Word Search: Numbers", "🔎", "wordsearch", "numbers", P, "wordsearch", "Find number words", "r", 1],
  [90, "Word Search: Food", "🔎", "wordsearch", "food", P, "wordsearch", "Find food words", "r", 1],
  [91, "Hidden Objects", "🫣", "hunt", "pictures", P, "puzzles", "Find requested objects", "elr"],
  [92, "Picture Path", "🛤️", "order", "numbers", P, "puzzles", "Follow the right sequence", "lr", 1],
  [93, "Match the Shadows", "🌒", "sort", "shadowObject", P, "puzzles", "Object to shadow", "elr", 1],
  [94, "Complete the Picture", "🎨", "choice", "completePicture", P, "puzzles", "Choose the missing piece", "lr", 1],
  [95, "Pattern Builder", "🔁", "assemble", "patternBuild", P, "puzzles", "Recreate a pattern", "lr", 1],

  [96, "Letter Tracing", "✏️", "tracing", "letters", A, "tracing", "Trace upper and lowercase letters", "elr"],
  [97, "Number Tracing", "🖊️", "tracing", "numbers", N, "tracing", "Trace numbers 1 to 20", "lr"],
  [98, "Story Builder", "📝", "storybuilder", "build", S, "stories", "Make your own little story", "lr", 1],
  [99, "Read With Me", "📖", "story", "read", S, "stories", "Narrated beginner story", "elr"],
  [100, "Daily Adventure", "🗺️", "adventure", "daily", S, "words", "A personalised session", "elr"],
  [101, "Word Tracing: 2 Letters", "✍️", "tracing", "words2", S, "tracing", "Trace two-letter words", "lr"],
  [102, "Word Tracing: 3 Letters", "✍️", "tracing", "words3", S, "tracing", "Trace three-letter words", "lr", 1],
  [103, "Word Tracing: 4 Letters", "✍️", "tracing", "words4", S, "tracing", "Trace four-letter words", "r", 1],
  [104, "Word Tracing: 5 Letters", "✍️", "tracing", "words5", S, "tracing", "Trace five-letter words", "r", 1],

  // Content expansion batch — reuses existing engines/round-generators with
  // fresh titles (same pattern as rows 1-104); strengthens the thinnest
  // skill areas (colors/shapes) and the Explorer (ages 2-3) age-mode tag.
  [105, "Rainbow Hunt", "🌈", "hunt", "colors", C, "colors", "Find every object of a color", "elr"],
  [106, "Color Twins", "🧠", "memory", "colors", C, "memory", "Match color pairs", "elr", 1],
  [107, "Paint Match", "🖌️", "paint", "dipBrush", C, "colors", "Match the same color", "elr"],
  [108, "Color Carousel", "🎠", "sort", "sortColor3", C, "colors", "Sort by color", "elr", 1],
  [109, "Shape Safari", "🦓", "hunt", "shapes", C, "shapes", "Find shapes in a scene", "elr", 1],
  [110, "Shape Twins", "🧠", "memory", "shapes", C, "memory", "Match shape pairs", "elr", 1],
  [111, "Twin Shapes", "🔷", "memory", "shapes", C, "shapes", "Match identical shapes", "elr"],
  [112, "Pattern Parade", "🔁", "choice", "patternNext", C, "shapes", "Continue a shape pattern", "lr", 1],

  // Generalized engine-flavor batch — Fishing/Monster/Rain now speak
  // correctly for any skill (see enginePrompt in i18n.ts), so each engine
  // goes from one letters-only game to covering colors/shapes/numbers too.
  [113, "Fishing for Colors", "🎣", "fishing", "findColor", C, "colors", "Catch the matching color", "elr"],
  [114, "Fishing for Shapes", "🎣", "fishing", "findShape", C, "shapes", "Catch the matching shape", "elr", 1],
  [115, "Catch the Number", "🎣", "fishing", "findNumber", N, "numbers", "Catch the spoken number", "elr", 1],
  [116, "Color Monster", "👾", "monster", "findColor", C, "colors", "Feed the monster a matching color", "elr"],
  [117, "Shape Monster", "👾", "monster", "findShape", C, "shapes", "Feed the monster a matching shape", "elr", 1],
  [118, "Hungry for Numbers", "👾", "monster", "findNumber", N, "numbers", "Feed the monster the spoken number", "elr", 1],
  [119, "Color Rain", "🌧️", "rain", "findColor", C, "colors", "Relaxed color recognition with no timer", "lr"],
  [120, "Shape Rain", "🌧️", "rain", "findShape", C, "shapes", "Relaxed shape recognition with no timer", "lr", 1],
  [121, "Falling Numbers", "🌧️", "rain", "findNumber", N, "numbers", "Relaxed numeral recognition with no timer", "lr", 1],
  // Pre-writing strokes: follow a dashed path from the green start dot.
  [122, "Line Tracing", "〰️", "tracing", "lines", A, "tracing", "Follow dashed lines and curves", "elr"],
  // Multi-stroke tracing on the same engine: shapes (free) and digits 0-9.
  // Trace Numbers is Premium via the trailing 1 — delete that one flag to make it free.
  [123, "Trace Shapes", "🔺", "tracing", "traceShapes", C, "shapes", "Trace shapes stroke by stroke", "elr"],
  [124, "Trace Numbers", "🔢", "tracing", "traceNumbers", N, "numbers", "Trace numbers 0 to 9", "lr", 1],
  // Blank-page drawing: calm, no timer, no score; drawings stay on the device.
  [125, "Free Draw", "🖍️", "draw", "freeDraw", C, "colors", "Draw anything you like", "elr"],
  // Numbered dot-to-dot pictures, always in numeric order. FREE — add a trailing 1 to make it Premium.
  [126, "Connect the Dots", "✏️", "dots", "connectDots", N, "numbers", "Join numbered dots to reveal a picture", "elr"],
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
      engine === "hunt" || engine === "garden" || engine === "tapcount" ? "tap-many"
      : engine === "fishing" || engine === "monster" || engine === "rocket" || engine === "jigsaw" || engine === "sort" || engine === "assemble" || engine === "train" || engine === "paint" ? "drag"
      : engine === "order" ? "sequence"
      : engine === "memory" ? "flip"
      : engine === "tracing" || engine === "maze" || engine === "draw" || engine === "dots" ? "trace"
      : engine === "story" || engine === "storybuilder" ? "read"
      : "tap",
    minutes: engine === "adventure" ? 8 : 2,
    rounds: engine === "pop" ? 5 : engine === "choice" || engine === "fishing" || engine === "monster" || engine === "rain" ? 5 : 1,
    rewardStars: 3,
    // Word Search rows follow their Word Finds puzzle tier (single source of truth).
    premium: engine === "wordsearch" ? wordSearchIsPremium(kind) : premium === 1,
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
