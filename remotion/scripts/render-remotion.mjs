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

console.log("Selecting composition...");
const composition = await selectComposition({
  serveUrl: bundled,
  id: "main",
  puppeteerInstance: browser,
});

const videoOnly = "/tmp/video-only.mp4";

console.log(`Rendering ${composition.durationInFrames} frames (video only)...`);
await renderMedia({
  composition,
  serveUrl: bundled,
  codec: "h264",
  outputLocation: videoOnly,
  puppeteerInstance: browser,
  muted: true,
  concurrency: 1,
  crf: 18,
  onProgress: ({ progress }) => {
    if (Math.round(progress * 100) % 20 === 0) {
      console.log(`Progress: ${Math.round(progress * 100)}%`);
    }
  },
});

await browser.close({ silent: false });

// Mux audio with system ffmpeg
const audioPath = path.resolve(__dirname, "../public/audio/bg-music.wav");
const outputPath = "/mnt/documents/familyfoodOS-product-video-v2.mp4";

console.log("Muxing audio with system ffmpeg...");
execSync(
  `ffmpeg -y -i "${videoOnly}" -i "${audioPath}" -c:v copy -c:a aac -b:a 192k -filter:a "volume=0.4" -shortest "${outputPath}"`,
  { stdio: "inherit" }
);

console.log(`Done! Output: ${outputPath}`);
