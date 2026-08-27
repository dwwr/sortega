import { resolve } from "node:path";

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ["../src/app/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: "@storybook/react-vite",
  async viteFinal(config) {
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "webextension-polyfill": resolve("src/app/lib/browser-mock.js"),
    };
    return config;
  },
};

export default config;
