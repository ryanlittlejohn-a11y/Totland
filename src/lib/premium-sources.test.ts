import { beforeEach, describe, expect, it, vi } from "vitest";

async function fresh() {
  vi.resetModules();
  return await import("./profile");
}

describe("Premium unlock combines store and account answers", () => {
  beforeEach(() => vi.resetModules());

  it("store yes + backend no keeps games unlocked", async () => {
    const p = await fresh();
    p.setStorePremium(true);
    p.setAccountPremium(false);
    expect(p.isVerifiedPremium()).toBe(true);
  });

  it("a successful purchase or restore unlocks immediately, no relaunch", async () => {
    const p = await fresh();
    expect(p.isVerifiedPremium()).toBe(false);
    p.setStorePremium(true);
    expect(p.isVerifiedPremium()).toBe(true);
  });

  it("backend can add Premium on its own (website subscriber)", async () => {
    const p = await fresh();
    p.setAccountPremium(true);
    expect(p.isVerifiedPremium()).toBe(true);
  });

  it("sign out with no store entitlement locks games", async () => {
    const p = await fresh();
    p.setAccountPremium(true);
    p.setAccountPremium(false);
    p.setStorePremium(false);
    expect(p.isVerifiedPremium()).toBe(false);
  });
});
