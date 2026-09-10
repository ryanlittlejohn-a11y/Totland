import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Native shell configuration for the iOS / Android builds of Totland.
 * The web deployment is unaffected by this file.
 *
 * Packaging steps:
 *   bun run build:app     -> static bundle in dist-app/
 *   bunx cap sync         -> copies dist-app into ios/ and android/
 */
const config: CapacitorConfig = {
  appId: "app.totland.kids",
  appName: "Totland",
  webDir: "dist-app",
  ios: {
    contentInset: "always",
    limitsNavigationsToAppBoundDomains: false,
    backgroundColor: "#fff7ed",
  },
  android: {
    backgroundColor: "#fff7ed",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#fff7ed",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashImmersive: false,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#fff7ed",
    },
  },
};

export default config;
