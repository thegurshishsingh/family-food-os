import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("Bundling...");
const bundled = await bundle({
  entryPoint: path.resolve(__dirname, "../src/index.ts"),
  webpackOverride: (config) => config,
});

console.log("Opening browser...");
const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: {
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  },
  chromeMode: "chrome-for-testing",
});

// Render main 23s video
console.log("Selecting main composition...");
const mainComp = await selectComposition({
  serveUrl: bundled,
  id: "main",
  puppeteerInstance: browser,
});

const mainVideoOnly = "/tmp/main-video-only.mp4";

console.log(`Rendering main video: ${mainComp.durationInFrames} frames...`);
await renderMedia({
  composition: mainComp,
  serveUrl: bundled,
  codec: "h264",
  outputLocation: mainVideoOnly,
  puppeteerInstance: browser,
  muted: true,
  concurrency: 1,
  crf: 18,
  onProgress: ({ progress }) => {
    if (Math.round(progress * 100) % 20 === 0) {
      console.log(`Main progress: ${Math.round(progress * 100)}%`);
    }
  },
});

// Render 15s social cut
console.log("Selecting social composition...");
const socialComp = await selectComposition({
  serveUrl: bundled,
  id: "social-15s",
  puppeteerInstance: browser,
});

const socialVideoOnly = "/tmp/social-video-only.mp4";

console.log(`Rendering social cut: ${socialComp.durationInFrames} frames...`);
await renderMedia({
  composition: socialComp,
  serveUrl: bundled,
  codec: "h264",
  outputLocation: socialVideoOnly,
  puppeteerInstance: browser,
  muted: true,
  concurrency: 1,
  crf: 18,
  onProgress: ({ progress }) => {
    if (Math.round(progress * 100) % 20 === 0) {
      console.log(`Social progress: ${Math.round(progress * 100)}%`);
    }
  },
});

await browser.close({ silent: false });

// Mux audio
const audioPath = path.resolve(__dirname, "../public/audio/bg-music-v5.mp3");
const mainOutput = "/mnt/documents/familyfoodOS-product-video-v5.mp4";
const socialOutput = "/mnt/documents/familyfoodOS-15s-social-v5.mp4";

// For main video: mux bg music + all SFX are already baked into the silent render via Remotion Audio
// Actually Remotion Audio needs non-muted render. Since ffmpeg can't encode aac with this build,
// let's use muxing approach: render muted video, then add music via ffmpeg
console.log("Muxing audio for main video...");
execSync(
  `ffmpeg -y -i "${mainVideoOnly}" -i "${audioPath}" -c:v copy -c:a aac -b:a 192k -filter:a "volume=0.3" -shortest "${mainOutput}"`,
  { stdio: "inherit" }
);

console.log("Muxing audio for social cut...");
execSync(
  `ffmpeg -y -i "${socialVideoOnly}" -i "${audioPath}" -c:v copy -c:a aac -b:a 192k -filter:a "volume=0.3" -shortest "${socialOutput}"`,
  { stdio: "inherit" }
);

console.log(`Done! Main: ${mainOutput}`);
console.log(`Done! Social: ${socialOutput}`);
