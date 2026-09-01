import { useState } from "react";
import { fn } from "storybook/test";
import SetupPanel from "./SetupPanel.jsx";
import { DEST_TRASH } from "../lib/bookmarks.js";
import { deletedItems, folders, movedItems, setupDefaults } from "../stories/fixtures.js";

const meta = {
  title: "Components/SetupPanel",
  component: SetupPanel,
  args: {
    ...setupDefaults,
    onSourceChange: fn(),
    onDestChange: fn(),
    onStart: fn(),
    onUndoDelete: fn(),
    onRestoreAll: fn(),
    onEmptyTrash: fn(),
    onUndoMove: fn(),
    onUndoAllMoves: fn(),
    onDismissMoved: fn(),
  },
};

export default meta;

export const Default = {};

export const Loading = {
  args: {
    loading: true,
  },
};

export const FolderDestination = {
  args: {
    destFolderId: "2",
    sourceFolderId: "1",
  },
};

export const WithTrash = {
  args: {
    deletedItems,
  },
};

export const WithMoved = {
  args: {
    destFolderId: "2",
    movedItems,
  },
};

export const Interactive = {
  render: function InteractiveSetup(args) {
    const [sourceFolderId, setSourceFolderId] = useState("all");
    const [destFolderId, setDestFolderId] = useState(DEST_TRASH);
    const [trash, setTrash] = useState(deletedItems);

    return (
      <SetupPanel
        {...args}
        sourceFolderId={sourceFolderId}
        destFolderId={destFolderId}
        folders={folders}
        deletedItems={trash}
        onSourceChange={setSourceFolderId}
        onDestChange={setDestFolderId}
        onUndoDelete={(logId) =>
          setTrash((items) => items.filter((item) => item.logId !== logId))
        }
        onRestoreAll={() => setTrash([])}
        onEmptyTrash={() => setTrash([])}
      />
    );
  },
};
