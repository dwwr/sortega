import { useEffect, useRef, useState } from "react";
import browser from "webextension-polyfill";
import SetupPanel from "./components/SetupPanel.jsx";
import DeckStage from "./components/DeckStage.jsx";
import {
  STORAGE_KEY,
  DEST_TRASH,
  bookmarksForSource,
  destinationLabel,
  flattenBookmarks,
  isTrashDestination,
  shuffle,
  sourceLabel,
  wait,
} from "./lib/bookmarks.js";

const emptyStats = { filed: 0, deleted: 0, skipped: 0 };

export default function App() {
  const [folders, setFolders] = useState([]);
  const [sourceFolderId, setSourceFolderId] = useState("all");
  const [destFolderId, setDestFolderId] = useState(DEST_TRASH);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(false);
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState(emptyStats);
  const [busy, setBusy] = useState(false);
  const [flyAction, setFlyAction] = useState(null);

  const undoStackRef = useRef([]);
  const queueRef = useRef(queue);
  const busyRef = useRef(busy);
  const activeRef = useRef(active);
  const destRef = useRef(destFolderId);
  const flyActionRef = useRef(flyAction);

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

        const saved = await browser.storage.local.get(STORAGE_KEY);
        const settings = saved[STORAGE_KEY] || {};
        const sourceOk =
          settings.sourceFolderId === "all" ||
          flat.folders.some((f) => f.id === settings.sourceFolderId);
        const destOk =
          isTrashDestination(settings.destFolderId) ||
          flat.folders.some((f) => f.id === settings.destFolderId);

        setSourceFolderId(sourceOk ? settings.sourceFolderId : "all");
        setDestFolderId(destOk ? settings.destFolderId : DEST_TRASH);
      } catch (error) {
        console.error(error);
        window.alert(`Could not load bookmarks: ${error.message || error}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTree();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event) {
      if (!activeRef.current) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (!isTrashDestination(destRef.current)) {
          resolveAction("delete");
        }
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        resolveAction("file");
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
        window.alert("Pick a destination.");
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
      window.alert(`Failed to start: ${error.message || error}`);
    }
  }

  async function deleteBookmark(bookmark) {
    const before = await browser.bookmarks.get(bookmark.id);
    await browser.bookmarks.remove(bookmark.id);
    undoStackRef.current.push({
      type: "delete",
      bookmark: {
        ...bookmark,
        title: before[0]?.title || bookmark.title,
        url: before[0]?.url || bookmark.url,
      },
      previousParentId: before[0]?.parentId,
      previousIndex: before[0]?.index,
    });
    setStats((s) => ({ ...s, deleted: s.deleted + 1 }));
  }

  async function resolveAction(action) {
    if (busyRef.current || flyActionRef.current || queueRef.current.length === 0) {
      return;
    }

    const bookmark = queueRef.current[0];
    const dest = destRef.current;
    const trashDest = isTrashDestination(dest);
    setBusy(true);

    // Keep fly direction aligned with the gesture/button, even when
    // destination Trash turns a "file" action into a delete.
    let fly = action;

    try {
      if (action === "file") {
        if (trashDest) {
          await deleteBookmark(bookmark);
        } else {
          const before = await browser.bookmarks.get(bookmark.id);
          await browser.bookmarks.move(bookmark.id, { parentId: dest });
          undoStackRef.current.push({
            type: "file",
            bookmark,
            previousParentId: before[0]?.parentId,
            previousIndex: before[0]?.index,
          });
          setStats((s) => ({ ...s, filed: s.filed + 1 }));
        }
      } else if (action === "delete") {
        await deleteBookmark(bookmark);
      } else {
        undoStackRef.current.push({ type: "skip", bookmark });
        setStats((s) => ({ ...s, skipped: s.skipped + 1 }));
      }

      setFlyAction(fly);
      await wait(280);
      setQueue((q) => q.slice(1));
      setFlyAction(null);
    } catch (error) {
      console.error(error);
      window.alert(`Could not ${action} bookmark: ${error.message || error}`);
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
        setStats((s) => ({ ...s, filed: Math.max(0, s.filed - 1) }));
        setQueue((q) => [last.bookmark, ...q]);
      } else if (last.type === "delete" && last.previousParentId) {
        const created = await browser.bookmarks.create({
          parentId: last.previousParentId,
          title: last.bookmark.title,
          url: last.bookmark.url,
          index: last.previousIndex,
        });
        setStats((s) => ({ ...s, deleted: Math.max(0, s.deleted - 1) }));
        setQueue((q) => [
          { ...last.bookmark, id: created.id, parentId: last.previousParentId },
          ...q,
        ]);
      } else if (last.type === "skip") {
        setStats((s) => ({ ...s, skipped: Math.max(0, s.skipped - 1) }));
        setQueue((q) => [last.bookmark, ...q]);
      }
    } catch (error) {
      console.error(error);
      window.alert(`Undo failed: ${error.message || error}`);
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
      <header className="top">
        <div className="top-row">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true" />
            <h1>Sortega</h1>
          </div>
          {active ? (
            <button
              type="button"
              className="btn home"
              onClick={resetToSetup}
              disabled={busy}
              title="Back to start"
            >
              Home
            </button>
          ) : null}
        </div>
        <p className="tagline">
          {destIsTrash
            ? "Swipe right to delete · down to skip"
            : "Swipe left to delete · right to file"}
        </p>
        {active ? (
          <p className="route" aria-label="Session path">
            <span className="route-from">
              {sourceLabel(sourceFolderId, folders)}
            </span>
            <span className="route-arrow" aria-hidden="true">
              →
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
          onAction={resolveAction}
          onReset={resetToSetup}
        />
      )}
    </div>
  );
}
