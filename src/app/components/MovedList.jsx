import { copy } from "../copy.js";

export default function MovedList({
  items,
  onUndo,
  onUndoAll,
  onDismissAll,
  busy,
}) {
  if (items.length === 0) return null;

  return (
    <section className="deleted moved" aria-label={copy.moves.ariaLabel}>
      <div className="deleted-head">
        <div className="deleted-title-row">
          <h2>{copy.moves.title}</h2>
          <span className="deleted-count">{items.length}</span>
        </div>
        <div className="deleted-actions">
          <button
            type="button"
            className="btn undo"
            onClick={onUndoAll}
            disabled={busy}
            title={copy.moves.undoAllTooltip}
          >
            {copy.moves.undoAll}
          </button>
          <button
            type="button"
            className="btn danger"
            onClick={onDismissAll}
            disabled={busy}
            title={copy.moves.dismissAllTooltip}
          >
            {copy.moves.dismissAll}
          </button>
        </div>
      </div>
      <ul className="deleted-list">
        {items.map((item) => (
          <li key={item.logId} className="deleted-item">
            <div className="deleted-meta">
              <p className="deleted-title">{item.title}</p>
              <a
                className="deleted-url"
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.url}
              </a>
              {item.folderPath ? (
                <p className="deleted-folder">{item.folderPath}</p>
              ) : null}
              {item.destinationPath ? (
                <p className="deleted-folder moved-to">{item.destinationPath}</p>
              ) : null}
            </div>
            <button
              type="button"
              className="btn undo"
              onClick={() => onUndo(item.logId)}
              disabled={busy}
              title={copy.moves.undoTooltip}
            >
              {copy.moves.undo}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
