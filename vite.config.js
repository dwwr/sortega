import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig(({ command, mode }) => {
  // Demo showcase: `vite` / `vite build --mode demo`
  // Extension package: `vite build --mode extension` via scripts/build.mjs
  const isDemo = mode === "demo" || command === "serve";

  return {
    root: resolve("src/app"),
    base: "./",
    // `vite` / demo build use demo.html; extension build uses index.html → main.jsx
    appType: "spa",
    plugins: [
      react(),
      {
        name: "sortega-demo-html",
        configureServer(server) {
          if (!isDemo) return;
          server.middlewares.use((req, _res, next) => {
            if (req.url === "/" || req.url === "/index.html") {
              req.url = "/demo.html";
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
          open: "/demo.html",
          proxy: {
            "/storybook": {
              target: "http://127.0.0.1:6006",
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/storybook/, "") || "/",
              ws: true,
            },
          },
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
