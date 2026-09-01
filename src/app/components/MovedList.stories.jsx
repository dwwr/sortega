import { fn } from "storybook/test";
import MovedList from "./MovedList.jsx";
import { movedItems } from "../stories/fixtures.js";

const meta = {
  title: "Components/MovedList",
  component: MovedList,
  args: {
    items: movedItems,
    busy: false,
    onUndo: fn(),
    onUndoAll: fn(),
    onDismissAll: fn(),
  },
};

export default meta;

export const Populated = {};

export const SingleItem = {
  args: {
    items: movedItems.slice(0, 1),
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
