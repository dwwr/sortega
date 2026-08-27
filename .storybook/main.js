import { resolve } from "node:path";

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ["../src/app/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: "@storybook/react-vite",
  async viteFinal(config, { configType }) {
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "webextension-polyfill": resolve("src/app/lib/browser-mock.js"),
    };
    // Production static files live at dist/demo/storybook and are served at /storybook/
    // (same pattern as earf-quake / ca-llc-field-manual).
    if (configType === "PRODUCTION") {
      config.base = "/storybook/";
    }
    return config;
  },
};

export default config;
