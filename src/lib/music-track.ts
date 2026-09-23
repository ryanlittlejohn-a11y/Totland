import menuTrack from "@/assets/little-steps-big-dreams.mp3.asset.json";
import activityTrack from "@/assets/curious-steps.mp3.asset.json";
import storyTrack from "@/assets/forest-of-wonder.mp3.asset.json";

import { apiOrigin, isNativeApp } from "./native";

/**
 * Uploaded media is stored on Totland's hosting and referenced by a
 * site-relative address. Inside the packaged iPhone/iPad app the page is served
 * from the app's own bundle, where that address points at nothing — so the
 * address has to be completed with the hosted origin before anything can load.
 */
export function assetUrl(url: string): string {
  if (!url.startsWith("/")) return url;
  if (!isNativeApp()) return url;
  return `${apiOrigin()}${url}`;
}

export type Track = {
  /** Copy packaged inside the app (native only), so music works with no internet. */
  local: string | null;
  /** Hosted copy — what the website always uses, and the native fallback. */
  remote: string;
};

/** Packaged copies live next to the bundled screens (see scripts/prepare-native-bundle.mjs). */
function bundled(filename: string): string | null {
  return isNativeApp() ? `/music/${filename}` : null;
}

function track(url: string, filename: string): Track {
  return { local: bundled(filename), remote: assetUrl(url) };
}

/** Soundtrack for the main screens (home, worlds, adventure, rewards). */
export const MENU_TRACK: Track = track(menuTrack.url, "little-steps-big-dreams.mp3");

/** Soundtrack for activities (games, flash cards, tracing). */
export const ACTIVITY_TRACK: Track = track(activityTrack.url, "curious-steps.mp3");

/** Soundtrack for storybooks. */
export const STORY_TRACK: Track = track(storyTrack.url, "forest-of-wonder.mp3");
