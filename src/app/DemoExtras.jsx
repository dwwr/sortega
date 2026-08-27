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
  return (
    <a className="storybook-cta" href={demoCopy.storybookHref}>
      {demoCopy.storybookCta}
    </a>
  );
}
