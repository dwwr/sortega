import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

const DEMO_SPA_PATHS = new Set([
  "/",
  "/index.html",
  "/about",
  "/about/",
  "/privacy",
  "/privacy/",
  "/contact",
  "/contact/",
]);

export default defineConfig(({ command, mode }) => {
  // Demo showcase: `vite` / `vite build --mode demo`
  // Extension package: `vite build --mode extension` via scripts/build.mjs
  const isDemo = mode === "demo" || command === "serve";

  return {
    root: resolve("src/app"),
    // Demo uses absolute routes (/about) like earf-quake; extension stays relative.
    base: isDemo ? "/" : "./",
    appType: "spa",
    plugins: [
      react(),
      {
        name: "sortega-demo-html",
        configureServer(server) {
          if (!isDemo) return;
          server.middlewares.use((req, _res, next) => {
            const path = req.url?.split("?")[0] || "";
            if (DEMO_SPA_PATHS.has(path)) {
              req.url = "/demo.html";
            }
            next();
          });
        },
        configurePreviewServer(server) {
          if (!isDemo) return;
          server.middlewares.use((req, _res, next) => {
            const path = req.url?.split("?")[0] || "";
            if (
              path === "/about" ||
              path === "/about/" ||
              path === "/privacy" ||
              path === "/privacy/" ||
              path === "/contact" ||
              path === "/contact/"
            ) {
              req.url = "/index.html";
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: isDemo
        ? {
            "webextension-polyfill": resolve("src/app/lib/browser-mock.js"),
          }
        : {},
    },
    server: isDemo
      ? {
          open: "/",
        }
      : undefined,
    build: {
      outDir: resolve(isDemo ? "dist/demo" : "dist/_app"),
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: isDemo
        ? {
            input: resolve("src/app/demo.html"),
          }
        : undefined,
    },
  };
});
