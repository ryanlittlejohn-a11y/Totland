import { describe, expect, it } from "vitest";
import { defaultProfile, resolveLanguageChosen } from "@/lib/profile";
import { skipsIntro } from "@/components/AppEntrance";

const child = (over: Partial<ReturnType<typeof defaultProfile>> = {}) => ({ profile: { ...defaultProfile(), ...over } });

describe("first-time language popup", () => {
  it("a brand-new family is asked", () => {
    expect(resolveLanguageChosen(undefined, [child()])).toBe(false);
  });
  it("a family already set up is never asked", () => {
    expect(resolveLanguageChosen({ onboarded: true }, [child()])).toBe(true);
    expect(resolveLanguageChosen({}, [child({ onboarded: true })])).toBe(true);
  });
  it("a family with play history is never asked", () => {
    expect(resolveLanguageChosen({}, [child({ gamesCompleted: 3 })])).toBe(true);
    expect(resolveLanguageChosen({}, [child({ stars: 1 })])).toBe(true);
  });
  it("a family already in Spanish is never asked", () => {
    expect(resolveLanguageChosen({ language: "es" }, [child()])).toBe(true);
  });
  it("once picked, the choice is remembered", () => {
    expect(resolveLanguageChosen({ languageChosen: true }, [child()])).toBe(true);
  });
  it("grown-up and legal pages skip the intro and popup", () => {
    expect(skipsIntro("/parent/subscription")).toBe(true);
    expect(skipsIntro("/terms")).toBe(true);
    expect(skipsIntro("/")).toBe(false);
  });
});
