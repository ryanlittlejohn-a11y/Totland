import { beforeEach, describe, expect, it, vi } from "vitest";

const store = new Map<string, string>();
(globalThis as Record<string, unknown>)["window"] = Object.assign(new EventTarget(), {
  localStorage: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  },
  setTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms) as unknown as number,
});

const { loadFamily, loadProfile, mergeSyncedFamily, saveFamily, saveProfile, defaultProfile, updateStoredProfile } =
  await import("./profile");
const calm = await import("./calm");

beforeEach(() => {
  store.clear();
  saveProfile(defaultProfile());
  calm.setCalmActive(false);
  calm.clearPendingAdvance();
});

describe("Calm mode setting", () => {
  it("is off by default and an old saved profile without the field loads as off", () => {
    const f = loadFamily();
    const child = f.children[0]!;
    const old = { ...child.profile } as Record<string, unknown>;
    delete old.calmMode;
    saveFamily({ ...f, children: [{ ...child, profile: old as never }] });
    expect(calm.isCalm(loadProfile())).toBe(false);
  });

  it("is per child: it is not a family-wide setting", () => {
    updateStoredProfile((p) => ({ ...p, calmMode: true }));
    const f = loadFamily();
    expect((f.settings as Record<string, unknown>).calmMode).toBeUndefined();
    expect(f.children[0]!.profile.calmMode).toBe(true);
  });

  it("a saved 'on' survives a sync merge", () => {
    updateStoredProfile((p) => ({ ...p, calmMode: true }));
    const snapshot = loadFamily();
    const synced = { ...snapshot, children: snapshot.children.map((c) => ({ ...c, dirty: false })) };
    saveFamily(mergeSyncedFamily(snapshot, synced, loadFamily()));
    expect(loadProfile().calmMode).toBe(true);
  });

  it("layers on top of family settings without changing them", () => {
    updateStoredProfile((p) => ({ ...p, calmMode: true, music: true, reducedMotion: false }));
    const p = loadProfile();
    expect(calm.motionReduced(p)).toBe(true);
    expect(calm.musicAllowed(p)).toBe(false);
    // The family's own settings are untouched.
    expect(p.music).toBe(true);
    expect(p.reducedMotion).toBe(false);
    expect(calm.musicAllowed({ ...p, calmMode: false })).toBe(true);
  });
});

describe("Calm sounds", () => {
  it("normal mode plays the usual chimes", () => {
    expect(calm.calmSound("reward", false)).toBe("normal");
  });
  it("calm plays one quiet tone for correct and reward, and nothing for a wrong answer", () => {
    expect(calm.calmSound("correct", true)).toBe(calm.CALM_TONE);
    expect(calm.calmSound("reward", true)).toBe(calm.CALM_TONE);
    expect(calm.calmSound("retry", true)).toBeNull();
    expect(calm.CALM_TONE.gain).toBeLessThan(0.05);
  });
});

describe("Calm never auto-advances", () => {
  it("normal mode moves on by itself after the delay", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    calm.advanceAfter(fn, 900);
    expect(calm.hasPendingAdvance()).toBe(false);
    vi.advanceTimersByTime(900);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("calm waits for Next however long it takes, then runs the step exactly once", () => {
    vi.useFakeTimers();
    calm.setCalmActive(true);
    const fn = vi.fn();
    calm.advanceAfter(fn, 900);
    vi.advanceTimersByTime(60_000);
    expect(fn).not.toHaveBeenCalled();
    expect(calm.hasPendingAdvance()).toBe(true);
    expect(calm.runPendingAdvance()).toBe(true);
    expect(calm.runPendingAdvance()).toBe(false); // a double tap does nothing
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("a finish step guarded by a ref still completes once in calm", () => {
    calm.setCalmActive(true);
    const done = { current: false };
    const onFinish = vi.fn();
    const finish = () => {
      if (done.current) return;
      done.current = true;
      onFinish();
    };
    calm.advanceAfter(finish, 1600);
    calm.runPendingAdvance();
    calm.advanceAfter(finish, 1600);
    calm.runPendingAdvance();
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it("leaving the screen drops the parked step", () => {
    calm.setCalmActive(true);
    const fn = vi.fn();
    calm.advanceAfter(fn, 900);
    calm.clearPendingAdvance();
    expect(calm.runPendingAdvance()).toBe(false);
    expect(fn).not.toHaveBeenCalled();
  });

  it("turning calm off mid-step lets play continue", () => {
    calm.setCalmActive(true);
    const fn = vi.fn();
    calm.advanceAfter(fn, 900);
    calm.setCalmActive(false);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe("Calm Adventure", () => {
  it("uses a fixed order and names each next step", () => {
    expect([...calm.CALM_ADVENTURE_ORDER]).toEqual(["letters", "numbers", "words", "puzzles", "colors"]);
    expect(calm.calmAdventureStep(calm.CALM_ADVENTURE_ORDER, 1).en).toBe("Numbers");
    expect(calm.calmAdventureStep(calm.CALM_ADVENTURE_ORDER, 5).en).toBe("Picture cards");
  });
});
