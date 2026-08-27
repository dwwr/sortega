import { DEST_TRASH } from "../lib/bookmarks.js";

export const folders = [
  { id: "1", title: "Bookmarks Bar", path: "Bookmarks Bar" },
  { id: "2", title: "Keep", path: "Bookmarks Bar / Keep" },
  { id: "3", title: "Later", path: "Bookmarks Bar / Later" },
  { id: "4", title: "Other Bookmarks", path: "Other Bookmarks" },
];

export const bookmarkReact = {
  id: "11",
  title: "React",
  url: "https://react.dev/",
  parentId: "1",
  folderPath: "Bookmarks Bar",
};

export const bookmarkChrome = {
  id: "14",
  title: "Chrome Extensions",
  url: "https://developer.chrome.com/docs/extensions",
  parentId: "3",
  folderPath: "Bookmarks Bar / Later",
};

export const bookmarkVite = {
  id: "12",
  title: "Vite",
  url: "https://vite.dev/",
  parentId: "2",
  folderPath: "Bookmarks Bar / Keep",
};

export const queue = [bookmarkChrome, bookmarkReact, bookmarkVite];

export const deletedItems = [
  {
    logId: "log-1",
    title: "React",
    url: "https://react.dev/",
    previousParentId: "1",
    previousIndex: 0,
    folderPath: "Bookmarks Bar",
  },
  {
    logId: "log-2",
    title: "Vite",
    url: "https://vite.dev/",
    previousParentId: "2",
    previousIndex: 1,
    folderPath: "Bookmarks Bar / Keep",
  },
  {
    logId: "log-3",
    title: "Firefox Extension Workshop",
    url: "https://extensionworkshop.com/",
    previousParentId: "2",
    previousIndex: 2,
    folderPath: "Bookmarks Bar / Keep",
  },
];

export const setupDefaults = {
  folders,
  sourceFolderId: "all",
  destFolderId: DEST_TRASH,
  loading: false,
  deletedItems: [],
  undoBusy: false,
};

export const deckDefaults = {
  queue,
  stats: { filed: 1, deleted: 2, skipped: 0 },
  busy: false,
  flyAction: null,
  destIsTrash: true,
  deletedItems,
};
