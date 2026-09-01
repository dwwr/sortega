/**
 * All user-facing copy for Sortega.
 * Edit strings here — components import from this file.
 */

export const copy = {
  brand: "Sortega",
  documentTitle: "Sortega",

  home: {
    title: "Home",
    titleTooltip: "Back to start",
  },

  tagline: {
    trashDestination: "Swipe left to delete · right to keep",
    folderDestination: "Swipe left to stay · right to move",
  },

  route: {
    ariaLabel: "Session path",
    arrow: "→",
  },

  setup: {
    ariaLabel: "Session setup",
    fromLabel: "From",
    destinationLabel: "Destination",
    allBookmarks: "All bookmarks",
    trashOption: "Trash (delete)",
    startDeck: "Start deck",
  },

  folders: {
    allBookmarks: "All bookmarks",
    trashOption: "Trash (delete)",
    unknown: "Unknown folder",
    rootFallback: "Bookmarks",
    untitledFolder: "Folder",
  },

  deck: {
    left: (n) => `${n} left`,
    stats: (filed, deleted, skipped) =>
      `${filed} filed · ${deleted} deleted · ${skipped} skipped`,
    emptyTitle: "Deck clear.",
    backToSetup: "Back to setup",
    delete: "Delete",
    deleteTooltip: "Delete (←)",
    keep: "Keep",
    keepTooltip: "Keep (→)",
    stay: "Stay",
    stayTooltip: "Stay (←)",
    move: "Move",
    moveTooltip: "Move (→)",
    skip: "Skip",
    skipTooltip: "Skip (↓)",
    file: "Keep",
    sendTooltip: (label) => `${label} (→)`,
    hint: "Drag the card, use the buttons, or arrow keys. Esc undoes the last action.",
  },

  card: {
    stampTrash: "Trash",
    stampKeep: "Keep",
    stampStay: "Stay",
    stampMove: "Move",
    stampFile: "Keep",
    stampDelete: "Delete",
    unknownHostInitial: "?",
  },

  trash: {
    title: "Trash",
    ariaLabel: "Trash",
    restoreAll: "Restore all",
    restoreAllTooltip: "Restore every item to its original folder",
    emptyTrash: "Empty trash",
    emptyTrashTooltip: "Permanently clear this list",
    restore: "Restore",
    restoreTooltip: "Restore to original folder",
    emptyConfirm: (count) =>
      `Empty trash? This clears ${count} item(s) from the list. Bookmarks already removed stay deleted.`,
  },

  alerts: {
    loadBookmarksFailed: (detail) => `Could not load bookmarks: ${detail}`,
    pickDestination: "Pick a destination.",
    startFailed: (detail) => `Failed to start: ${detail}`,
    actionFailed: (action, detail) => `Could not ${action} bookmark: ${detail}`,
    undoFailed: (detail) => `Undo failed: ${detail}`,
    restoreFailed: (detail) => `Restore failed: ${detail}`,
    restorePartial: (ok, failed) =>
      `Restored ${ok}, but ${failed} failed.`,
    originalFolderUnknown: "Original folder is unknown.",
  },
};
