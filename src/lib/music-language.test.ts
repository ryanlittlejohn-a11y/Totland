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