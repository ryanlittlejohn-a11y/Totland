/**
 * Bundled, offline-first learning content.
 * Everything here is original app content (no third-party assets),
 * so the whole child experience works with zero network access.
 */

export type SkillId =
  | "letters"
  | "numbers"
  | "colors"
  | "shapes"
  | "words"
  | "phonics"
  | "memory"
  | "puzzles"
  | "tracing"
  | "flashcards"
  | "wordsearch"
  | "stories";

export type AreaId = SkillId;

export interface Area {
  id: AreaId;
  title: string;
  emoji: string;
  blurb: string;
  tint: "clay" | "amber" | "moss" | "sky" | "plum" | "wood";
  free: boolean;
  /** how many generated activities this area can produce */
  activities: number;
}

export const AREAS: Area[] = [
  { id: "letters", title: "ABC & Phonics", emoji: "🔤", blurb: "Find, pop and learn letters", tint: "clay", free: true, activities: 104 },
  { id: "numbers", title: "Numbers 1–20", emoji: "🔢", blurb: "Count, match and compare", tint: "sky", free: true, activities: 100 },
  { id: "colors", title: "Colors", emoji: "🎨", blurb: "Color quest and sorting", tint: "plum", free: true, activities: 48 },
  { id: "shapes", title: "Shapes", emoji: "🔷", blurb: "Build with shapes", tint: "moss", free: true, activities: 40 },
  { id: "words", title: "First Words", emoji: "🍎", blurb: "200+ picture words", tint: "amber", free: false, activities: 120 },
  { id: "phonics", title: "Beginning Sounds", emoji: "👂", blurb: "Hear the first sound", tint: "clay", free: false, activities: 78 },
  { id: "memory", title: "Matching & Memory", emoji: "🧠", blurb: "Flip and match pairs", tint: "sky", free: true, activities: 60 },
  { id: "puzzles", title: "Puzzles", emoji: "🧩", blurb: "Slide the pieces home", tint: "moss", free: false, activities: 100 },
  { id: "tracing", title: "Letter Tracing", emoji: "✏️", blurb: "Trace big and small letters", tint: "wood", free: true, activities: 52 },
  { id: "flashcards", title: "Flash Cards", emoji: "🃏", blurb: "Tap to hear the word", tint: "amber", free: false, activities: 100 },
  { id: "wordsearch", title: "Word Search", emoji: "🔎", blurb: "Tiny, gentle grids", tint: "plum", free: false, activities: 100 },
  { id: "stories", title: "Storybooks", emoji: "📖", blurb: "Read along together", tint: "wood", free: false, activities: 25 },
];

export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export interface WordItem {
  word: string;
  emoji: string;
  letter: string;
}

export const WORDS: WordItem[] = [
  ["apple", "🍎"], ["ant", "🐜"], ["avocado", "🥑"], ["airplane", "✈️"], ["acorn", "🌰"],
  ["ball", "⚽"], ["bear", "🐻"], ["banana", "🍌"], ["bus", "🚌"], ["bee", "🐝"], ["boat", "⛵"],
  ["cat", "🐱"], ["cake", "🍰"], ["car", "🚗"], ["cow", "🐄"], ["cloud", "☁️"], ["carrot", "🥕"],
  ["dog", "🐶"], ["duck", "🦆"], ["drum", "🥁"], ["donut", "🍩"], ["dinosaur", "🦖"],
  ["egg", "🥚"], ["elephant", "🐘"], ["eye", "👁️"],
  ["fox", "🦊"], ["fish", "🐟"], ["frog", "🐸"], ["flower", "🌻"], ["fire", "🔥"],
  ["goat", "🐐"], ["grapes", "🍇"], ["gift", "🎁"], ["guitar", "🎸"],
  ["hat", "🎩"], ["horse", "🐴"], ["house", "🏠"], ["honey", "🍯"],
  ["ice cream", "🍦"], ["igloo", "🧊"], ["insect", "🐞"],
  ["jam", "🍯"], ["jellyfish", "🪼"], ["juice", "🧃"],
  ["kite", "🪁"], ["key", "🔑"], ["koala", "🐨"],
  ["lion", "🦁"], ["leaf", "🍃"], ["lemon", "🍋"], ["ladybug", "🐞"],
  ["moon", "🌙"], ["mouse", "🐭"], ["milk", "🥛"], ["monkey", "🐵"],
  ["nest", "🪹"], ["nose", "👃"], ["night", "🌌"],
  ["owl", "🦉"], ["orange", "🍊"], ["octopus", "🐙"],
  ["pig", "🐷"], ["pear", "🍐"], ["panda", "🐼"], ["pizza", "🍕"], ["penguin", "🐧"],
  ["queen", "👑"], ["quilt", "🧵"],
  ["rabbit", "🐰"], ["rainbow", "🌈"], ["robot", "🤖"], ["rocket", "🚀"],
  ["sun", "☀️"], ["star", "⭐"], ["snake", "🐍"], ["strawberry", "🍓"], ["socks", "🧦"],
  ["tree", "🌳"], ["tiger", "🐯"], ["train", "🚂"], ["turtle", "🐢"],
  ["umbrella", "☂️"], ["unicorn", "🦄"],
  ["van", "🚐"], ["violin", "🎻"],
  ["whale", "🐳"], ["watermelon", "🍉"], ["wagon", "🛻"],
  ["xylophone", "🎹"],
  ["yarn", "🧶"], ["yo-yo", "🪀"],
  ["zebra", "🦓"], ["zipper", "🤐"],
].map(([word, emoji]) => ({ word: word as string, emoji: emoji as string, letter: (word as string)[0].toUpperCase() }));

