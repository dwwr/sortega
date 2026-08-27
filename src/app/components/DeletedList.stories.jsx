import { fn } from "storybook/test";
import DeletedList from "./DeletedList.jsx";
import { deletedItems } from "../stories/fixtures.js";

const meta = {
  title: "Components/DeletedList",
  component: DeletedList,
  args: {
    items: deletedItems,
    busy: false,
    onRestore: fn(),
    onRestoreAll: fn(),
    onEmptyTrash: fn(),
  },
};

export default meta;

export const Populated = {};

export const SingleItem = {
  args: {
    items: deletedItems.slice(0, 1),
  },
};

export const Busy = {
  args: {
    busy: true,
  },
};

export const EmptyHidden = {
  name: "Empty (renders nothing)",
  args: {
    items: [],
  },
};
