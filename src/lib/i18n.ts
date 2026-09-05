/**
 * Bilingual layer (English / Spanish).
 *
 * The whole app is authored in English; this module translates every
 * child-facing string at display time so no game logic has to change.
 * Language is stored on the local profile and never leaves the device.
 */

export type Lang = "en" | "es";

let current: Lang = "en";

export function getLang(): Lang {
  return current;
}

export function setLang(l: Lang) {
  current = l === "es" ? "es" : "en";
}

/** Inline pick — `L("Play", "Jugar")`. */
export function L(en: string, es: string): string {
  return current === "es" ? es : en;
}

/* ---------------------------------------------------------------- nouns */

const NOUNS: Record<string, string> = {
  // first words
  apple: "manzana", ant: "hormiga", avocado: "aguacate", airplane: "avión", acorn: "bellota",
  ball: "pelota", bear: "oso", banana: "plátano", bus: "autobús", bee: "abeja", boat: "barco",
  cat: "gato", cake: "pastel", car: "coche", cow: "vaca", cloud: "nube", carrot: "zanahoria",
  dog: "perro", duck: "pato", drum: "tambor", donut: "dona", dinosaur: "dinosaurio",
  egg: "huevo", elephant: "elefante", eye: "ojo",
  fox: "zorro", fish: "pez", frog: "rana", flower: "flor", fire: "fuego",
  goat: "cabra", grapes: "uvas", gift: "regalo", guitar: "guitarra",
  hat: "sombrero", horse: "caballo", house: "casa", honey: "miel",
  "ice cream": "helado", igloo: "iglú", insect: "insecto",
  jam: "mermelada", jellyfish: "medusa", juice: "jugo",
  kite: "cometa", key: "llave", koala: "koala",
  lion: "león", leaf: "hoja", lemon: "limón", ladybug: "mariquita",
  moon: "luna", mouse: "ratón", milk: "leche", monkey: "mono",
  nest: "nido", nose: "nariz", night: "noche",
  owl: "búho", orange: "naranja", octopus: "pulpo",
  pig: "cerdo", pear: "pera", panda: "panda", pizza: "pizza", penguin: "pingüino",
  queen: "reina", quilt: "colcha",
  rabbit: "conejo", rainbow: "arcoíris", robot: "robot", rocket: "cohete",
  sun: "sol", star: "estrella", snake: "serpiente", strawberry: "fresa", socks: "calcetines",
  tree: "árbol", tiger: "tigre", train: "tren", turtle: "tortuga",
  umbrella: "paraguas", unicorn: "unicornio",
  van: "furgoneta", violin: "violín",
  whale: "ballena", watermelon: "sandía", wagon: "camioneta",
  xylophone: "xilófono",
  yarn: "lana", "yo-yo": "yoyó",
  zebra: "cebra", zipper: "cremallera",
  // extra labels used by games
  teddy: "osito", spoon: "cuchara", bun: "bollo", truck: "camión", bed: "cama", cup: "taza",
  lamp: "lámpara", door: "puerta", hand: "mano", ear: "oreja", foot: "pie", hair: "pelo",
  shoe: "zapato", shirt: "camisa", coat: "abrigo", glove: "guante", bat: "murciélago",
  net: "red", pie: "tarta",
  // colors
  red: "rojo", blue: "azul", yellow: "amarillo", green: "verde", purple: "morado",
  pink: "rosa", brown: "café",
  // shapes
  circle: "círculo", square: "cuadrado", triangle: "triángulo", heart: "corazón",
  diamond: "rombo",
  // number words
  zero: "cero", one: "uno", two: "dos", three: "tres", four: "cuatro", five: "cinco",
  six: "seis", seven: "siete", eight: "ocho", nine: "nueve", ten: "diez", eleven: "once",
  twelve: "doce", thirteen: "trece", fourteen: "catorce", fifteen: "quince",
  sixteen: "dieciséis", seventeen: "diecisiete", eighteen: "dieciocho",
  nineteen: "diecinueve", twenty: "veinte",
  // category titles
  Animals: "Animales", Food: "Comida", Toys: "Juguetes", "Things that go": "Cosas que se mueven",
  Nature: "Naturaleza", Home: "La casa", "My body": "Mi cuerpo", Clothes: "La ropa",
  animals: "animales", food: "comida", toys: "juguetes", nature: "naturaleza",
  "my body": "mi cuerpo", clothes: "la ropa", "things that go": "cosas que se mueven",
};

