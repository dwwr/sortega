/** Demo-only copy — imported only by demo UI modules. */

export const demoCopy = {
  brand: "Sortega",
  homeHref: "/",
  storybookCta: "Open Storybook",
  // Production static nest. In `npm run dev`, StorybookCta uses localhost:6006
  // (Vite absolute module URLs cannot be proxied under /storybook/).
  storybookHref: "/storybook/",
  storybookDevHref: "http://localhost:6006/",
  githubHref: "https://github.com/dwwr/sortega",
  githubLabel: "GitHub",

  bannerTitle: "Demo showcase",
  bannerBody:
    "This page demos the Sortega extension UI in a browser. It uses mock bookmark data — not your real browser bookmarks. Install the Chrome or Firefox extension to manage real bookmarks.",

  footer: {
    note: "UI demo of the Sortega browser extension",
    legalAria: "About and legal",
    legalNav: [
      { href: "/about", label: "About" },
      { href: "/privacy", label: "Privacy" },
      { href: "/contact", label: "Contact" },
    ],
  },

  about: {
    documentTitle: "About · Sortega",
    title: "About Sortega",
    lede: "A Chrome and Firefox extension for swiping through bookmarks — keep them into a folder, delete them, or skip — shown here as a hostable UI demo with mock data.",
    sections: [
      {
        id: "what",
        heading: "What this is",
        paragraphs: [
          "Sortega is a desktop browser extension. You pick a From folder and a Destination (Trash or a folder), then swipe through bookmarks Tinder-style: keep, delete, or skip, with session undo.",
          "This website is a showcase of that React UI. It uses mock bookmarks so you can try the flow without installing anything or touching your real library.",
        ],
      },
      {
        id: "extension",
        heading: "The real extension",
        paragraphs: [
          "The same source tree builds packages for Chrome and Firefox. Those builds talk to the real bookmarks API — no demo banner, no Storybook link, no mock data.",
          "Build instructions and load-unpacked steps live in the project README on GitHub.",
        ],
      },
      {
        id: "storybook",
        heading: "Component Storybook",
        paragraphs: [
          "Open Storybook from the amber pill on the demo home page for isolated BookmarkCard, SetupPanel, DeletedList, and DeckStage stories.",
        ],
      },
    ],
  },

  privacy: {
    documentTitle: "Privacy · Sortega",
    title: "Privacy policy",
    lede: "This demo has no accounts and does not ask for personal details. It does not run ads or third-party analytics.",
    sections: [
      {
        id: "collect",
        heading: "What we collect",
        paragraphs: [
          "There is no login, mailing list, or server-side profile. Folder choices and trash state in this demo stay in your browser session (and, if you use them, the mock storage layer) — not your real browser bookmarks.",
          "The host and ordinary HTTP requests may produce technical logs — IP address, user agent, pages requested — used to run and debug the site. We do not sell those logs.",
        ],
      },
      {
        id: "ads",
        heading: "Advertising and analytics",
        paragraphs: [
          "This demo does not use Google AdSense, Google Analytics, or other advertising or analytics products.",
        ],
      },
      {
        id: "cookies",
        heading: "Cookies",
        paragraphs: [
          "This demo does not set first-party tracking cookies. Your browser may still store ordinary session or local data for the mock UI.",
        ],
      },
      {
        id: "children",
        heading: "Children",
        paragraphs: [
          "This site is a general product demo. It is not directed at children under 13.",
        ],
      },
      {
        id: "changes",
        heading: "Changes",
        paragraphs: [
          "If this policy changes, the date on this page will change. Last updated August 2026.",
        ],
      },
    ],
    contactBefore: "Questions about privacy: ",
    contactLink: "Contact",
    contactHref: "/contact",
    contactAfter: ".",
  },

  contact: {
    documentTitle: "Contact · Sortega",
    title: "Contact",
    lede: "Corrections and questions about the Sortega demo or extension are welcome. This is not a place for urgent browser-support emergencies.",
    sections: [
      {
        id: "reach",
        heading: "How to reach the author",
        paragraphs: [
          "If the UI misstates behavior, a link is wrong, or something in the demo looks broken, say so. For bugs and patches, GitHub issues are the best trail.",
        ],
      },
    ],
    emailLineBefore: "Email ",
    emailLineAfter: ". Do not send anything you would not put on a postcard.",
    noEmailBefore: "No public email is configured yet. Open an issue on ",
    githubBefore: "You can also open an issue on ",
    githubLinkLabel: "GitHub",
    afterLink: ".",
  },
};
