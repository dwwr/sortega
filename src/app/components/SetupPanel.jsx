import { DEST_TRASH } from "../lib/bookmarks.js";
import { copy } from "../copy.js";
import DeletedList from "./DeletedList.jsx";
import MovedList from "./MovedList.jsx";

export default function SetupPanel({
  folders,
  sourceFolderId,
  destFolderId,
  onSourceChange,
  onDestChange,
  onStart,
  loading,
  deletedItems,
  movedItems = [],
  onUndoDelete,
  onRestoreAll,
  onEmptyTrash,
  onUndoMove,
  onUndoAllMoves,
  onDismissMoved,
  undoBusy,
}) {
  const canStart = Boolean(destFolderId);

  return (
    <div className="home">
      <section className="controls" aria-label={copy.setup.ariaLabel}>
        <label className="field">
          <span>{copy.setup.fromLabel}</span>
          <select
            value={sourceFolderId}
            onChange={(event) => onSourceChange(event.target.value)}
            disabled={loading}
          >
            <option value="all">{copy.setup.allBookmarks}</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.path}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>{copy.setup.destinationLabel}</span>
          <select
            value={destFolderId}
            onChange={(event) => onDestChange(event.target.value)}
            disabled={loading}
          >
            <option value={DEST_TRASH}>{copy.setup.trashOption}</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.path}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="btn primary"
          onClick={onStart}
          disabled={!canStart || loading}
        >
          {copy.setup.startDeck}
        </button>
      </section>

      <DeletedList
        items={deletedItems}
        onRestore={onUndoDelete}
        onRestoreAll={onRestoreAll}
        onEmptyTrash={onEmptyTrash}
        busy={undoBusy}
      />

      <MovedList
        items={movedItems}
        onUndo={onUndoMove}
        onUndoAll={onUndoAllMoves}
        onDismissAll={onDismissMoved}
        busy={undoBusy}
      />
    </div>
  );
}
