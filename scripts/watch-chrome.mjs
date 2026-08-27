import { build as viteBuild } from "vite";
import { cpSync, watch } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const chromeDir = join(root, "dist", "chrome");

function runInitialBuild() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [join(root, "scripts", "build.mjs"), "chrome"],
      { cwd: root, stdio: "inherit" },
    );
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Initial chrome build failed with code ${code}`));
    });
  });
}

function copyBackground() {
  cpSync(join(root, "src", "background.js"), join(chromeDir, "background.js"));
  console.log("Copied background.js — reload the extension if needed");
}

await runInitialBuild();

watch(join(root, "src", "background.js"), (eventType) => {
  if (eventType !== "change" && eventType !== "rename") return;
  try {
    copyBackground();
  } catch (error) {
    console.error(error);
  }
});

console.log(`
Watching → dist/chrome/app

• Load unpacked once: dist/chrome
• UI save → refresh the Sortega tab (Cmd/Ctrl+R)
• Background changes → Reload on chrome://extensions
• Icons/manifest: re-run watch:chrome or npm run build:chrome
• Ctrl+C to stop
`);

await viteBuild({
  configFile: join(root, "vite.config.js"),
  mode: "extension",
  logLevel: "warn",
  build: {
    outDir: join(chromeDir, "app"),
    emptyOutDir: true,
    sourcemap: true,
    watch: {
      chokidar: {
        ignoreInitial: true,
        awaitWriteFinish: { stabilityThreshold: 120, pollInterval: 50 },
      },
    },
  },
});
