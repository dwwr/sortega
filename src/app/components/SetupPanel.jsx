export default function SetupPanel({
  folders,
  sourceFolderId,
  destFolderId,
  onSourceChange,
  onDestChange,
  onStart,
  loading,
}) {
  const canStart = folders.length > 0 && Boolean(destFolderId);

  return (
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
        <span>File into</span>
        <select
          value={destFolderId}
          onChange={(event) => onDestChange(event.target.value)}
          disabled={loading || folders.length === 0}
        >
          {folders.length === 0 ? (
            <option value="">No folders found</option>
          ) : (
            folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.path}
              </option>
            ))
          )}
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
  );
}
