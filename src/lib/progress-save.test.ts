import { beforeEach, describe, expect, it } from "vitest";

const store = new Map<string, string>();
(globalThis as Record<string, unknown>).window = Object.assign(new EventTarget(), {
  localStorage: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  },
});

const {
  loadFamily, loadProfile, mergeSyncedFamily, recordGameComplete, recordSession, recordTracedLetter,
  saveFamily, saveProfile, defaultProfile, updateStoredProfile, wordTracingUnlocked,
} = await import("./profile");

beforeEach(() => {
  store.clear();
  saveProfile(defaultProfile());
});

describe("progress saving", () => {
  it("a game's last letter and the game screen's play both survive one round ending", () => {
    // Game piece and game screen each hold their own (now stale) copy.
    updateStoredProfile((p) => recordTracedLetter(p, "A"));
    updateStoredProfile((p) => recordGameComplete(p, "tracing", 3, 2));
    updateStoredProfile((p) => recordSession(p, "letter-tracing", { stars: 3, accuracy: 1, minutes: 2 }));
    const p = loadProfile();
    expect(p.games["letter-tracing"]?.plays).toBe(1);
    expect(p.tracingProgress?.uppercase).toEqual(["A"]);
    expect(p.gamesCompleted).toBe(1);
  });

  it("10 different big and 10 different small letters open 2-letter words", () => {
    for (const l of "ABCDEFGHIJ") {
      updateStoredProfile((p) => recordTracedLetter(p, l));
      updateStoredProfile((p) => recordTracedLetter(p, l.toLowerCase()));
    }
    expect(wordTracingUnlocked(loadProfile(), 2)).toBe(true);
  });

  it("repeating the same letter does not count toward the 10", () => {
    for (let i = 0; i < 12; i++) {
      updateStoredProfile((p) => recordTracedLetter(p, "A"));
      updateStoredProfile((p) => recordTracedLetter(p, "a"));
    }
    expect(wordTracingUnlocked(loadProfile(), 2)).toBe(false);
  });

  it("a sync finishing mid-play keeps the play made while it waited", () => {
    const snapshot = loadFamily();
    const synced = { ...snapshot, children: snapshot.children.map((c) => ({ ...c, dirty: false })) };
    // Play happens while the sync is waiting on the network.
    updateStoredProfile((p) => recordSession(p, "shape-match", { stars: 3, accuracy: 1, minutes: 1 }));
    saveFamily(mergeSyncedFamily(snapshot, synced, loadFamily()));
    const p = loadProfile();
    expect(p.games["shape-match"]?.plays).toBe(1);
    expect(loadFamily().children[0]?.dirty).toBe(true);
  });
});
