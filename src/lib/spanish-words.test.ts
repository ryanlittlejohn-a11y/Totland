import { describe, expect, it, beforeEach, afterAll } from "vitest";
import { WORDS, WORDS_ES, LETTERS_ES, CVC_WORDS_ES } from "./content";
import { setLang, noun } from "./i18n";
import { roundForKind } from "./rounds";
import { generateRound } from "./games";

const first = (w: string) => w.normalize("NFD").replace(/[\u0300-\u036f]/g, "").charAt(0).toUpperCase();

describe("Spanish word bank", () => {
  beforeEach(() => setLang("es"));
  afterAll(() => setLang("en"));

  it("every Spanish word starts with its assigned letter", () => {
    for (const w of WORDS_ES) expect(first(w.word), w.word).toBe(w.letter);
  });

  it("uses the 27-letter alphabet with Ñ between N and O", () => {
    expect(LETTERS_ES).toHaveLength(27);
    expect(LETTERS_ES.slice(13, 16)).toEqual(["N", "Ñ", "O"]);
  });

  it("Spanish words are never re-translated as English nouns", () => {
    for (const w of [...WORDS_ES, ...CVC_WORDS_ES]) expect(noun(w.word), w.word).toBe(w.word);
  });

  it("asks no first-sound questions for H, Ñ or X", () => {
    for (let i = 0; i < 3000; i++) {
      for (const kind of ["startsWith", "letterSound", "sameSound"]) {
        const r = roundForKind(kind, 5);
        const text = `${r.spoken} ${r.hint} ${r.reveal}`;
        expect(text, text).not.toMatch(/\b(H|Ñ|X)\b/);
      }
      const p = generateRound("phonics", 5);
      expect(p.answerId).not.toMatch(/^[hHxX]/);
    }
  });

  it("spelling tiles match the spoken Spanish word", () => {
    for (let i = 0; i < 200; i++) {
      const r = roundForKind("missingLetterWord", 3);
      const word = r.spoken.match(/palabra (\S+?)\?/)?.[1] ?? "";
      expect(CVC_WORDS_ES.map((w) => w.word)).toContain(word);
    }
  });
});

describe("English word bank", () => {
  it("is unchanged: 93 words, letter from the English spelling", () => {
    expect(WORDS).toHaveLength(93);
    expect(WORDS[0]).toEqual({ word: "apple", emoji: "🍎", letter: "A" });
    for (const w of WORDS) expect(w.word.charAt(0).toUpperCase()).toBe(w.letter);
  });
});
