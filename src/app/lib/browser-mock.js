/**
 * In-memory browser.bookmarks / storage stand-in for `vite` (npm run dev).
 * Production builds still use webextension-polyfill.
 */

const folders = [
  { id: "1", title: "Bookmarks Bar", parentId: "0" },
  { id: "2", title: "Keep", parentId: "1" },
  { id: "3", title: "Later", parentId: "1" },
  { id: "4", title: "Other Bookmarks", parentId: "0" },
];

const bookmarks = [
  {
    id: "10",
    title: "MDN Web Docs",
    url: "https://developer.mozilla.org/",
    parentId: "1",
  },
  {
    id: "11",
    title: "React",
    url: "https://react.dev/",
    parentId: "1",
  },
  {
    id: "12",
    title: "Vite",
    url: "https://vite.dev/",
    parentId: "2",
  },
  {
    id: "13",
    title: "Firefox Extension Workshop",
    url: "https://extensionworkshop.com/",
    parentId: "2",
  },
  {
    id: "14",
    title: "Chrome Extensions",
    url: "https://developer.chrome.com/docs/extensions",
    parentId: "3",
  },
  {
    id: "15",
    title: "CSS-Tricks",
    url: "https://css-tricks.com/",
    parentId: "4",
  },
];

let nextId = 100;
const memoryStorage = {};

function childrenOf(parentId) {
  const kids = [
    ...folders.filter((f) => f.parentId === parentId).map((f) => ({ ...f })),
    ...bookmarks.filter((b) => b.parentId === parentId).map((b) => ({ ...b })),
  ];
  for (const kid of kids) {
    if (!kid.url) {
      kid.children = childrenOf(kid.id);
    }
  }
  return kids;
}

function getTree() {
  return [
    {
      id: "0",
      title: "",
      children: childrenOf("0"),
    },
  ];
}

function findBookmark(id) {
  return bookmarks.find((b) => b.id === id) || folders.find((f) => f.id === id);
}

const browser = {
  bookmarks: {
    async getTree() {
      return getTree();
    },
    async get(idOrIds) {
      const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
      return ids.map((id) => {
        const node = findBookmark(id);
        if (!node) throw new Error(`Bookmark not found: ${id}`);
        return { ...node };
      });
    },
    async move(id, destination) {
      const node = findBookmark(id);
      if (!node) throw new Error(`Bookmark not found: ${id}`);
      if (destination.parentId != null) node.parentId = destination.parentId;
      if (destination.index != null) node.index = destination.index;
      return { ...node };
    },
    async remove(id) {
      const index = bookmarks.findIndex((b) => b.id === id);
      if (index === -1) throw new Error(`Bookmark not found: ${id}`);
      bookmarks.splice(index, 1);
    },
    async create(details) {
      const node = {
        id: String(nextId++),
        title: details.title || details.url || "Untitled",
        url: details.url,
        parentId: details.parentId || "1",
        index: details.index,
      };
      bookmarks.push(node);
      return { ...node };
    },
  },
  storage: {
    local: {
      async get(keys) {
        if (keys == null) return { ...memoryStorage };
        if (typeof keys === "string") {
          return keys in memoryStorage ? { [keys]: memoryStorage[keys] } : {};
        }
        if (Array.isArray(keys)) {
          const out = {};
          for (const key of keys) {
            if (key in memoryStorage) out[key] = memoryStorage[key];
          }
          return out;
        }
        const out = { ...keys };
        for (const key of Object.keys(keys)) {
          if (key in memoryStorage) out[key] = memoryStorage[key];
        }
        return out;
      },
      async set(items) {
        Object.assign(memoryStorage, items);
      },
    },
  },
};

export default browser;
