import { describe, expect, it } from "vitest";
import { alternatePath, ES_ALTERNATES, hreflangLinks, isEsPath } from "./lang-route";
import { forceLang, getLang, L, setLang } from "./i18n";

describe("lang-route", () => {
  it("detects Spanish paths", () => {
    expect(isEsPath("/es")).toBe(true);
    expect(isEsPath("/es/")).toBe(true);
    expect(isEsPath("/es/pricing")).toBe(true);
    expect(isEsPath("/pricing")).toBe(false);
    expect(isEsPath("/espresso")).toBe(false);
  });

  it("maps pages to their other-language twin", () => {
    expect(alternatePath("/")).toBe("/es");
    expect(alternatePath("/es")).toBe("/");
    expect(alternatePath("/pricing")).toBe("/es/pricing");
    expect(alternatePath("/es/free-printables/")).toBe("/free-printables");
    expect(alternatePath("/terms")).toBeNull();
    for (const [en, es] of Object.entries(ES_ALTERNATES)) {
      expect(alternatePath(es)).toBe(en);
    }
  });

  it("emits no hreflang while the Spanish pages are not indexable", () => {
    expect(hreflangLinks("/pricing")).toEqual([]);
  });
});

describe("forceLang", () => {
  it("overrides the profile language without losing it", () => {
    setLang("en");
    forceLang("es");
    expect(getLang()).toBe("es");
    expect(L("Pricing", "Precios")).toBe("Precios");
    setLang("en"); // profile hydrates while on an /es page
    expect(getLang()).toBe("es");
    forceLang(null);
    expect(getLang()).toBe("en");
    setLang("es");
    forceLang("es");
    forceLang(null);
    expect(getLang()).toBe("es");
    setLang("en");
  });
});
