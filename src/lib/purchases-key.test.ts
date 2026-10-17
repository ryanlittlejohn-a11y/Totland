import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadEnv } from "vite";

const bridge = vi.hoisted(() => ({
  platform: "android",
  configure: vi.fn(),
}));

vi.mock("./native", () => ({
  nativePlatform: () => bridge.platform,
  isNativeApp: () => bridge.platform !== "web",
}));
vi.mock("@revenuecat/purchases-capacitor", () => ({
  Purchases: { configure: bridge.configure },
}));

describe("production store key selection", () => {
  beforeEach(() => {
    vi.resetModules();
    bridge.configure.mockReset();
    const env = loadEnv("production", process.cwd(), "VITE_");
    vi.stubEnv("VITE_REVENUECAT_ANDROID_KEY", env["VITE_REVENUECAT_ANDROID_KEY"]);
    vi.stubEnv("VITE_REVENUECAT_IOS_KEY", env["VITE_REVENUECAT_IOS_KEY"]);
  });
  afterEach(() => vi.unstubAllEnvs());

  it("configures Android with Ryan's production public key", async () => {
    bridge.platform = "android";
    const purchases = await import("./purchases");
    expect(purchases.storePurchasesAvailable()).toBe(true);
    await purchases.configurePurchases();
    expect(bridge.configure).toHaveBeenCalledWith({
      apiKey: "goog_hlxOlCIDBsUASEeNDPVeJprWTeP",
    });
  });

  it("keeps the existing iOS key", async () => {
    bridge.platform = "ios";
    const purchases = await import("./purchases");
    await purchases.configurePurchases();
    expect(bridge.configure).toHaveBeenCalledWith({
      apiKey: "appl_HsZozLYeDxkkUyvOYIOgbtRrVvo",
    });
  });

  it("does not configure store purchases on the website", async () => {
    bridge.platform = "web";
    const purchases = await import("./purchases");
    expect(purchases.storePurchasesAvailable()).toBe(false);
    await purchases.configurePurchases();
    expect(bridge.configure).not.toHaveBeenCalled();
  });
});