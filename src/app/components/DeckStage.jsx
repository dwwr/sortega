import BookmarkCard from "./BookmarkCard.jsx";

export default function DeckStage({
  queue,
  stats,
  busy,
  flyAction,
  onAction,
  onReset,
}) {
  const visible = queue.slice(0, 2);

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
                onSwipe={isTop ? onAction : undefined}
              />
            );
          })
        )}
      </div>

      <div className="actions">
        <button
          type="button"
          className="fab delete"
          title="Delete (←)"
          onClick={() => onAction("delete")}
          disabled={busy || queue.length === 0}
        >
          Delete
        </button>
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
          className="fab file"
          title="File (→)"
          onClick={() => onAction("file")}
          disabled={busy || queue.length === 0}
        >
          File
        </button>
      </div>

      <p className="hint">
        Drag the card, use the buttons, or arrow keys. Esc undoes the last
        action.
      </p>
    </main>
  );
}
