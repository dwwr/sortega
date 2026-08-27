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
    // Nested under dist/demo/storybook/ — relative assets work at site root or a subpath.
    if (configType === "PRODUCTION") {
      config.base = "./";
    }
    return config;
  },
};

export default config;
