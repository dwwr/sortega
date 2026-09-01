import { useState } from "react";
import { fn } from "storybook/test";
import DeckStage from "./DeckStage.jsx";
import { deckDefaults, deletedItems, queue } from "../stories/fixtures.js";

const meta = {
  title: "Components/DeckStage",
  component: DeckStage,
  args: {
    ...deckDefaults,
    onAction: fn(),
    onReset: fn(),
    onUndoDelete: fn(),
    onRestoreAll: fn(),
    onEmptyTrash: fn(),
  },
};

export default meta;

export const TrashDestination = {};

export const FolderDestination = {
  args: {
    destIsTrash: false,
    deletedItems: [],
  },
};

export const EmptyDeck = {
  args: {
    queue: [],
    deletedItems,
  },
};

export const NoTrashYet = {
  args: {
    deletedItems: [],
  },
};

export const Interactive = {
  render: function InteractiveDeck(args) {
    const [cards, setCards] = useState(queue);
    const [trash, setTrash] = useState(deletedItems);
    const [stats, setStats] = useState(deckDefaults.stats);
    const [busy, setBusy] = useState(false);
    const [flyAction, setFlyAction] = useState(null);

    async function onAction(action) {
      if (busy || cards.length === 0) return;
      const [current, ...rest] = cards;
      setBusy(true);
      setFlyAction(action);
      await new Promise((resolve) => setTimeout(resolve, 280));

      if (action === "delete") {
        setTrash((items) => [
          {
            logId: `log-${Date.now()}`,
            title: current.title,
            url: current.url,
            previousParentId: current.parentId,
            folderPath: current.folderPath,
          },
          ...items,
        ]);
        setStats((s) => ({ ...s, deleted: s.deleted + 1 }));
      } else if (action === "file") {
        setStats((s) => ({ ...s, filed: s.filed + 1 }));
      } else {
        setStats((s) => ({ ...s, skipped: s.skipped + 1 }));
      }

      setCards(rest);
      setFlyAction(null);
      setBusy(false);
    }

    return (
      <DeckStage
        {...args}
        queue={cards}
        stats={stats}
        busy={busy}
        flyAction={flyAction}
        deletedItems={trash}
        onAction={onAction}
        onUndoDelete={(logId) => {
          const item = trash.find((entry) => entry.logId === logId);
          if (!item) return;
          setTrash((entries) => entries.filter((entry) => entry.logId !== logId));
          setCards((q) => [
            {
              id: `restored-${logId}`,
              title: item.title,
              url: item.url,
              parentId: item.previousParentId,
              folderPath: item.folderPath,
            },
            ...q,
          ]);
          setStats((s) => ({ ...s, deleted: Math.max(0, s.deleted - 1) }));
        }}
        onRestoreAll={() => {
          setCards((q) => [
            ...trash.map((item) => ({
              id: `restored-${item.logId}`,
              title: item.title,
              url: item.url,
              parentId: item.previousParentId,
              folderPath: item.folderPath,
            })),
            ...q,
          ]);
          setStats((s) => ({ ...s, deleted: 0 }));
          setTrash([]);
        }}
        onEmptyTrash={() => setTrash([])}
      />
    );
  },
};
