import "./demo.css";
import { demoCopy } from "./demoCopy.js";

export function DemoBanner() {
  return (
    <aside className="demo-banner" role="note">
      <p className="demo-banner-title">{demoCopy.bannerTitle}</p>
      <p className="demo-banner-body">{demoCopy.bannerBody}</p>
    </aside>
  );
}

export function StorybookCta() {
  // Dev: Storybook’s iframe loads /@vite/* absolute URLs, so a /storybook
  // proxy on the demo Vite server leaves the preview spinning forever.
  const href = import.meta.env.DEV
    ? demoCopy.storybookDevHref
    : demoCopy.storybookHref;

  return (
    <a
      className="storybook-cta"
      href={href}
      {...(import.meta.env.DEV
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {demoCopy.storybookCta}
    </a>
  );
}
