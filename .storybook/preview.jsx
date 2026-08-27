import "../src/app/styles.css";

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "sortega",
      values: [
        { name: "sortega", value: "#12151a" },
        { name: "light", value: "#ffffff" },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="shell" style={{ paddingBottom: "2rem" }}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