/** Translate a single content noun/label; unknown values pass through. */
export function noun(value: string): string {
  if (current === "en") return value;
  return NOUNS[value] ?? NOUNS[value.toLowerCase()] ?? value;
}

/* ------------------------------------------------- sentence translation */

/** `{}` marks a value that is copied over (and noun-translated). */
const SENTENCES: [string, string][] = [
  // prompts
  ["Can you find the letter {}?", "¿Puedes encontrar la letra {}?"],
  ["Can you find the number {}?", "¿Puedes encontrar el número {}?"],
  ["Which one is the little {}?", "¿Cuál es la {} pequeña?"],
  ["Which one is the big {}?", "¿Cuál es la {} grande?"],
  ["Whose shadow is this?  ▐ {} ▌", "¿De quién es esta sombra?  ▐ {} ▌"],
  ["{} — which letter is missing?", "{} — ¿qué letra falta?"],
  ["Which piece finishes this letter?", "¿Qué pieza completa esta letra?"],
  ["Which piece finishes this number?", "¿Qué pieza completa este número?"],
  ["Which one starts with {}?", "¿Cuál empieza con {}?"],
  ["{}  Which letter makes that first sound?", "{}  ¿Qué letra hace ese primer sonido?"],
  ["{} {} — which one has the same first sound?", "{} {} — ¿cuál tiene el mismo primer sonido?"],
  ["{} {} — which word rhymes?", "{} {} — ¿qué palabra rima?"],
  ["{}  Which word says it?", "{}  ¿Qué palabra lo dice?"],
  ["Which picture is the {}?", "¿Cuál imagen es: {}?"],
  ["{}  {} — which piece fits?", "{}  {} — ¿qué pieza encaja?"],
  ["How many do you see?", "¿Cuántos ves?"],
  ["Show me {} — tap the right group", "Muéstrame {} — toca el grupo correcto"],
  ["Which group has more?", "¿Qué grupo tiene más?"],
  ["Which number is bigger?", "¿Qué número es mayor?"],
  ["Tap the {} one!", "¡Toca el que es {}!"],
  ["{}  Which one is the same colour?", "{}  ¿Cuál es del mismo color?"],
  ["Put the {} thing in the {} basket", "Pon la cosa {} en la cesta {}"],
  ["Where is the {}?", "¿Dónde está: {}?"],
  ["Which shape fits the shadow?", "¿Qué figura encaja en la sombra?"],
  ["Find the other {}", "Encuentra el otro: {}"],
  ["Which one goes in the {} box?", "¿Cuál va en la caja: {}?"],
  ["Something is missing — which shape completes it?", "Falta algo — ¿qué figura lo completa?"],
  ["{} … what comes next?", "{} … ¿qué sigue?"],
  ["Which one is different?", "¿Cuál es diferente?"],
  ["{}, {}, {}, …", "{}, {}, {}, …"],
  ["Which one belongs with: {}?", "¿Cuál va con: {}?"],
  ["Which one is BIG?", "¿Cuál es GRANDE?"],
  ["Which one is small?", "¿Cuál es pequeño?"],
  ["Which one is long?", "¿Cuál es largo?"],
  ["Which one is short?", "¿Cuál es corto?"],
  ["🧩 Which piece completes the {} picture?", "🧩 ¿Qué pieza completa la imagen: {}?"],
  ["Which piece is missing from the picture?", "¿Qué pieza le falta a la imagen?"],
  ["Find the hidden {} in the grid", "Encuentra la {} escondida en la cuadrícula"],
  ["{}, ___, {}", "{}, ___, {}"],
  ["{}  {}", "{}  {}"],
  // spoken
  ["Can you tap the color {}?", "¿Puedes tocar el color {}?"],
  ["Can you tap the colour {}?", "¿Puedes tocar el color {}?"],
  ["How many do you see? Count them with me.", "¿Cuántos ves? Cuéntalos conmigo."],
  ["Which one starts with the sound {}?", "¿Cuál empieza con el sonido {}?"],
  ["Find the small letter {}.", "Encuentra la letra pequeña {}."],
  ["Find the capital letter {}.", "Encuentra la letra mayúscula {}."],
  ["Find the {}.", "Encuentra: {}."],
  ["Find the colour that matches.", "Encuentra el color que combina."],
  ["Look carefully. Find the letter {}.", "Mira con cuidado. Encuentra la letra {}."],
  ["Which group has {}?", "¿Qué grupo tiene {}?"],
  ["Which letter finishes the word {}?", "¿Qué letra completa la palabra {}?"],
  ["Which letter fits this shadow?", "¿Qué letra encaja en esta sombra?"],
  ["Which one belongs in the {} basket?", "¿Cuál va en la cesta {}?"],
  ["Which one belongs with {}?", "¿Cuál va con {}?"],
  ["Which piece completes the {}?", "¿Qué pieza completa: {}?"],
  ["Which piece is missing?", "¿Qué pieza falta?"],
  ["Which piece finishes the letter {}?", "¿Qué pieza completa la letra {}?"],
  ["Which piece finishes the number {}?", "¿Qué pieza completa el número {}?"],
  ["Which shape goes in the {} box?", "¿Qué figura va en la caja: {}?"],
  ["Which shape is missing?", "¿Qué figura falta?"],
  ["Which shape comes next in the pattern?", "¿Qué figura sigue en el patrón?"],
  ["Which word rhymes with {}?", "¿Qué palabra rima con {}?"],
  ["Which word says {}?", "¿Qué palabra dice {}?"],
  ["Which word starts like {}?", "¿Qué palabra empieza como {}?"],
  ["Find the shape that matches the {}.", "Encuentra la figura que combina con: {}."],
  ["{}. Which letter starts {}?", "{}. ¿Qué letra empieza {}?"],
  ["{}, what comes next, {}?", "{}, ¿qué sigue?, {}"],
  ["{}, {}, {}. What comes next?", "{}, {}, {}. ¿Qué sigue?"],
  ["Which one is big?", "¿Cuál es grande?"],
  // hints
  ["{} looks like this. Tap the {}.", "La {} se ve así. Toca la {}."],
  ["Big {} and little {} are the same letter.", "La {} grande y la {} pequeña son la misma letra."],
  ["The shadow has the same shape as {}.", "La sombra tiene la misma forma que {}."],
  ["Sing the alphabet from {}.", "Canta el abecedario desde la {}."],
  ["The letter is {}.", "La letra es {}."],
  ["The number is {}.", "El número es {}."],
  ["{} says {}. Listen: {}.", "La {} suena {}. Escucha: {}."],
  ["It starts with {}.", "Empieza con {}."],
  ["Both start with {}.", "Las dos empiezan con {}."],
  ["Listen: {} starts with {}.", "Escucha: {} empieza con {}."],
  ["{}… {}. They sound the same at the end.", "{}… {}. Suenan igual al final."],
  ["{} — {}.", "{} — {}."],
  ["The word is {}.", "La palabra es {}."],
  ["Look for the {}.", "Busca: {}."],
  ["Look for the letter {}.", "Busca la letra {}."],
  ["Look slowly, row by row, for {}.", "Busca despacio, fila por fila, la {}."],
  ["Point and count: {}.", "Señala y cuenta: {}."],
  ["{} looks like {}.", "{} se parece a {}."],
  ["A {} looks like {}.", "Un {} se ve así: {}."],
  ["It is {}.", "Es {}."],
  ["Look for something {}.", "Busca algo de color {}."],
  ["Look at the empty space — it is a {}.", "Mira el espacio vacío — es un {}."],
  ["The pattern goes {}, {}, {}, {}…", "El patrón es {}, {}, {}, {}…"],
  ["Most of them look the same — find the one that does not.", "Casi todos se ven iguales — encuentra el que no."],
  ["Count both groups and compare.", "Cuenta los dos grupos y compara."],
  ["Count each group slowly.", "Cuenta cada grupo despacio."],
  ["The bigger number comes later when you count.", "El número mayor viene después al contar."],
  ["Count up from {}.", "Cuenta a partir de {}."],
  ["Keep counting after {}.", "Sigue contando después de {}."],
  ["Think about {}.", "Piensa en {}."],
  ["A big thing takes up lots of space.", "Algo grande ocupa mucho espacio."],
  ["A small thing fits in your hand.", "Algo pequeño cabe en tu mano."],
  ["Look at how far each one stretches.", "Mira hasta dónde llega cada uno."],
  ["The picture is a {}.", "La imagen es: {}."],
  // reveals
  ["{} is for {}! {}", "¡{} es de {}! {}"],
  ["{} is for {}!", "¡{} es de {}!"],
  ["That's {}!", "¡Es {}!"],
  ["{} and {} — a pair!", "¡{} y {} — una pareja!"],
  ["It was {}!", "¡Era {}!"],
  ["You built {}!", "¡Construiste {}!"],
  ["You found {}!", "¡Encontraste {}!"],
  ["{} starts with {}!", "¡{} empieza con {}!"],
  ["{} and {} both start with {}!", "¡{} y {} empiezan con {}!"],
  ["{} and {} rhyme!", "¡{} y {} riman!"],
  ["{}! There are {} {}.", "¡{}! Hay {} {}."],
  ["{}! There are {}.", "¡{}! Hay {}."],
  ["{} — exactly right!", "¡{} — exactamente!"],
  ["{}, {}, {}!", "¡{}, {}, {}!"],
  ["{} is more than {}.", "{} es más que {}."],
  ["{} is bigger!", "¡{} es mayor!"],
  ["{} comes next!", "¡Sigue {}!"],
  ["A {} comes next!", "¡Sigue: {}!"],
  ["{} is {}!", "¡{} es {}!"],
  ["Both are {}!", "¡Los dos son {}!"],
  ["The {} fits!", "¡{} encaja!"],
  ["Yes — a {}!", "¡Sí — {}!"],
  ["The {} was different!", "¡{} era diferente!"],
  ["The {} is complete! {}", "¡La imagen de {} está completa! {}"],
  ["{} belongs with {}!", "¡{} va con {}!"],
  ["A {} is big!", "¡{} es grande!"],
  ["An {} is small!", "¡{} es pequeño!"],
  ["That one is long!", "¡Ese es largo!"],
  ["That one is short!", "¡Ese es corto!"],
  ["{} {}", "{} {}"],
];

