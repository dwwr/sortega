import { demoCopy } from "../demoCopy.js";
import { getContactEmail } from "./routing.js";
import { DemoLink, DemoSiteHeader } from "./DemoChrome.jsx";

export function LegalPage({ title, lede, sections, after }) {
  return (
    <div className="demo-legal">
      <DemoSiteHeader />
      <main className="demo-legal-main">
        <section className="demo-legal-intro">
          <h1>{title}</h1>
          <p className="demo-legal-lede">{lede}</p>
        </section>
        <div className="demo-legal-sections">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="demo-legal-section"
            >
              <h2>{section.heading}</h2>
              <div className="demo-legal-copy">
                {section.paragraphs.map((paragraph, index) => (
                  <p key={`${section.id}-${index}`}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
          {after}
        </div>
      </main>
    </div>
  );
}

export function AboutPage() {
  return (
    <LegalPage
      title={demoCopy.about.title}
      lede={demoCopy.about.lede}
      sections={demoCopy.about.sections}
    />
  );
}

export function PrivacyPage() {
  return (
    <LegalPage
      title={demoCopy.privacy.title}
      lede={demoCopy.privacy.lede}
      sections={demoCopy.privacy.sections}
      after={
        <section id="contact" className="demo-legal-section">
          <h2>Contact</h2>
          <div className="demo-legal-copy">
            <p>
              {demoCopy.privacy.contactBefore}
              <DemoLink
                className="demo-text-link"
                href={demoCopy.privacy.contactHref}
              >
                {demoCopy.privacy.contactLink}
              </DemoLink>
              {demoCopy.privacy.contactAfter}
            </p>
          </div>
        </section>
      }
    />
  );
}

export function ContactPage() {
  const email = getContactEmail();

  return (
    <LegalPage
      title={demoCopy.contact.title}
      lede={demoCopy.contact.lede}
      sections={demoCopy.contact.sections}
      after={
        <div className="demo-legal-copy demo-contact-after">
          {email ? (
            <>
              <p>
                {demoCopy.contact.emailLineBefore}
                <a className="demo-text-link" href={`mailto:${email}`}>
                  {email}
                </a>
                {demoCopy.contact.emailLineAfter}
              </p>
              <p>
                {demoCopy.contact.githubBefore}
                <a
                  className="demo-text-link"
                  href={demoCopy.githubHref}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {demoCopy.contact.githubLinkLabel}
                </a>
                {demoCopy.contact.afterLink}
              </p>
            </>
          ) : (
            <p>
              {demoCopy.contact.noEmailBefore}
              <a
                className="demo-text-link"
                href={demoCopy.githubHref}
                rel="noopener noreferrer"
                target="_blank"
              >
                {demoCopy.contact.githubLinkLabel}
              </a>
              {demoCopy.contact.afterLink}
            </p>
          )}
        </div>
      }
    />
  );
}
