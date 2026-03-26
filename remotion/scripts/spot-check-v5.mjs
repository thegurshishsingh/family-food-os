import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const entryPoint = path.resolve("/dev-server/remotion/src/index.ts");

const bundled = await bundle({ entryPoint, webpackOverride: c => c });
const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox","--disable-gpu","--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});

const composition = await selectComposition({ serveUrl: bundled, id: "main", puppeteerInstance: browser });

const frames = [15, 60, 150, 300, 450, 600];
for (const f of frames) {
  await renderStill({ composition, serveUrl: bundled, output: `/tmp/v5-f${String(f).padStart(3,'0')}.png`, frame: f, puppeteerInstance: browser });
  console.log(`Frame ${f} done`);
}
await browser.close({ silent: false });
