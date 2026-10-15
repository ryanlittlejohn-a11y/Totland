import { GAMES, AGE_MODES } from "@/lib/catalog";
import { L } from "@/lib/i18n";

/**
 * Plain grown-up explanation shown under each skill page's game list.
 * Text only — no links — so it is safe on the child side of the native app.
 * Game, free and age figures are computed from the catalog so they never drift.
 */
const ABOUT: Record<string, { en: string[]; es: string[] }> = {
  letters: {
    en: [
      "Your child meets all 26 letters by finding, popping, sorting and catching them. Every letter name is spoken aloud, so even children who can't read yet can play on their own.",
      "Older children move on to matching capital and lowercase letters, finding the missing letter, and putting the alphabet in order.",
    ],
    es: [
      "Tu peque conoce las letras buscándolas, explotándolas, ordenándolas y atrapándolas. Cada letra se dice en voz alta, así que puede jugar sin saber leer.",
      "Los mayores pasan a unir mayúsculas y minúsculas, encontrar la letra que falta y ordenar el abecedario.",
    ],
  },
  numbers: {
    en: [
      "Counting starts with things your child can see: animals, stars, fruit and train carriages. Each number is spoken aloud as they tap.",
      "As they grow, the games move on to recognizing numerals up to 20, finding the missing number, and deciding which number is bigger.",
    ],
    es: [
      "Contar empieza con cosas que se ven: animales, estrellas, frutas y vagones. Cada número se dice en voz alta al tocarlo.",
      "Después, los juegos pasan a reconocer números hasta el 20, encontrar el que falta y decidir cuál es mayor.",
    ],
  },
  colors: {
    en: [
      "Simple, bright games for learning color names: pop the right balloon, sort a rainbow, match paint pots and feed a hungry monster.",
      "The answers are shown as real colors, not written words, so the youngest players can join in from the start.",
    ],
    es: [
      "Juegos sencillos y alegres para aprender los colores: explotar el globo correcto, ordenar un arcoíris, unir botes de pintura y alimentar a un monstruo.",
      "Las respuestas se muestran como colores de verdad, no como palabras, para que los más pequeños puedan jugar desde el principio.",
    ],
  },
  shapes: {
    en: [
      "Your child learns circles, squares, triangles, stars and more by matching, sorting, building and spotting shapes in a scene.",
      "Pattern games add an early step toward math: noticing what comes next.",
    ],
    es: [
      "Tu peque aprende círculos, cuadrados, triángulos, estrellas y más uniendo, ordenando, construyendo y buscando figuras.",
      "Los juegos de patrones añaden un primer paso hacia las matemáticas: ver qué viene después.",
    ],
  },
  words: {
    en: [
      "First words are paired with pictures, so your child links a word to something they already know.",
      "Older children build short words letter by letter, fill in a missing letter and hear words that rhyme.",
    ],
    es: [
      "Las primeras palabras van con dibujos, para unir la palabra con algo que ya conoce.",
      "Los mayores forman palabras cortas letra a letra, completan la letra que falta y escuchan palabras que riman.",
    ],
  },
  phonics: {
    en: [
      "Beginning sounds are the first step toward reading. Your child hears a sound, then picks the picture that starts with it.",
      "Everything is spoken, so listening comes before reading.",
    ],
    es: [
      "Los sonidos iniciales son el primer paso para leer. Tu peque escucha un sonido y elige el dibujo que empieza así.",
      "Todo se dice en voz alta: primero escuchar, después leer.",
    ],
  },
  memory: {
    en: [
      "Flip-and-match games build memory and focus using letters, numbers, colors, shapes, animals and pictures.",
      "Rounds are short, so even small children can finish a game and feel proud of it.",
    ],
    es: [
      "Los juegos de voltear y emparejar entrenan la memoria y la atención con letras, números, colores, figuras, animales y dibujos.",
      "Las rondas son cortas, así que hasta los más pequeños terminan el juego con orgullo.",
    ],
  },
  puzzles: {
    en: [
      "Jigsaws, shadow matching, spot-the-difference and what-comes-next games for early problem solving.",
      "Children also practice comparing sizes and lengths and sorting toys into groups.",
    ],
    es: [
      "Rompecabezas, sombras, encontrar diferencias y qué viene después para empezar a resolver problemas.",
      "También practican comparar tamaños y largos, y ordenar juguetes en grupos.",
    ],
  },
  tracing: {
    en: [
      "Your child traces big letters, numbers and short words with a finger, building the movements they'll use later with a pencil.",
      "Word tracing grows from two-letter words up to five-letter words.",
    ],
    es: [
      "Tu peque repasa con el dedo letras grandes, números y palabras cortas, practicando los trazos que luego hará con el lápiz.",
      "Las palabras van de dos letras hasta cinco.",
    ],
  },
  flashcards: {
    en: ["Picture flash cards: tap a card to hear the word. A calm way to grow vocabulary together."],
    es: ["Tarjetas con dibujos: toca una tarjeta para escuchar la palabra. Una forma tranquila de aprender palabras juntos."],
  },
  wordsearch: {
    en: [
      "Tiny, gentle word-search grids with themes like animals, colors, numbers and food.",
      "A first step into spotting words, with grids small enough for little hands.",
    ],
    es: [
      "Sopas de letras pequeñas y tranquilas con temas como animales, colores, números y comida.",
      "Un primer paso para encontrar palabras, con cuadrículas a la medida de manos pequeñas.",
    ],
  },
  stories: {
    en: [
      "Read-along storybooks with narration, in English and Spanish, to enjoy together or listen to alone.",
      "Older children can also make their own little story in Story Builder.",
    ],
    es: [
      "Cuentos con narración, en inglés y español, para leer juntos o escuchar a solas.",
      "Los mayores también pueden crear su propio cuento en Crea un cuento.",
    ],
  },
};

export function AreaAbout({ area, title }: { area: string; title: string }) {
  const copy = ABOUT[area];
  if (!copy) return null;
  const games = GAMES.filter((g) => g.skill === area);
  const free = games.filter((g) => !g.premium).length;
  const modes = AGE_MODES.filter((m) => games.some((g) => g.ageModes.includes(m.id)));
  const ageText = modes.length
    ? modes.map((m) => L(`${m.title} (ages ${m.ages})`, `${m.title} (edad ${m.ages.replace("about", "aprox.")})`)).join(", ")
    : null;

  return (
    <section className="mt-8 rounded-3xl bg-card p-5 wood-block" aria-labelledby="area-about-title">
      <h2 id="area-about-title" className="font-ui text-lg font-bold text-ink">
        {L(`For grown-ups: about ${title}`, `Para adultos: sobre ${title}`)}
      </h2>
      <div className="mt-2 space-y-2 font-ui text-sm leading-relaxed text-inksoft">
        {L(copy.en, copy.es).map((p) => (
          <p key={p}>{p}</p>
        ))}
        {ageText && <p>{L(`Made for: ${ageText}.`, `Pensado para: ${ageText}.`)}</p>}
        {games.length > 0 && (
          <p>
            {L(
              `${free} of these ${games.length} games are free to play, with no ads and no sign-in needed. The rest come with Premium.`,
              `${free} de estos ${games.length} juegos son gratis, sin anuncios y sin crear cuenta. El resto se incluye en Premium.`,
            )}
          </p>
        )}
      </div>
    </section>
  );
}
