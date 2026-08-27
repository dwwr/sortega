import { demoCopy } from "../demoCopy.js";
import { StorybookCta } from "../DemoExtras.jsx";
import { navigateDemo } from "./routing.js";

function DemoLink({ href, className, children, ...rest }) {
  return (
    <a
      {...rest}
      className={className}
      href={href}
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }
        event.preventDefault();
        navigateDemo(href);
      }}
    >
      {children}
    </a>
  );
}

export function DemoSiteHeader({ showStorybook = true }) {
  return (
    <header className="demo-site-header">
      <DemoLink className="demo-site-brand" href={demoCopy.homeHref}>
        {demoCopy.brand}
      </DemoLink>
      {showStorybook ? <StorybookCta /> : null}
    </header>
  );
}

export function DemoFooter() {
  return (
    <footer className="demo-footer">
      <div className="demo-footer-inner">
        <div className="demo-footer-row">
          <p>{demoCopy.footer.note}</p>
          <p>
            <a
              className="demo-footer-link"
              href={demoCopy.githubHref}
              rel="noopener noreferrer"
              target="_blank"
            >
              {demoCopy.githubLabel}
            </a>
          </p>
        </div>
        <nav
          className="demo-footer-nav"
          aria-label={demoCopy.footer.legalAria}
        >
          {demoCopy.footer.legalNav.map((item) => (
            <DemoLink key={item.href} className="demo-footer-link" href={item.href}>
              {item.label}
            </DemoLink>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export { DemoLink };