export function wordsForLetter(letter: string) {
  return WORDS.filter((w) => w.letter === letter.toUpperCase());
}

export interface ColorItem {
  name: string;
  swatch: string;
  emoji: string;
}

export const COLORS: ColorItem[] = [
  { name: "red", swatch: "oklch(0.62 0.21 27)", emoji: "🍎" },
  { name: "orange", swatch: "oklch(0.74 0.16 55)", emoji: "🍊" },
  { name: "yellow", swatch: "oklch(0.87 0.15 92)", emoji: "🌻" },
  { name: "green", swatch: "oklch(0.68 0.15 145)", emoji: "🥦" },
  { name: "blue", swatch: "oklch(0.62 0.14 245)", emoji: "🫐" },
  { name: "purple", swatch: "oklch(0.58 0.16 310)", emoji: "🍇" },
  { name: "pink", swatch: "oklch(0.78 0.12 350)", emoji: "🌸" },
  { name: "brown", swatch: "oklch(0.52 0.07 55)", emoji: "🐻" },
];

export interface ShapeItem {
  name: string;
  clip: string;
  emoji: string;
}

export const SHAPES: ShapeItem[] = [
  { name: "circle", clip: "circle(50%)", emoji: "⚪" },
  { name: "square", clip: "inset(0)", emoji: "🟥" },
  { name: "triangle", clip: "polygon(50% 0, 100% 100%, 0 100%)", emoji: "🔺" },
  { name: "star", clip: "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)", emoji: "⭐" },
  { name: "heart", clip: "polygon(50% 100%,0 40%,25% 0,50% 22%,75% 0,100% 40%)", emoji: "❤️" },
  { name: "diamond", clip: "polygon(50% 0,100% 50%,50% 100%,0 50%)", emoji: "🔶" },
];

export interface StoryPage {
  text: string;
  emoji: string;
}
export interface Story {
  id: string;
  title: string;
  cover: string;
  pages: StoryPage[];
}

export const STORIES: Story[] = [
  {
    id: "bear-picnic",
    title: "Bramble Bear's Picnic",
    cover: "🐻",
    pages: [
      { text: "Bramble Bear packs a basket.", emoji: "🧺" },
      { text: "He walks up the green hill.", emoji: "⛰️" },
      { text: "A bee says hello.", emoji: "🐝" },
      { text: "They share honey bread.", emoji: "🍯" },
      { text: "The sun goes to sleep.", emoji: "🌇" },
    ],
  },
  {
    id: "fox-lost-sock",
    title: "Fern Fox and the Lost Sock",
    cover: "🦊",
    pages: [
      { text: "Fern Fox has one sock.", emoji: "🧦" },
      { text: "She looks under the bed.", emoji: "🛏️" },
      { text: "She looks in the box.", emoji: "📦" },
      { text: "The puppy had it!", emoji: "🐶" },
      { text: "Now Fern has two socks.", emoji: "🧦" },
    ],
  },
  {
    id: "robot-garden",
    title: "Bolt the Robot Grows a Garden",
    cover: "🤖",
    pages: [
      { text: "Bolt plants a small seed.", emoji: "🌱" },
      { text: "He gives it water.", emoji: "💧" },
      { text: "The sun shines warm.", emoji: "☀️" },
      { text: "A flower says hello.", emoji: "🌻" },
      { text: "Bolt beeps with joy.", emoji: "🤖" },
    ],
  },
  {
    id: "dino-splash",
    title: "Dot the Dino Makes a Splash",
    cover: "🦖",
    pages: [
      { text: "Dot finds a big puddle.", emoji: "💦" },
      { text: "Splash! Splash! Splash!", emoji: "🦖" },
      { text: "Her friends jump in too.", emoji: "🐢" },
      { text: "Everyone is muddy.", emoji: "🟤" },
      { text: "Bath time is fun too.", emoji: "🛁" },
    ],
  },
  {
    id: "owl-stars",
    title: "Ollie Owl Counts the Stars",
    cover: "🦉",
    pages: [
      { text: "Ollie Owl wakes at night.", emoji: "🌙" },
      { text: "He counts one bright star.", emoji: "⭐" },
      { text: "Then two, then three.", emoji: "✨" },
      { text: "Ten stars in the sky.", emoji: "🌌" },
      { text: "Ollie yawns and sleeps.", emoji: "😴" },
    ],
  },
];

/** Little characters that make up the app's original visual universe. */
export const CHARACTERS = [
  { id: "bear", emoji: "🐻", name: "Bramble Bear" },
  { id: "fox", emoji: "🦊", name: "Fern Fox" },
  { id: "dino", emoji: "🦖", name: "Dot the Dino" },
  { id: "robot", emoji: "🤖", name: "Bolt" },
  { id: "owl", emoji: "🦉", name: "Ollie Owl" },
];

export const STICKERS = [
  "🦊", "🤖", "🦖", "🐻", "🦉", "🚀", "🎈", "🌈", "⭐", "🍄",
  "🐝", "🌻", "🐢", "🎪", "🧩", "🍩", "🪁", "🐳", "🎨", "🏆",
];

export interface Praise {
  correct: string[];
  retry: string[];
}
export const PRAISE: Praise = {
  correct: ["Great job!", "You did it!", "Wonderful!", "Nice work!", "Hooray!", "You're getting it!"],
  retry: ["Great try!", "Let's try again!", "Almost — try once more!", "You're getting it!"],
};

export function pick<T>(arr: T[], rnd = Math.random): T {
  return arr[Math.floor(rnd() * arr.length)];
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Total bundled activity count, shown to parents. */
export const LIBRARY_SIZE = AREAS.reduce((n, a) => n + a.activities, 0);
