import { describe, expect, it } from "vitest";
import { androidBackAction } from "./native-shell";

describe("Android back button", () => {
  it("goes back a screen during a game", () => {
    expect(androidBackAction("/game/letter-rocket", true)).toBe("back");
  });
  it("leaves the grown-up area (closing the gate) instead of exiting", () => {
    expect(androidBackAction("/parent", true)).toBe("back");
    expect(androidBackAction("/parent", false)).toBe("home");
  });
  it("goes home, not out of the app, when there is no history", () => {
    expect(androidBackAction("/play/letters", false)).toBe("home");
  });
  it("exits only from the home screen", () => {
    expect(androidBackAction("/", true)).toBe("exit");
    expect(androidBackAction("/", false)).toBe("exit");
  });
});
