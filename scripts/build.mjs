import { build as viteBuild } from "vite";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const require = createRequire(import.meta.url);

const targets = process.argv[2] ? [process.argv[2]] : ["chrome", "firefox"];
const polyfillPath = require.resolve("webextension-polyfill");
const appBundleDir = join(root, "dist", "_app");

async function buildApp() {
  rmSync(appBundleDir, { recursive: true, force: true });
  await viteBuild({
    configFile: join(root, "vite.config.js"),
    logLevel: "warn",
  });
}

function packageTarget(target) {
  if (target !== "chrome" && target !== "firefox") {
    throw new Error(`Unknown target: ${target}. Use chrome or firefox.`);
  }

  const out = join(root, "dist", target);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });

  cpSync(appBundleDir, join(out, "app"), { recursive: true });
  cpSync(join(root, "src", "icons"), join(out, "icons"), { recursive: true });
  cpSync(join(root, "src", "background.js"), join(out, "background.js"));
  cpSync(polyfillPath, join(out, "browser-polyfill.js"));

  const base = JSON.parse(
    readFileSync(join(root, "src", "manifest.base.json"), "utf8"),
  );

  if (target === "chrome") {
    delete base.browser_specific_settings;
    base.background = {
      service_worker: "background.js",
    };
  } else {
    base.background = {
      scripts: ["browser-polyfill.js", "background.js"],
    };
  }

  writeFileSync(join(out, "manifest.json"), `${JSON.stringify(base, null, 2)}\n`);
  console.log(`Built dist/${target}`);
}

await buildApp();
for (const target of targets) {
  packageTarget(target);
}
rmSync(appBundleDir, { recursive: true, force: true });
