export default function DeletedList({
  items,
  onRestore,
  onRestoreAll,
  onEmptyTrash,
  busy,
}) {
  if (items.length === 0) return null;

  return (
    <section className="deleted" aria-label="Trash">
      <div className="deleted-head">
        <div className="deleted-title-row">
          <h2>Trash</h2>
          <span className="deleted-count">{items.length}</span>
        </div>
        <div className="deleted-actions">
          <button
            type="button"
            className="btn undo"
            onClick={onRestoreAll}
            disabled={busy}
            title="Restore every item to its original folder"
          >
            Restore all
          </button>
          <button
            type="button"
            className="btn danger"
            onClick={onEmptyTrash}
            disabled={busy}
            title="Permanently clear this list"
          >
            Empty trash
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
              title="Restore to original folder"
            >
              Restore
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
