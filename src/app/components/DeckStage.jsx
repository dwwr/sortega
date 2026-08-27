import BookmarkCard from "./BookmarkCard.jsx";
import DeletedList from "./DeletedList.jsx";
import { copy } from "../copy.js";

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
  const sendLabel = destIsTrash ? copy.deck.delete : copy.deck.file;

  return (
    <main className="stage">
      <div className="stats">
        <span>{copy.deck.left(queue.length)}</span>
        <span>
          {copy.deck.stats(stats.filed, stats.deleted, stats.skipped)}
        </span>
      </div>

      <div className="deck" aria-live="polite">
        {queue.length === 0 ? (
          <div className="empty">
            <p>{copy.deck.emptyTitle}</p>
            <button type="button" className="btn" onClick={onReset}>
              {copy.deck.backToSetup}
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
            title={copy.deck.deleteTooltip}
            onClick={() => onAction("delete")}
            disabled={busy || queue.length === 0}
          >
            {copy.deck.delete}
          </button>
        ) : null}
        <button
          type="button"
          className="fab skip"
          title={copy.deck.skipTooltip}
          onClick={() => onAction("skip")}
          disabled={busy || queue.length === 0}
        >
          {copy.deck.skip}
        </button>
        <button
          type="button"
          className={`fab ${destIsTrash ? "delete" : "file"}`}
          title={copy.deck.sendTooltip(sendLabel)}
          onClick={() => onAction("file")}
          disabled={busy || queue.length === 0}
        >
          {sendLabel}
        </button>
      </div>

      <p className="hint">{copy.deck.hint}</p>

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
