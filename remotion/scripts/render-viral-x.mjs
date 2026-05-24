import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("Bundling...");
const bundled = await bundle({
  entryPoint: path.resolve(__dirname, "../src/index.ts"),
  webpackOverride: (config) => config,
});

const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});

const comp = await selectComposition({
  serveUrl: bundled,
  id: "viral-x",
  puppeteerInstance: browser,
});

const output = "/mnt/documents/familyfoodOS-viral-x.mp4";

console.log(`Rendering ${comp.durationInFrames} frames -> ${output}`);
await renderMedia({
  composition: comp,
  serveUrl: bundled,
  codec: "h264",
  outputLocation: output,
  puppeteerInstance: browser,
  muted: true,
  concurrency: 1,
  crf: 18,
  onProgress: ({ progress }) => {
    const pct = Math.round(progress * 100);
    if (pct % 10 === 0) console.log(`  ${pct}%`);
  },
});

await browser.close({ silent: false });
console.log(`Done: ${output}`);
