# Sortega

Swipe through browser bookmarks on **Chrome** and **Firefox** (desktop) — keep into a folder or delete, Tinder-style.

This repo serves two purposes:

1. **Browser extension** — one React source tree; a Vite build + packaging step emits Chrome and Firefox packages under `dist/chrome` and `dist/firefox`.
2. **Hostable demo showcase** — the same UI with mock bookmarks, a demo banner, and an **Open Storybook** link (same pattern as [earf-quake](https://github.com/dwwr/earf-quake) / [ca-llc-field-manual](https://github.com/dwwr/ca-llc-field-manual)). Demo-only chrome lives in a separate Vite entry (`main-demo.jsx`) and never ships in the extension packages.

## Requirements

- Node.js 18+
- Chrome or Chromium desktop, and/or Firefox desktop (121+)

## Setup

```bash
npm install
```

## Extension builds

```bash
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

## Demo showcase (hostable)

Local UI preview with mock bookmarks (no real extension APIs):

```bash
npm run dev
```

Open the Local URL Vite prints (e.g. `http://localhost:5173/`). You’ll see a demo banner and an amber **Open Storybook** pill. Run `npm run storybook` in a second terminal — the pill opens Storybook at `http://localhost:6006/` (Storybook’s Vite preview cannot be proxied under `/storybook/` in dev).

Production static site (app + nested Storybook):

```bash
npm run build:demo
```

Output: `dist/demo/` (index + assets) and `dist/demo/storybook/`. Host that folder on any static host (GitHub Pages, Netlify, S3, etc.). Preview locally:

```bash
npm run preview:demo
```

Demo-only UI (banner, Storybook CTA, footer, About / Privacy / Contact) is **not** included in extension builds. Optional public contact email: copy `.env.example` → `.env` and set `VITE_CONTACT_EMAIL` when building the demo.

### Storybook alone

```bash
npm run storybook
```

Component stories for `BookmarkCard`, `SetupPanel`, `DeletedList`, and `DeckStage` (fixtures under `src/app/stories/`).

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
    copy.js               # all user-facing strings
    demoCopy.js / demo.css / DemoExtras.jsx / main-demo.jsx  # demo-only
    demo/                   # demo site shell, footer, legal pages
    demo.html             # demo Vite entry (→ index.html in dist/demo)
    lib/
      browser-mock.js     # mock bookmarks for demo / Storybook
    styles.css
.storybook/               # Storybook config
vite.config.js            # demo vs extension modes
scripts/build.mjs         # extension packages
scripts/build-demo.mjs    # hostable demo + storybook
dist/chrome|firefox/      # extension packages (gitignored)
dist/demo/                # static demo site (gitignored)
```

Cross-browser API calls go through [`webextension-polyfill`](https://github.com/mozilla/webextension-polyfill) (bundled into the React app; also loaded for the background script on Firefox). Demo / `npm run dev` alias the polyfill to the mock and boot via `main-demo.jsx` (banner + Storybook CTA). Extension builds use `main.jsx` only — no demo UI or CSS.

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
- Deleting bookmarks is real in the extension; use **Esc** undo during the session if you mis-swipe.
- Change the Firefox add-on id in `src/manifest.base.json` before publishing to AMO.