interface Compiled {
  re: RegExp;
  es: string;
}

let compiled: Compiled[] | null = null;

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function compile(): Compiled[] {
  if (compiled) return compiled;
  compiled = SENTENCES.map(([en, es]) => ({
    re: new RegExp("^" + escapeRe(en).split("\\{\\}").join("(.+?)") + "$"),
    es,
  }));
  // longer templates first so specific patterns win over `{} {}`
  compiled.sort((a, b) => b.re.source.length - a.re.source.length);
  return compiled;
}

/** Translate one authored sentence; unknown sentences stay in English. */
export function sentence(text: string): string {
  if (current === "en" || !text) return text;
  for (const { re, es } of compile()) {
    const m = text.match(re);
    if (!m) continue;
    let i = 1;
    return es.replace(/\{\}/g, () => noun((m[i++] ?? "").trim()));
  }
  return text;
}

/* ------------------------------------------------------------ app titles */

const TITLES: Record<string, string> = {
  // learning areas
  "ABC & Phonics": "ABC y sonidos", "Find, pop and learn letters": "Busca, explota y aprende letras",
  "Numbers 1–20": "Números 1–20", "Count, match and compare": "Cuenta, empareja y compara",
  Colors: "Colores", "Color quest and sorting": "Busca y clasifica colores",
  Shapes: "Figuras", "Build with shapes": "Construye con figuras",
  "First Words": "Primeras palabras", "200+ picture words": "Más de 200 palabras con imagen",
  "Beginning Sounds": "Sonidos iniciales", "Hear the first sound": "Escucha el primer sonido",
  "Matching & Memory": "Parejas y memoria", "Flip and match pairs": "Voltea y forma parejas",
  Puzzles: "Rompecabezas", "Slide the pieces home": "Coloca las piezas",
  "Letter Tracing": "Trazar letras", "Trace big and small letters": "Traza letras grandes y pequeñas",
  "Flash Cards": "Tarjetas", "Tap to hear the word": "Toca para oír la palabra",
  "Word Search": "Sopa de letras", "Tiny, gentle grids": "Cuadrículas pequeñas y tranquilas",
  Storybooks: "Cuentos", "Read along together": "Lean juntos",
  // worlds
  "Alphabet Forest": "Bosque del abecedario", "Letters & sounds": "Letras y sonidos",
  "Number Valley": "Valle de los números", "Counting & numbers": "Contar y números",
  "Color Cove": "Bahía de colores", "Colors & shapes": "Colores y figuras",
  "Puzzle Park": "Parque de rompecabezas", "Memory & logic": "Memoria y lógica",
  "Storybook Village": "Villa de los cuentos", "Words & reading": "Palabras y lectura",
  // age modes
  Explorer: "Explorador", Learner: "Aprendiz", Reader: "Lector",
  "about 2–3": "de 2 a 3 años", "about 3–4": "de 3 a 4 años", "about 4–6": "de 4 a 6 años",
  "Colors, shapes, sounds, tapping": "Colores, figuras, sonidos y toques",
  "Alphabet, counting, first words": "Abecedario, contar y primeras palabras",
  "Phonics, spelling, reading": "Sonidos, deletreo y lectura",
  // games
  "Letter Pop": "Explota la letra", "Alphabet Safari": "Safari del abecedario",
  "Feed the Letter Monster": "Alimenta al monstruo de letras", "Letter Bubbles": "Burbujas de letras",
  "Alphabet Train": "Tren del abecedario", "Letter Fishing": "Pesca de letras",
  "Letter Rocket": "Cohete de letras", "Letter Garden": "Jardín de letras",
  "Missing Letter": "La letra que falta", "Alphabet Bridge": "Puente del abecedario",
  "Uppercase Match": "Parejas de mayúsculas", "Upper to Lowercase": "De mayúscula a minúscula",
  "Lower to Uppercase": "De minúscula a mayúscula", "Letter Shadow": "Sombra de letras",
  "Letter Maze": "Laberinto de letras", "Letter Detective": "Detective de letras",
  "Letter Rain": "Lluvia de letras", "Letter Memory": "Memoria de letras",
  "Letter Puzzle": "Rompecabezas de letras", "Alphabet Race": "Carrera del abecedario",
  "What Starts With B?": "¿Qué empieza con B?", "Sound Match": "Empareja el sonido",
  "Beginning Sound Train": "Tren de sonidos iniciales", "Sound Detective": "Detective de sonidos",
  "Word Builder": "Constructor de palabras", "Picture Word Match": "Imagen y palabra",
  "Word Puzzle": "Rompecabezas de palabras", "Missing Letter Word": "Palabra con letra faltante",
  "Word Fishing": "Pesca de palabras", "Word Rocket": "Cohete de palabras",
  "Rhyming Pairs": "Parejas que riman", "Same Sound": "El mismo sonido",
  "Word Memory": "Memoria de palabras", "Word Train": "Tren de palabras",
  "First Word Builder": "Mis primeras palabras", "Count the Animals": "Cuenta los animales",
  "Number Pop": "Explota el número", "Number Bubbles": "Burbujas de números",
  "Number Fishing": "Pesca de números", "Number Train": "Tren de números",
  "Number Match": "Empareja el número", "Count the Stars": "Cuenta las estrellas",
  "Number Monster": "Monstruo de números", "Number Garden": "Jardín de números",
  "Number Rocket": "Cohete de números", "Missing Number": "El número que falta",
  "Number Maze": "Laberinto de números", "More or Less": "Más o menos",
  "Bigger Number": "El número mayor", "Number Memory": "Memoria de números",
  "Counting Train": "Tren para contar", "Number Puzzle": "Rompecabezas de números",
  "Count the Fruit": "Cuenta la fruta", "Number Hunt": "Búsqueda de números",
  "Number Rain": "Lluvia de números", "Color Pop": "Explota el color",
  "Color Match": "Empareja el color", "Rainbow Sort": "Clasifica el arcoíris",
  "Color Detective": "Detective de colores", "Color Memory": "Memoria de colores",
  "Shape Pop": "Explota la figura", "Shape Match": "Empareja la figura",
  "Shape Builder": "Constructor de figuras", "Shape Sort": "Clasifica figuras",
  "Shape Shadow": "Sombra de figuras", "Shape Memory": "Memoria de figuras",
  "Shape Hunt": "Búsqueda de figuras", "Shape Puzzle": "Rompecabezas de figuras",
  "Shape Train": "Tren de figuras", "What's Missing?": "¿Qué falta?",
  "Animal Memory": "Memoria de animales", "Letter Memory Park": "Parque de memoria: letras",
  "Number Memory Park": "Parque de memoria: números", "Picture Memory": "Memoria de imágenes",
  "Picture to Word": "De imagen a palabra", "What's Different?": "¿Cuál es diferente?",
  "Which Comes Next?": "¿Qué sigue?", "Sort the Toys": "Clasifica los juguetes",
  "Big or Small": "Grande o pequeño", "Long or Short": "Largo o corto",
  "Simple Jigsaw": "Rompecabezas sencillo", "Animal Jigsaw": "Rompecabezas de animales",
  "Alphabet Jigsaw": "Rompecabezas del abecedario", "Number Jigsaw": "Rompecabezas numérico",
  "Picture Puzzle": "Rompecabezas de imagen", "Word Search: Letters": "Sopa de letras: letras",
  "Word Search: Animals": "Sopa de letras: animales", "Word Search: Colors": "Sopa de letras: colores",
  "Word Search: Numbers": "Sopa de letras: números", "Word Search: Food": "Sopa de letras: comida",
  "Hidden Objects": "Objetos escondidos", "Picture Path": "Camino de imágenes",
  "Match the Shadows": "Empareja las sombras", "Complete the Picture": "Completa la imagen",
  "Pattern Builder": "Crea el patrón", "Number Tracing": "Trazar números",
  "Story Builder": "Crea un cuento", "Read With Me": "Lee conmigo",
  "Daily Adventure": "Aventura del día",
  // game objectives
  "Recognise uppercase letters": "Reconocer letras mayúsculas",
  "Spot letters in a busy scene": "Encontrar letras en una escena",
  "Match a spoken letter name": "Emparejar el nombre de una letra",
  "Letter recognition under choice": "Reconocer letras entre opciones",
  "Alphabetical order": "Orden alfabético", "Letter recognition": "Reconocer letras",
  "Sequence letters A to Z": "Ordenar letras de la A a la Z",
  "Complete an alphabet sequence": "Completar una secuencia del abecedario",
  "Build a bridge in order": "Construir un puente en orden",
  "Match identical letters": "Emparejar letras iguales", "Link A to a": "Unir A con a",
  "Link a to A": "Unir a con A", "Match a letter to its silhouette": "Unir la letra con su sombra",
  "Follow one letter through a maze": "Seguir una letra por el laberinto",
  "Find every copy of a letter": "Encontrar todas las copias de una letra",
  "Quick letter recognition": "Reconocer letras rápido",
  "Remember letter pairs": "Recordar parejas de letras", "Assemble a letter": "Armar una letra",
  "Race through the alphabet": "Correr por el abecedario", "Beginning sounds": "Sonidos iniciales",
  "Match sound to letter": "Unir sonido y letra",
  "Sort by beginning sound": "Clasificar por sonido inicial",
  "Identify a beginning sound": "Identificar el sonido inicial",
  "Spell a simple word": "Deletrear una palabra sencilla",
  "Match picture to word": "Unir imagen y palabra",
  "Assemble letters into a word": "Formar una palabra con letras",
  "Complete C_T": "Completar C_T", "Catch the missing letter": "Atrapar la letra que falta",
  "Build a word to launch": "Formar una palabra para despegar",
  "Hear rhyming words": "Escuchar palabras que riman",
  "Same beginning sound": "Mismo sonido inicial", "Match word to picture": "Unir palabra e imagen",
  "Letters in the right order": "Letras en el orden correcto",
  "Very first spelling": "Primer deletreo",
  "Count and choose the number": "Contar y elegir el número",
  "Numeral recognition": "Reconocer números", "Number order": "Orden de los números",
  "Numeral to quantity": "Número y cantidad", Counting: "Contar",
  "Give the right amount": "Dar la cantidad correcta",
  "Plant that many flowers": "Plantar esa cantidad de flores",
  "Complete 1, 2, _, 4": "Completar 1, 2, _, 4",
  "Move through numbers in order": "Avanzar por los números en orden",
  "Compare quantities": "Comparar cantidades", "Compare numerals": "Comparar números",
  "Match numeral pairs": "Emparejar números", "Count the carriages": "Contar los vagones",
  "Assemble a numeral": "Armar un número", "Counting to twenty": "Contar hasta veinte",
  "Find every copy of a number": "Encontrar todas las copias de un número",
  "Catch numbers in order": "Atrapar números en orden",
  "Colour recognition": "Reconocer colores", "Match same colour": "Emparejar el mismo color",
  "Sort by colour": "Clasificar por color",
  "Find every object of a colour": "Encontrar todo de un color",
  "Match colour pairs": "Emparejar colores", "Shape recognition": "Reconocer figuras",
  "Match identical shapes": "Emparejar figuras iguales",
  "Sort shapes into groups": "Clasificar figuras en grupos",
  "Match shape to silhouette": "Unir figura y sombra", "Match shape pairs": "Emparejar figuras",
  "Find shapes in a scene": "Encontrar figuras en una escena",
  "Assemble a picture": "Armar una imagen",
  "Continue a shape pattern": "Continuar un patrón de figuras",
  "Spot the missing shape": "Encontrar la figura que falta",
  "Classic memory pairs": "Parejas de memoria clásicas", "Letter pairs": "Parejas de letras",
  "Number pairs": "Parejas de números", "Picture pairs": "Parejas de imágenes",
  "Word and picture pairs": "Parejas de palabra e imagen", "Odd one out": "El intruso",
  "Complete a sequence": "Completar una secuencia", "Sort by category": "Clasificar por categoría",
  "Compare size": "Comparar tamaños", "Compare length": "Comparar longitudes",
  "Four-piece jigsaw": "Rompecabezas de cuatro piezas",
  "Six-piece jigsaw": "Rompecabezas de seis piezas", "Assemble letters": "Armar letras",
  "Assemble numbers": "Armar números", "Complete an image": "Completar una imagen",
  "Find letters in a grid": "Encontrar letras en la cuadrícula",
  "Find animal words": "Encontrar palabras de animales",
  "Find colour words": "Encontrar palabras de colores",
  "Find number words": "Encontrar palabras de números",
  "Find food words": "Encontrar palabras de comida",
  "Find requested objects": "Encontrar los objetos pedidos",
  "Follow the right sequence": "Seguir la secuencia correcta",
  "Object to shadow": "Objeto y sombra", "Choose the missing piece": "Elegir la pieza que falta",
  "Recreate a pattern": "Repetir un patrón",
  "Trace upper and lowercase letters": "Trazar letras mayúsculas y minúsculas",
  "Trace numbers 1 to 20": "Trazar los números del 1 al 20",
  "Make your own little story": "Crea tu propio cuento",
  "Narrated beginner story": "Cuento narrado para empezar",
  "A personalised session": "Una sesión personalizada",
};

/** Translate an authored app title/blurb/objective. */
export function title(text: string): string {
  if (current === "en" || !text) return text;
  return TITLES[text] ?? sentence(text);
}

/* ------------------------------------------------------- praise & voice */

export const PRAISE_ES = {
  correct: ["¡Muy bien!", "¡Lo lograste!", "¡Maravilloso!", "¡Buen trabajo!", "¡Bravo!", "¡Lo estás logrando!"],
  retry: ["¡Buen intento!", "¡Vamos a intentarlo otra vez!", "Casi — inténtalo una vez más", "¡Ya casi lo tienes!"],
};

export const speechLang = () => (current === "es" ? "es-ES" : "en-US");
