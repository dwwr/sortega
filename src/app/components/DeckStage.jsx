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
  const leftLabel = destIsTrash ? copy.deck.delete : copy.deck.stay;
  const leftAction = destIsTrash ? "delete" : "skip";
  const leftTooltip = destIsTrash
    ? copy.deck.deleteTooltip
    : copy.deck.stayTooltip;
  const rightLabel = destIsTrash ? copy.deck.keep : copy.deck.move;
  const rightAction = destIsTrash ? "skip" : "file";
  const rightTooltip = destIsTrash ? copy.deck.keepTooltip : copy.deck.moveTooltip;

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
            // Promote the peek while the top card flies out so it eases up
            // instead of popping after the queue advances.
            const behind = !isTop && !flyAction;
            return (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                behind={behind}
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
        <button
          type="button"
          className={`fab ${destIsTrash ? "delete" : "skip"}`}
          title={leftTooltip}
          onClick={() => onAction(leftAction)}
          disabled={busy || queue.length === 0}
        >
          {leftLabel}
        </button>
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
          className="fab file"
          title={rightTooltip}
          onClick={() => onAction(rightAction)}
          disabled={busy || queue.length === 0}
        >
          {rightLabel}
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
