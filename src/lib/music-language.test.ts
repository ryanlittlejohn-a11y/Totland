import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./native", () => ({ isNativeApp: () => true, apiOrigin: () => "https://totland.app" }));
vi.mock("./audio-unlock", () => ({ onGesture: vi.fn(), onUnlock: vi.fn() }));
vi.mock("./crash-report", () => ({ reportIssue: vi.fn() }));

class FakeAudio {
  static latest: FakeAudio;
  paused = true;
  volume = 0;
  loop = false;
  preload = "";
  constructor(public src: string) { FakeAudio.latest = this; }
  addEventListener() {}
  load() {}
  pause() { this.paused = true; }
  async play() { this.paused = false; }
}

beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal("window", {});
  vi.stubGlobal("Audio", FakeAudio);
});

describe("language-matched home music", () => {
  it("keeps distinct English and Spanish sources, including offline copies", async () => {
    const { menuTrackFor } = await import("./music-track");
    expect(menuTrackFor("en").local).toBe("/music/little-steps-big-dreams.mp3");
    expect(menuTrackFor("es").local).toBe("/music/little-steps-big-dreams-es.mp3");
    expect(menuTrackFor("es").remote).toContain("/little-steps-big-dreams-es.mp3");
    expect(menuTrackFor("es").remote).not.toBe(menuTrackFor("en").remote);
  });

  it("switches an already playing home song immediately, in both directions", async () => {
    const music = await import("./music");
    music.startMusic();
    const el = FakeAudio.latest;
    expect(el.src).toBe("/music/little-steps-big-dreams.mp3");
    music.setMusicLanguage("es");
    expect(el.src).toBe("/music/little-steps-big-dreams-es.mp3");
    expect(el.paused).toBe(false);
    music.setMusicLanguage("en");
    expect(el.src).toBe("/music/little-steps-big-dreams.mp3");
    music.stopMusic();
  });

  it("leaves activities and stories unchanged and does not turn disabled music on", async () => {
    const music = await import("./music");
    music.setMusicRoute("/game/example");
    music.startMusic();
    const el = FakeAudio.latest;
    music.setMusicLanguage("es");
    expect(el.src).toBe("/music/curious-steps.mp3");
    music.setStoryMusic(true);
    music.setMusicLanguage("en");
    expect(el.src).toBe("/music/forest-of-wonder.mp3");
    music.setStoryMusic(false);
    music.setMusicRoute("/");
    music.stopMusic();
    music.setMusicLanguage("es");
    expect(el.paused).toBe(true);
    music.startMusic();
    expect(el.src).toBe("/music/little-steps-big-dreams-es.mp3");
    music.stopMusic();
  });
});

describe("leaving the parent dashboard", () => {
  for (const [lang, file] of [["en", "little-steps-big-dreams.mp3"], ["es", "little-steps-big-dreams-es.mp3"]] as const) {
    it(`keeps home music playing after the dashboard closes (${lang})`, async () => {
      const music = await import("./music");
      music.setMusicLanguage(lang);
      // On the dashboard: silent.
      music.setMusicRoute("/parent");
      music.setMusic(false);
      // Back home: kid side says "on", then the dashboard finishes closing.
      music.setMusicRoute("/");
      music.setMusic(true);
      const el = FakeAudio.latest;
      await Promise.resolve();
      expect(el.src).toBe(`/music/${file}`);
      expect(el.paused).toBe(false);
      music.stopMusic();
    });
  }

  it("dashboard does not start or preview music", async () => {
    const src = await import("node:fs").then((fs) => fs.readFileSync("src/routes/parent.index.tsx", "utf8"));
    expect(src).not.toMatch(/previewMusic|startMusic|setMusic\(/);
  });

  it("volume set on the dashboard applies when the kid side plays", async () => {
    const music = await import("./music");
    music.setMusicVolume(1);
    music.setMusic(true);
    expect(FakeAudio.latest.volume).toBeCloseTo(0.25);
    music.setMusicVolume(0.5);
    expect(FakeAudio.latest.volume).toBeLessThanOrEqual(0.25);
    music.stopMusic();
  });
});