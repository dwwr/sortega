import { DEST_TRASH } from "../lib/bookmarks.js";
import DeletedList from "./DeletedList.jsx";

export default function SetupPanel({
  folders,
  sourceFolderId,
  destFolderId,
  onSourceChange,
  onDestChange,
  onStart,
  loading,
  deletedItems,
  onUndoDelete,
  onRestoreAll,
  onEmptyTrash,
  undoBusy,
}) {
  const canStart = Boolean(destFolderId);

  return (
    <div className="home">
      <section className="controls" aria-label="Session setup">
        <label className="field">
          <span>From</span>
          <select
            value={sourceFolderId}
            onChange={(event) => onSourceChange(event.target.value)}
            disabled={loading}
          >
            <option value="all">All bookmarks</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.path}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Destination</span>
          <select
            value={destFolderId}
            onChange={(event) => onDestChange(event.target.value)}
            disabled={loading}
          >
            <option value={DEST_TRASH}>Trash (delete)</option>
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
          Start deck
        </button>
      </section>

      <DeletedList
        items={deletedItems}
        onRestore={onUndoDelete}
        onRestoreAll={onRestoreAll}
        onEmptyTrash={onEmptyTrash}
        busy={undoBusy}
      />
    </div>
  );
}
