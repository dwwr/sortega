# Sortega

Swipe through browser bookmarks on **Chrome** and **Firefox** (desktop) — file into a folder or delete, Tinder-style.

One React source tree; a Vite build + packaging step emits browser-specific packages under `dist/`.

## Requirements

- Node.js 18+
- Chrome or Chromium desktop, and/or Firefox desktop (121+)

## Setup

```bash
npm install
npm run build
```

This writes:

- `dist/chrome/` — load in Chrome
- `dist/firefox/` — load in Firefox

Build only one target:

```bash
npm run build:chrome
npm run build:firefox
```

### Chrome watch loop (recommended while iterating)

```bash
npm run watch:chrome
```

This packages `dist/chrome` once, then rebuilds the React app into `dist/chrome/app` on save (and copies `background.js` when it changes).

1. Load unpacked once from `dist/chrome`
2. After UI edits: refresh the Sortega tab (`Cmd/Ctrl+R`)
3. After background / icon / manifest edits: click **Reload** on `chrome://extensions` (re-run `watch:chrome` or `build:chrome` if icons/manifest changed)

UI-only Vite preview with mock bookmarks (no real extension APIs):

```bash
npm run dev
```

Open the Local URL Vite prints (e.g. `http://localhost:5173/`). The page uses fake bookmarks so layout/swipe work in a normal browser. For real bookmarks, use `watch:chrome` / a packed extension instead.

### Storybook

```bash
npm run storybook
```

Opens component stories for `BookmarkCard`, `SetupPanel`, `DeletedList`, and `DeckStage` (with shared fixtures under `src/app/stories/`).

## Load unpacked (Chrome)

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select `dist/chrome`
4. Click the Sortega toolbar icon (pin it if needed)

## Load temporary add-on (Firefox)

1. Open `about:debugging#/runtime/this-firefox`
2. **Load Temporary Add-on…**
3. Select `dist/firefox/manifest.json`
4. Click the Sortega toolbar icon

> Temporary Firefox add-ons are removed when Firefox restarts. For longer testing, use `web-ext run` from `dist/firefox` or sign/package later for AMO.

## How to use

1. Choose a **From** folder (or all bookmarks)
2. Choose **Destination** — `Trash (delete)` (default) or a folder for right-swipes
3. **Start deck**
4. For each card:
   - **→** — send to destination (delete if Trash, otherwise move into the folder)
   - **← / Delete** — delete (only shown when destination is a folder)
   - **↓ / Skip** — leave it where it is and go to the next
   - **Esc** — undo the last action in this session

Each card shows a large site favicon, title, and URL (open the link to inspect the page).

The UI follows a macOS Tahoe–inspired **Liquid Glass** look: translucent bubbly panels, soft specular edges, and a colorful mesh backdrop (with reduced-transparency / reduced-motion fallbacks).

Deleted bookmarks accumulate in **Trash** (home and swipe screens) with per-item **Restore**, plus **Restore all** and **Empty trash**. Restore puts bookmarks back in their original folder.

## Project layout

```
src/
  manifest.base.json      # shared manifest fields
  background.js           # toolbar click → open app tab
  icons/
  app/                    # React swipe UI (Vite root)
    main.jsx
    App.jsx
    components/           # UI + *.stories.jsx
    stories/fixtures.js
    lib/
    styles.css
.storybook/               # Storybook config
vite.config.js
scripts/build.mjs         # Vite bundle + per-browser package
dist/chrome|firefox/      # generated packages (gitignored)
```

Cross-browser API calls go through [`webextension-polyfill`](https://github.com/mozilla/webextension-polyfill) (bundled into the React app; also loaded for the background script on Firefox).

Manifest differences handled at build time:

| | Chrome | Firefox |
|---|---|---|
| Background | `service_worker` | `scripts` (polyfill + background) |
| Extension id | omitted | `browser_specific_settings.gecko.id` |

## Permissions

- `bookmarks` — read, move, delete
- `storage` — remember last folder choices
- `tabs` — open/focus the Sortega tab

## Notes

- Desktop only for now. Mobile browsers do not expose a usable bookmarks API for this flow.
- Deleting bookmarks is real; use **Esc** undo during the session if you mis-swipe.
- Change the Firefox add-on id in `src/manifest.base.json` before publishing to AMO.
