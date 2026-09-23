// Copies the static build output into dist-app/, which Capacitor packages
// inside the iOS and Android apps. Run through `bun run build:app`.
import { cp, rm, mkdir, access, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const candidates = [".output/public", "dist/client", ".tanstack/start/build/client-dist"];
const target = "dist-app";

const source = candidates.find((c) => existsSync(c));
if (!source) {
  console.error(
    `[totland] Could not find the built static files. Looked in: ${candidates.join(", ")}`,
  );
  process.exit(1);
}

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });

// Capacitor needs an index.html entry point at the root of the bundle.
await access(path.join(target, "index.html")).catch(() => {
  console.error(
    `[totland] ${target}/index.html is missing — the SPA shell was not prerendered. ` +
      `Check the spa.prerender settings in vite.config.ts.`,
  );
  process.exit(1);
});

// The background soundtracks ship inside the app so premium families keep
// music when they are offline. The website still streams the hosted copies.
const musicSource = "native-assets/music";
const musicTracks = [
  "little-steps-big-dreams.mp3",
  "curious-steps.mp3",
  "forest-of-wonder.mp3",
];
const missing = musicTracks.filter((f) => !existsSync(path.join(musicSource, f)));
if (missing.length) {
  console.error(`[totland] Missing bundled soundtrack(s) in ${musicSource}/: ${missing.join(", ")}`);
  process.exit(1);
}
await cp(musicSource, path.join(target, "music"), { recursive: true });

const files = await readdir(target);
console.log(
  `[totland] Native bundle ready in ${target}/ (${files.length} top-level entries, ${musicTracks.length} soundtracks)`,
);
