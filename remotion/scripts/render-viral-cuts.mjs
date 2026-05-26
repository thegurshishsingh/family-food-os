import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CUTS = [
  { id: "viral-x-15s", out: "/mnt/documents/familyfoodOS-viral-x-15s.mp4" },
  { id: "viral-x",     out: "/mnt/documents/familyfoodOS-viral-x-26s.mp4" },
  { id: "viral-x-35s", out: "/mnt/documents/familyfoodOS-viral-x-35s.mp4" },
];

// Allow filtering: `node render-viral-cuts.mjs 15s 35s`
const filter = process.argv.slice(2);
const targets = filter.length
  ? CUTS.filter((c) => filter.some((f) => c.id.includes(f)))
  : CUTS;

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

for (const cut of targets) {
  const comp = await selectComposition({ serveUrl: bundled, id: cut.id, puppeteerInstance: browser });
  console.log(`\n[${cut.id}] rendering ${comp.durationInFrames} frames -> ${cut.out}`);
  await renderMedia({
    composition: comp,
    serveUrl: bundled,
    codec: "h264",
    outputLocation: cut.out,
    puppeteerInstance: browser,
    muted: true,
    concurrency: 1,
    crf: 18,
    onProgress: ({ progress }) => {
      const pct = Math.round(progress * 100);
      if (pct % 20 === 0) console.log(`  ${cut.id}: ${pct}%`);
    },
  });
  console.log(`[${cut.id}] done`);
}

await browser.close({ silent: false });
console.log("\nAll cuts rendered.");
