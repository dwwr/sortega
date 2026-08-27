import BookmarkCard from "./BookmarkCard.jsx";
import { bookmarkChrome, bookmarkReact } from "../stories/fixtures.js";

const meta = {
  title: "Components/BookmarkCard",
  component: BookmarkCard,
  parameters: {
    layout: "centered",
  },
  args: {
    bookmark: bookmarkChrome,
    behind: false,
    busy: false,
    flyAction: null,
    destIsTrash: true,
    onSwipe: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ width: "min(420px, 90vw)", height: "520px", position: "relative" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

export const Default = {};

export const FileDestination = {
  args: {
    destIsTrash: false,
  },
};

export const Behind = {
  args: {
    bookmark: bookmarkReact,
    behind: true,
  },
};

export const Busy = {
  args: {
    busy: true,
  },
};
