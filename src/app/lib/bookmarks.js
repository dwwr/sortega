import { copy } from "../copy.js";

export const STORAGE_KEY = "sortega.settings.v1";
export const DELETED_STORAGE_KEY = "sortega.deleted.v1";
export const MOVED_STORAGE_KEY = "sortega.moved.v1";
export const SWIPE_THRESHOLD = 120;
/** Sentinel destination id — not a real bookmark folder. */
export const DEST_TRASH = "__trash__";

export function isTrashDestination(destId) {
  return destId === DEST_TRASH;
}

export function sourceLabel(sourceId, folders) {
  if (sourceId === "all") return copy.folders.allBookmarks;
  return folders.find((f) => f.id === sourceId)?.path || copy.folders.unknown;
}

export function destinationLabel(destId, folders) {
  if (isTrashDestination(destId)) return copy.folders.trashOption;
  return folders.find((f) => f.id === destId)?.path || copy.folders.unknown;
}


export function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function faviconUrl(url) {
  const host = hostnameOf(url);
  if (!host) return "";
  // Request a large bitmap; the card displays it at 128px.
  return `https://www.google.com/s2/favicons?sz=256&domain=${encodeURIComponent(host)}`;
}

export function flattenBookmarks(
  nodes,
  folderPath = "",
  folderId = "",
  out = [],
  folderList = [],
) {
  for (const node of nodes) {
    if (node.url) {
      out.push({
        id: node.id,
        title: node.title || node.url,
        url: node.url,
        parentId: node.parentId || folderId,
        folderPath: folderPath || copy.folders.rootFallback,
      });
    } else if (node.children) {
      const path = folderPath
        ? `${folderPath} / ${node.title}`
        : node.title || copy.folders.rootFallback;
      folderList.push({
        id: node.id,
        title: node.title || copy.folders.untitledFolder,
        path,
      });
      flattenBookmarks(node.children, path, node.id, out, folderList);
    }
  }
  return { bookmarks: out, folders: folderList };
}

export function bookmarksForSource(allBookmarks, folders, sourceId) {
  if (sourceId === "all") return allBookmarks.slice();
  return allBookmarks.filter((b) => {
    if (b.parentId === sourceId) return true;
    const folder = folders.find((f) => f.id === sourceId);
    if (!folder) return false;
    return (
      b.folderPath === folder.path ||
      b.folderPath.startsWith(`${folder.path} /`)
    );
  });
}

export function shuffle(items) {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
