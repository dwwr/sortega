import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig(({ command }) => ({
  root: resolve("src/app"),
  base: "./",
  plugins: [react()],
  resolve: {
    // webextension-polyfill throws outside an extension page; mock it for `vite`.
    alias:
      command === "serve"
        ? {
            "webextension-polyfill": resolve("src/app/lib/browser-mock.js"),
          }
        : {},
  },
  build: {
    outDir: resolve("dist/_app"),
    emptyOutDir: true,
    sourcemap: true,
  },
}));
