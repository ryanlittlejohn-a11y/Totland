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

/** Soundtrack for the main screens (home, worlds, adventure, rewards). */
export const MENU_TRACK_URL: string | null = assetUrl(menuTrack.url);

/** Soundtrack for activities (games, flash cards, tracing). */
export const ACTIVITY_TRACK_URL: string | null = assetUrl(activityTrack.url);

/** Soundtrack for storybooks. */
export const STORY_TRACK_URL: string | null = assetUrl(storyTrack.url);
