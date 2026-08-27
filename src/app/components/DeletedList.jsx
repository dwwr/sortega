import { copy } from "../copy.js";

export default function DeletedList({
  items,
  onRestore,
  onRestoreAll,
  onEmptyTrash,
  busy,
}) {
  if (items.length === 0) return null;

  return (
    <section className="deleted" aria-label={copy.trash.ariaLabel}>
      <div className="deleted-head">
        <div className="deleted-title-row">
          <h2>{copy.trash.title}</h2>
          <span className="deleted-count">{items.length}</span>
        </div>
        <div className="deleted-actions">
          <button
            type="button"
            className="btn undo"
            onClick={onRestoreAll}
            disabled={busy}
            title={copy.trash.restoreAllTooltip}
          >
            {copy.trash.restoreAll}
          </button>
          <button
            type="button"
            className="btn danger"
            onClick={onEmptyTrash}
            disabled={busy}
            title={copy.trash.emptyTrashTooltip}
          >
            {copy.trash.emptyTrash}
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
            </div>
            <button
              type="button"
              className="btn undo"
              onClick={() => onRestore(item.logId)}
              disabled={busy}
              title={copy.trash.restoreTooltip}
            >
              {copy.trash.restore}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
