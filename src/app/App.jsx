import { useEffect, useRef, useState } from "react";
import browser from "webextension-polyfill";
import SetupPanel from "./components/SetupPanel.jsx";
import DeckStage from "./components/DeckStage.jsx";
import {
  STORAGE_KEY,
  DELETED_STORAGE_KEY,
  MOVED_STORAGE_KEY,
  DEST_TRASH,
  bookmarksForSource,
  destinationLabel,
  flattenBookmarks,
  isTrashDestination,
  shuffle,
  sourceLabel,
  wait,
} from "./lib/bookmarks.js";
import { copy } from "./copy.js";

const emptyStats = { kept: 0, deleted: 0, moved: 0 };

function newLogId() {
  return crypto.randomUUID();
}

export default function App({
  demoBanner = null,
  demoHeaderAction = null,
  onActiveChange = null,
}) {
  const [folders, setFolders] = useState([]);
  const [sourceFolderId, setSourceFolderId] = useState("all");
  const [destFolderId, setDestFolderId] = useState(DEST_TRASH);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(false);
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState(emptyStats);
  const [busy, setBusy] = useState(false);
  const [flyAction, setFlyAction] = useState(null);
  const [deletedItems, setDeletedItems] = useState([]);
  const [movedItems, setMovedItems] = useState([]);

  const undoStackRef = useRef([]);
  const queueRef = useRef(queue);
  const busyRef = useRef(busy);
  const activeRef = useRef(active);
  const destRef = useRef(destFolderId);
  const flyActionRef = useRef(flyAction);
  const storageReadyRef = useRef(false);

  const destIsTrash = isTrashDestination(destFolderId);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);
  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  useEffect(() => {
    onActiveChange?.(active);
  }, [active, onActiveChange]);
  useEffect(() => {
    destRef.current = destFolderId;
  }, [destFolderId]);
  useEffect(() => {
    flyActionRef.current = flyAction;
  }, [flyAction]);

  useEffect(() => {
    let cancelled = false;

    async function loadTree() {
      try {
        const tree = await browser.bookmarks.getTree();
        const roots = tree[0]?.children || tree;
        const flat = flattenBookmarks(roots);
        if (cancelled) return;

        setFolders(flat.folders);

        const saved = await browser.storage.local.get([
          STORAGE_KEY,
          DELETED_STORAGE_KEY,
          MOVED_STORAGE_KEY,
        ]);
        const settings = saved[STORAGE_KEY] || {};
        const sourceOk =
          settings.sourceFolderId === "all" ||
          flat.folders.some((f) => f.id === settings.sourceFolderId);
        const destOk =
          isTrashDestination(settings.destFolderId) ||
          flat.folders.some((f) => f.id === settings.destFolderId);

        setSourceFolderId(sourceOk ? settings.sourceFolderId : "all");
        setDestFolderId(destOk ? settings.destFolderId : DEST_TRASH);

        const storedDeleted = saved[DELETED_STORAGE_KEY];
        if (Array.isArray(storedDeleted)) {
          setDeletedItems(storedDeleted);
        }

        const storedMoved = saved[MOVED_STORAGE_KEY];
        if (Array.isArray(storedMoved)) {
          setMovedItems(storedMoved);
        }
      } catch (error) {
        console.error(error);
        window.alert(copy.alerts.loadBookmarksFailed(error.message || error));
      } finally {
        if (!cancelled) {
          storageReadyRef.current = true;
          setLoading(false);
        }
      }
    }

    loadTree();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!storageReadyRef.current) return;
    browser.storage.local.set({ [DELETED_STORAGE_KEY]: deletedItems }).catch(
      (error) => console.error(error),
    );
  }, [deletedItems]);

  useEffect(() => {
    if (!storageReadyRef.current) return;
    browser.storage.local.set({ [MOVED_STORAGE_KEY]: movedItems }).catch(
      (error) => console.error(error),
    );
  }, [movedItems]);

  useEffect(() => {
    function onKeyDown(event) {
      if (!activeRef.current) return;
      const trashDest = isTrashDestination(destRef.current);
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        resolveAction(trashDest ? "delete" : "skip");
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        resolveAction(trashDest ? "skip" : "file");
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        resolveAction("skip");
      } else if (event.key === "Escape") {
        event.preventDefault();
        undo();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  async function saveSettings(nextSource = sourceFolderId, nextDest = destFolderId) {
    await browser.storage.local.set({
      [STORAGE_KEY]: {
        sourceFolderId: nextSource,
        destFolderId: nextDest,
      },
    });
  }

  async function startDeck() {
    try {
      await saveSettings();
      if (!destFolderId) {
        window.alert(copy.alerts.pickDestination);
        return;
      }

      const tree = await browser.bookmarks.getTree();
      const roots = tree[0]?.children || tree;
      const { bookmarks, folders: nextFolders } = flattenBookmarks(roots);
      setFolders(nextFolders);

      let nextQueue = shuffle(
        bookmarksForSource(bookmarks, nextFolders, sourceFolderId),
      );
      if (!isTrashDestination(destFolderId)) {
        nextQueue = nextQueue.filter((b) => b.parentId !== destFolderId);
      }

      undoStackRef.current = [];
      setStats(emptyStats);
      setQueue(nextQueue);
      setFlyAction(null);
      setActive(true);
    } catch (error) {
      console.error(error);
      window.alert(copy.alerts.startFailed(error.message || error));
    }
  }

  function rememberDeleted(entry) {
    setDeletedItems((items) => [entry, ...items]);
  }

  function forgetDeleted(logId) {
    setDeletedItems((items) => items.filter((item) => item.logId !== logId));
  }

  function rememberMoved(entry) {
    setMovedItems((items) => [entry, ...items]);
  }

  function forgetMoved(logId) {
    setMovedItems((items) => items.filter((item) => item.logId !== logId));
  }

  async function deleteBookmark(bookmark) {
    const before = await browser.bookmarks.get(bookmark.id);
    await browser.bookmarks.remove(bookmark.id);
    const logId = newLogId();
    const entry = {
      logId,
      title: before[0]?.title || bookmark.title,
      url: before[0]?.url || bookmark.url,
      previousParentId: before[0]?.parentId,
      previousIndex: before[0]?.index,
      folderPath: bookmark.folderPath || "",
    };
    rememberDeleted(entry);
    undoStackRef.current.push({
      type: "delete",
      logId,
      bookmark: {
        ...bookmark,
        title: entry.title,
        url: entry.url,
      },
      previousParentId: entry.previousParentId,
      previousIndex: entry.previousIndex,
    });
    setStats((s) => ({ ...s, deleted: s.deleted + 1 }));
  }

  async function restoreDeletedEntry(entry) {
    if (!entry.previousParentId) {
      throw new Error(copy.alerts.originalFolderUnknown);
    }
    const created = await browser.bookmarks.create({
      parentId: entry.previousParentId,
      title: entry.title,
      url: entry.url,
      index: entry.previousIndex,
    });
    return {
      id: created.id,
      title: entry.title,
      url: entry.url,
      parentId: entry.previousParentId,
      folderPath: entry.folderPath || "",
    };
  }

  async function undoDeleteFromList(logId) {
    if (busyRef.current) return;
    const entry = deletedItems.find((item) => item.logId === logId);
    if (!entry) return;

    setBusy(true);
    try {
      const restored = await restoreDeletedEntry(entry);
      forgetDeleted(logId);
      undoStackRef.current = undoStackRef.current.filter(
        (item) => item.logId !== logId,
      );
      if (activeRef.current) {
        setStats((s) => ({ ...s, deleted: Math.max(0, s.deleted - 1) }));
        setQueue((q) => [restored, ...q]);
      }
    } catch (error) {
      console.error(error);
      window.alert(copy.alerts.restoreFailed(error.message || error));
    } finally {
      setBusy(false);
    }
  }

  async function restoreAllDeleted() {
    if (busyRef.current || deletedItems.length === 0) return;
    setBusy(true);
    const pending = [...deletedItems];
    const restored = [];
    const remaining = [];

    try {
      for (const entry of pending) {
        try {
          restored.push(await restoreDeletedEntry(entry));
          undoStackRef.current = undoStackRef.current.filter(
            (item) => item.logId !== entry.logId,
          );
        } catch (error) {
          console.error(error);
          remaining.push(entry);
        }
      }

      setDeletedItems(remaining);

      if (activeRef.current && restored.length > 0) {
        setStats((s) => ({
          ...s,
          deleted: Math.max(0, s.deleted - restored.length),
        }));
        setQueue((q) => [...restored, ...q]);
      }

      if (remaining.length > 0) {
        window.alert(
          copy.alerts.restorePartial(restored.length, remaining.length),
        );
      }
    } finally {
      setBusy(false);
    }
  }

  function emptyTrash() {
    if (busyRef.current || deletedItems.length === 0) return;
    const confirmed = window.confirm(
      copy.trash.emptyConfirm(deletedItems.length),
    );
    if (!confirmed) return;

    const logIds = new Set(deletedItems.map((item) => item.logId));
    setDeletedItems([]);
    undoStackRef.current = undoStackRef.current.filter(
      (item) => !(item.type === "delete" && logIds.has(item.logId)),
    );
  }

  async function restoreMovedEntry(entry) {
    if (!entry.previousParentId) {
      throw new Error(copy.alerts.originalFolderUnknown);
    }
    await browser.bookmarks.move(entry.bookmarkId, {
      parentId: entry.previousParentId,
      index: entry.previousIndex,
    });
    return {
      id: entry.bookmarkId,
      title: entry.title,
      url: entry.url,
      parentId: entry.previousParentId,
      folderPath: entry.folderPath || "",
    };
  }

  async function undoMoveFromList(logId) {
    if (busyRef.current) return;
    const entry = movedItems.find((item) => item.logId === logId);
    if (!entry) return;

    setBusy(true);
    try {
      const restored = await restoreMovedEntry(entry);
      forgetMoved(logId);
      undoStackRef.current = undoStackRef.current.filter(
        (item) => item.logId !== logId,
      );
      if (activeRef.current) {
        setStats((s) => ({ ...s, moved: Math.max(0, s.moved - 1) }));
        setQueue((q) => [restored, ...q]);
      }
    } catch (error) {
      console.error(error);
      window.alert(copy.alerts.undoMoveFailed(error.message || error));
    } finally {
      setBusy(false);
    }
  }

  async function undoAllMoved() {
    if (busyRef.current || movedItems.length === 0) return;
    setBusy(true);
    const pending = [...movedItems];
    const restored = [];
    const remaining = [];

    try {
      for (const entry of pending) {
        try {
          restored.push(await restoreMovedEntry(entry));
          undoStackRef.current = undoStackRef.current.filter(
            (item) => item.logId !== entry.logId,
          );
        } catch (error) {
          console.error(error);
          remaining.push(entry);
        }
      }

      setMovedItems(remaining);

      if (activeRef.current && restored.length > 0) {
        setStats((s) => ({
          ...s,
          moved: Math.max(0, s.moved - restored.length),
        }));
        setQueue((q) => [...restored, ...q]);
      }

      if (remaining.length > 0) {
        window.alert(
          copy.alerts.undoMovePartial(restored.length, remaining.length),
        );
      }
    } finally {
      setBusy(false);
    }
  }

  function dismissMovedList() {
    if (busyRef.current || movedItems.length === 0) return;
    const confirmed = window.confirm(
      copy.moves.dismissConfirm(movedItems.length),
    );
    if (!confirmed) return;

    const logIds = new Set(movedItems.map((item) => item.logId));
    setMovedItems([]);
    undoStackRef.current = undoStackRef.current.filter(
      (item) => !(item.type === "file" && logIds.has(item.logId)),
    );
  }

  async function resolveAction(action) {
    if (busyRef.current || flyActionRef.current || queueRef.current.length === 0) {
      return;
    }

    const bookmark = queueRef.current[0];
    const dest = destRef.current;
    setBusy(true);

    let fly = action;

    try {
      if (action === "file") {
        const before = await browser.bookmarks.get(bookmark.id);
        await browser.bookmarks.move(bookmark.id, { parentId: dest });
        const logId = newLogId();
        const entry = {
          logId,
          bookmarkId: bookmark.id,
          title: bookmark.title,
          url: bookmark.url,
          previousParentId: before[0]?.parentId,
          previousIndex: before[0]?.index,
          folderPath: bookmark.folderPath || "",
          destinationParentId: dest,
          destinationPath: destinationLabel(dest, folders),
        };
        rememberMoved(entry);
        undoStackRef.current.push({
          type: "file",
          logId,
          bookmark,
          previousParentId: entry.previousParentId,
          previousIndex: entry.previousIndex,
        });
        setStats((s) => ({ ...s, moved: s.moved + 1 }));
      } else if (action === "delete") {
        await deleteBookmark(bookmark);
      } else {
        undoStackRef.current.push({ type: "skip", bookmark });
        setStats((s) => ({ ...s, kept: s.kept + 1 }));
      }

      setFlyAction(fly);
      await wait(280);
      setQueue((q) => q.slice(1));
      setFlyAction(null);
    } catch (error) {
      console.error(error);
      window.alert(
        copy.alerts.actionFailed(action, error.message || error),
      );
      setFlyAction(null);
    } finally {
      setBusy(false);
    }
  }

  async function undo() {
    if (busyRef.current || undoStackRef.current.length === 0) return;
    setBusy(true);
    const last = undoStackRef.current.pop();

    try {
      if (last.type === "file" && last.previousParentId) {
        await browser.bookmarks.move(last.bookmark.id, {
          parentId: last.previousParentId,
          index: last.previousIndex,
        });
        if (last.logId) forgetMoved(last.logId);
        setStats((s) => ({ ...s, moved: Math.max(0, s.moved - 1) }));
        setQueue((q) => [last.bookmark, ...q]);
      } else if (last.type === "delete" && last.previousParentId) {
        const created = await browser.bookmarks.create({
          parentId: last.previousParentId,
          title: last.bookmark.title,
          url: last.bookmark.url,
          index: last.previousIndex,
        });
        if (last.logId) forgetDeleted(last.logId);
        setStats((s) => ({ ...s, deleted: Math.max(0, s.deleted - 1) }));
        setQueue((q) => [
          { ...last.bookmark, id: created.id, parentId: last.previousParentId },
          ...q,
        ]);
      } else if (last.type === "skip") {
        setStats((s) => ({ ...s, kept: Math.max(0, s.kept - 1) }));
        setQueue((q) => [last.bookmark, ...q]);
      }
    } catch (error) {
      console.error(error);
      window.alert(copy.alerts.undoFailed(error.message || error));
      undoStackRef.current.push(last);
    } finally {
      setBusy(false);
    }
  }

  function resetToSetup() {
    setActive(false);
    setQueue([]);
    setFlyAction(null);
  }

  return (
    <div className="shell">
      {demoBanner}
      <header className="top">
        <div className="top-row">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true" />
            <h1>{copy.brand}</h1>
          </div>
          <div className="top-actions">
            {demoHeaderAction}
            {active ? (
              <button
                type="button"
                className="btn home"
                onClick={resetToSetup}
                disabled={busy}
                title={copy.home.titleTooltip}
              >
                {copy.home.title}
              </button>
            ) : null}
          </div>
        </div>
        <p className="tagline">
          {destIsTrash
            ? copy.tagline.trashDestination
            : copy.tagline.folderDestination}
        </p>
        {active ? (
          <p className="route" aria-label={copy.route.ariaLabel}>
            <span className="route-from">
              {sourceLabel(sourceFolderId, folders)}
            </span>
            <span className="route-arrow" aria-hidden="true">
              {copy.route.arrow}
            </span>
            <span className="route-to">
              {destinationLabel(destFolderId, folders)}
            </span>
          </p>
        ) : null}
      </header>

      {!active ? (
        <SetupPanel
          folders={folders}
          sourceFolderId={sourceFolderId}
          destFolderId={destFolderId}
          loading={loading}
          deletedItems={deletedItems}
          movedItems={movedItems}
          undoBusy={busy}
          onUndoDelete={undoDeleteFromList}
          onRestoreAll={restoreAllDeleted}
          onEmptyTrash={emptyTrash}
          onUndoMove={undoMoveFromList}
          onUndoAllMoves={undoAllMoved}
          onDismissMoved={dismissMovedList}
          onSourceChange={(value) => {
            setSourceFolderId(value);
            saveSettings(value, destFolderId);
          }}
          onDestChange={(value) => {
            setDestFolderId(value);
            saveSettings(sourceFolderId, value);
          }}
          onStart={startDeck}
        />
      ) : (
        <DeckStage
          queue={queue}
          stats={stats}
          busy={busy}
          flyAction={flyAction}
          destIsTrash={destIsTrash}
          deletedItems={deletedItems}
          movedItems={movedItems}
          onAction={resolveAction}
          onReset={resetToSetup}
          onUndoDelete={undoDeleteFromList}
          onRestoreAll={restoreAllDeleted}
          onEmptyTrash={emptyTrash}
          onUndoMove={undoMoveFromList}
          onUndoAllMoves={undoAllMoved}
          onDismissMoved={dismissMovedList}
        />
      )}
    </div>
  );
}
