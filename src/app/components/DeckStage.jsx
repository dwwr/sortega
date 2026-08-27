import BookmarkCard from "./BookmarkCard.jsx";
import DeletedList from "./DeletedList.jsx";

export default function DeckStage({
  queue,
  stats,
  busy,
  flyAction,
  destIsTrash,
  deletedItems,
  onAction,
  onReset,
  onUndoDelete,
  onRestoreAll,
  onEmptyTrash,
}) {
  const visible = queue.slice(0, 2);
  const sendLabel = destIsTrash ? "Delete" : "File";

  return (
    <main className="stage">
      <div className="stats">
        <span>{queue.length} left</span>
        <span>
          {stats.filed} filed · {stats.deleted} deleted · {stats.skipped} skipped
        </span>
      </div>

      <div className="deck" aria-live="polite">
        {queue.length === 0 ? (
          <div className="empty">
            <p>Deck clear.</p>
            <button type="button" className="btn" onClick={onReset}>
              Back to setup
            </button>
          </div>
        ) : (
          [...visible].reverse().map((bookmark, index, arr) => {
            const isTop = index === arr.length - 1;
            return (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                behind={!isTop}
                busy={busy}
                flyAction={isTop ? flyAction : null}
                destIsTrash={destIsTrash}
                onSwipe={isTop ? onAction : undefined}
              />
            );
          })
        )}
      </div>

      <div className="actions">
        {!destIsTrash ? (
          <button
            type="button"
            className="fab delete"
            title="Delete (←)"
            onClick={() => onAction("delete")}
            disabled={busy || queue.length === 0}
          >
            Delete
          </button>
        ) : null}
        <button
          type="button"
          className="fab skip"
          title="Skip (↓)"
          onClick={() => onAction("skip")}
          disabled={busy || queue.length === 0}
        >
          Skip
        </button>
        <button
          type="button"
          className={`fab ${destIsTrash ? "delete" : "file"}`}
          title={`${sendLabel} (→)`}
          onClick={() => onAction("file")}
          disabled={busy || queue.length === 0}
        >
          {sendLabel}
        </button>
      </div>

      <p className="hint">
        Drag the card, use the buttons, or arrow keys. Esc undoes the last
        action.
      </p>

      <DeletedList
        items={deletedItems}
        onRestore={onUndoDelete}
        onRestoreAll={onRestoreAll}
        onEmptyTrash={onEmptyTrash}
        busy={busy}
      />
    </main>
  );
}
