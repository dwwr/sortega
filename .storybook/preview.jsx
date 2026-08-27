import "../src/app/styles.css";

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "tahoe-mesh",
      values: [
        {
          name: "tahoe-mesh",
          value: "#9ec9ef",
        },
        { name: "light", value: "#e8f2fc" },
        { name: "dark", value: "#1a1d24" },
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
      <div
        className="shell"
        style={{
          paddingBottom: "2rem",
          minHeight: "100vh",
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 12% 18%, #ffd4a8 0%, transparent 55%), radial-gradient(ellipse 70% 55% at 88% 12%, #b8a6ff 0%, transparent 50%), radial-gradient(ellipse 65% 50% at 70% 78%, #7de0c6 0%, transparent 55%), radial-gradient(ellipse 55% 45% at 18% 88%, #ffb4c8 0%, transparent 50%)",
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default preview;
