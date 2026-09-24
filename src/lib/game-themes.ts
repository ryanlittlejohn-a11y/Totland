export type ThemePalette = "clay" | "amber" | "moss" | "sky" | "plum" | "night";
export type ThemeShape = "round" | "bubble" | "ticket" | "block" | "puzzle" | "drop";
export type ThemeMotif = "pop" | "munch" | "bubble" | "splash" | "launch" | "rain" | "tap" | "fit" | "bell" | "discover";

export interface GameTheme {
  mascot: string;
  decorations: string;
  cue: { en: string; es: string };
  palette: ThemePalette;
  shape: ThemeShape;
  motif: ThemeMotif;
}

const theme = (
  mascot: string,
  decorations: string,
  en: string,
  es: string,
  palette: ThemePalette,
  shape: ThemeShape,
  motif: ThemeMotif,
): GameTheme => ({ mascot, decorations, cue: { en, es }, palette, shape, motif });

/** Presentation only: one title-matched skin for every game in a repeated engine/kind family. */
export const GAME_THEMES: Record<string, GameTheme> = {
  "letter-pop": theme("🎈", "☁️  ✨  ☁️", "Pop the letter!", "¡Revienta la letra!", "clay", "round", "pop"),
  "feed-the-letter-monster": theme("👾", "🍎  ·  🍓", "Feed the monster!", "¡Alimenta al monstruo!", "plum", "ticket", "munch"),
  "letter-bubbles": theme("🫧", "○  ◌  ○", "Find the letter bubble!", "¡Busca la burbuja con la letra!", "sky", "bubble", "bubble"),
  "letter-fishing": theme("🦊", "🌿  〰️  🐟", "Catch the letter!", "¡Atrapa la letra!", "moss", "round", "splash"),
  "letter-rocket": theme("🤖", "⭐  🚀  ✦", "Launch the letter!", "¡Lanza la letra!", "night", "ticket", "launch"),
  "letter-rain": theme("☂️", "☁️  💧  ☁️", "Catch the rainy letter!", "¡Atrapa la letra de lluvia!", "sky", "drop", "rain"),

  "alphabet-safari": theme("🦒", "🌿  🐾  🌿", "Spot letters on safari!", "¡Busca letras en el safari!", "amber", "round", "discover"),
  "letter-maze": theme("🦖", "↳  ↱  ↳", "Follow the letter trail!", "¡Sigue el camino de letras!", "plum", "block", "tap"),
  "letter-detective": theme("🕵️", "🔎  ·  🔎", "Find every clue!", "¡Encuentra todas las pistas!", "night", "ticket", "discover"),

  "alphabet-train": theme("🐻", "🚂  ▪  ▪", "Build the alphabet train!", "¡Arma el tren del alfabeto!", "clay", "ticket", "bell"),
  "letter-garden": theme("🌷", "🌱  🌼  🌱", "Grow the letter garden!", "¡Cultiva el jardín de letras!", "moss", "round", "bubble"),
  "alphabet-bridge": theme("🦉", "🌊  ▰  🌊", "Build the alphabet bridge!", "¡Construye el puente del alfabeto!", "sky", "block", "tap"),
  "alphabet-race": theme("🏁", "○  ─  🏁", "Race through the alphabet!", "¡Recorre el alfabeto!", "amber", "ticket", "launch"),

  "uppercase-match": theme("🔠", "A  ·  A", "Match the big letters!", "¡Une las letras mayúsculas!", "clay", "block", "fit"),
  "letter-memory": theme("🧠", "✦  A  ✦", "Remember the letter pairs!", "¡Recuerda las parejas de letras!", "plum", "round", "bubble"),
  "letter-memory-park": theme("🎡", "🌳  🎠  🌳", "Find pairs in the park!", "¡Encuentra parejas en el parque!", "moss", "ticket", "bell"),

  "letter-puzzle": theme("🧩", "A  ◇  B", "Fit the letter piece!", "¡Encaja la pieza de la letra!", "amber", "puzzle", "fit"),
  "alphabet-jigsaw": theme("🔠", "◩  ◪  ◫", "Complete the alphabet jigsaw!", "¡Completa el rompecabezas del alfabeto!", "sky", "puzzle", "fit"),
  "what-starts-with-b": theme("🅱️", "🐝  ·  ⚽", "Find what starts with the sound!", "¡Busca lo que empieza con el sonido!", "amber", "round", "discover"),
  "beginning-sound-train": theme("🚋", "♫  🚃  ♫", "Choose a sound for the train!", "¡Elige un sonido para el tren!", "clay", "ticket", "bell"),
  "sound-match": theme("👂", "♪  ·  ♫", "Listen and match!", "¡Escucha y une!", "sky", "round", "bubble"),
  "sound-detective": theme("🕵️", "🔎  ♪  🔎", "Solve the sound clue!", "¡Resuelve la pista de sonido!", "night", "ticket", "discover"),

  "word-builder": theme("🤖", "🔧  ▪  🔨", "Build the word!", "¡Construye la palabra!", "clay", "block", "tap"),
  "word-puzzle": theme("🦉", "◩  ◪  ◫", "Complete the word puzzle!", "¡Completa el rompecabezas de palabras!", "plum", "puzzle", "fit"),
  "word-rocket": theme("🚀", "⭐  ✦  🌙", "Fuel the word rocket!", "¡Carga el cohete de palabras!", "night", "ticket", "launch"),
  "word-train": theme("🐻", "🚂  ▪  ▪", "Build the word train!", "¡Arma el tren de palabras!", "amber", "ticket", "bell"),
  "first-word-builder": theme("🦊", "A  B  C", "Make your first word!", "¡Forma tu primera palabra!", "moss", "block", "tap"),
  "missing-letter-word": theme("✏️", "C  _  T", "Complete the word!", "¡Completa la palabra!", "clay", "block", "fit"),
  "word-fishing": theme("🐟", "🌿  〰️  🎣", "Catch the missing letter!", "¡Pesca la letra que falta!", "sky", "round", "splash"),
  "word-memory": theme("🗂️", "▤  ·  ▤", "Match words and pictures!", "¡Une palabras e imágenes!", "plum", "block", "fit"),
  "picture-to-word": theme("🦉", "🖼️  ↔  ABC", "Pair each picture and word!", "¡Une cada imagen con su palabra!", "moss", "ticket", "discover"),

  "count-the-animals": theme("🐑", "🐾  🌾  🐾", "Count the animals!", "¡Cuenta los animales!", "moss", "round", "discover"),
  "count-the-stars": theme("⭐", "✦  🌙  ✦", "Count the stars!", "¡Cuenta las estrellas!", "night", "round", "bubble"),
  "number-monster": theme("👹", "🍪  ·  🍪", "Feed the number monster!", "¡Alimenta al monstruo de números!", "plum", "ticket", "munch"),
  "counting-train": theme("🚋", "🚃  ▪  🚃", "Count the train cars!", "¡Cuenta los vagones!", "clay", "ticket", "bell"),
  "count-the-fruit": theme("🍏", "🍓  🍐  🍊", "Count the fruit!", "¡Cuenta las frutas!", "amber", "round", "pop"),
  "number-pop": theme("🎈", "☁️  ✨  ☁️", "Pop the number!", "¡Revienta el número!", "clay", "round", "pop"),
  "number-bubbles": theme("🫧", "○  ◌  ○", "Find the number bubble!", "¡Busca la burbuja con el número!", "sky", "bubble", "bubble"),
  "number-fishing": theme("🎣", "🌿  〰️  🐟", "Catch the number!", "¡Atrapa el número!", "moss", "round", "splash"),
  "number-rocket": theme("🚀", "⭐  🚀  ✦", "Launch the number!", "¡Lanza el número!", "night", "ticket", "launch"),
  "number-train": theme("🚂", "🚃  ▪  🚃", "Put the number train in order!", "¡Ordena el tren de números!", "clay", "ticket", "bell"),
  "number-maze": theme("🌀", "↳  1  ↱", "Follow the number path!", "¡Sigue el camino de números!", "plum", "block", "tap"),
  "number-rain": theme("☂️", "☁️  1  💧", "Order the rainy numbers!", "¡Ordena los números de lluvia!", "sky", "drop", "rain"),
  "picture-path": theme("🛤️", "🌳  •  🏡", "Follow the picture path!", "¡Sigue el camino de imágenes!", "moss", "round", "discover"),
  "number-match": theme("🔗", "1  ↔  ●", "Match number and amount!", "¡Une el número y la cantidad!", "sky", "block", "fit"),
  "number-garden": theme("🌻", "🌱  1  🌼", "Grow the right amount!", "¡Cultiva la cantidad correcta!", "moss", "round", "bubble"),
  "number-memory": theme("🧠", "1  ·  1", "Remember the number pairs!", "¡Recuerda las parejas de números!", "plum", "block", "fit"),
  "number-memory-park": theme("🎠", "🌳  1  🌳", "Find number pairs in the park!", "¡Encuentra parejas de números en el parque!", "amber", "ticket", "bell"),
  "number-puzzle": theme("🧩", "1  ◇  2", "Fit the number piece!", "¡Encaja la pieza del número!", "amber", "puzzle", "fit"),
  "number-jigsaw": theme("🔢", "◩  ◪  ◫", "Complete the number jigsaw!", "¡Completa el rompecabezas de números!", "sky", "puzzle", "fit"),

  "shape-builder": theme("🏗️", "▰  ▲  ●", "Build with shapes!", "¡Construye con formas!", "amber", "block", "tap"),
  "what-s-missing": theme("❔", "●  _  ▲", "Find the missing shape!", "¡Busca la forma que falta!", "plum", "puzzle", "discover"),
  "shape-shadow": theme("🌑", "◆  ◇  ◆", "Match the shape shadow!", "¡Une la sombra de la forma!", "night", "block", "fit"),
  "match-the-shadows": theme("🌒", "🐾  ◇  🔎", "Find each matching shadow!", "¡Encuentra cada sombra!", "plum", "ticket", "discover"),
  "shape-puzzle": theme("🔷", "◩  ◆  ◪", "Complete the shape puzzle!", "¡Completa el rompecabezas de formas!", "sky", "puzzle", "fit"),
  "simple-jigsaw": theme("🧩", "◩  ◪  ◫", "Fit the jigsaw piece!", "¡Encaja la pieza!", "amber", "puzzle", "fit"),
  "animal-jigsaw": theme("🐨", "🐾  ◩  🐾", "Complete the animal jigsaw!", "¡Completa el rompecabezas de animales!", "moss", "puzzle", "fit"),
  "shape-train": theme("🚃", "●  ■  ▲", "Continue the shape train!", "¡Continúa el tren de formas!", "clay", "ticket", "bell"),
  "pattern-builder": theme("🔁", "◆  ●  ◆", "Build the pattern!", "¡Construye el patrón!", "plum", "block", "tap"),
  "animal-memory": theme("🐾", "🐻  ·  🐻", "Match the animal pairs!", "¡Une las parejas de animales!", "moss", "round", "discover"),
  "picture-memory": theme("🖼️", "▣  ·  ▣", "Remember the picture pairs!", "¡Recuerda las parejas de imágenes!", "sky", "ticket", "bubble"),
  "picture-puzzle": theme("🖼️", "◩  🖼️  ◪", "Complete the picture puzzle!", "¡Completa el rompecabezas de imágenes!", "amber", "puzzle", "fit"),
  "complete-the-picture": theme("🎨", "🖌️  ◇  🎨", "Choose the finishing piece!", "¡Elige la pieza final!", "clay", "puzzle", "fit"),
};

export const NEUTRAL_GAME_THEME: GameTheme = theme("🦊", "✦  ·  ✦", "Let's play!", "¡Vamos a jugar!", "clay", "block", "tap");

export function themeForGame(gameId: string): GameTheme {
  return GAME_THEMES[gameId] ?? NEUTRAL_GAME_THEME;
}