import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build as viteBuild } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const demoDir = join(root, "dist", "demo");
const storybookOut = join(root, "storybook-static");
const spaRoutes = ["about", "privacy", "contact"];

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

rmSync(demoDir, { recursive: true, force: true });

await viteBuild({
  configFile: join(root, "vite.config.js"),
  mode: "demo",
  logLevel: "warn",
});

const builtHtml = join(demoDir, "demo.html");
const indexHtml = join(demoDir, "index.html");
if (existsSync(builtHtml)) {
  renameSync(builtHtml, indexHtml);
}

// Static-host SPA fallbacks so /about etc. work without server rewrites.
for (const route of spaRoutes) {
  const dir = join(demoDir, route);
  mkdirSync(dir, { recursive: true });
  cpSync(indexHtml, join(dir, "index.html"));
}

// SPA fallbacks for legal routes. Do not swallow /storybook/* — those are real files.
writeFileSync(
  join(demoDir, "_redirects"),
  ["/storybook/*  /storybook/:splat  200", "/*    /index.html   200", ""].join(
    "\n",
  ),
);

run("npx", ["storybook", "build", "--output-dir", "storybook-static"]);

if (!existsSync(storybookOut)) {
  console.error("Storybook build missing: storybook-static/");
  process.exit(1);
}

mkdirSync(join(demoDir, "storybook"), { recursive: true });
cpSync(storybookOut, join(demoDir, "storybook"), { recursive: true });

console.log("Built dist/demo (app + about/privacy/contact + storybook/)");
