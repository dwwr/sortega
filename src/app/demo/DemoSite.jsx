import { useEffect, useState } from "react";
import App from "../App.jsx";
import { DemoBanner, StorybookCta } from "../DemoExtras.jsx";
import { copy } from "../copy.js";
import { demoCopy } from "../demoCopy.js";
import { DemoFooter } from "./DemoChrome.jsx";
import { AboutPage, ContactPage, PrivacyPage } from "./LegalPages.jsx";
import { getRouteFromPath } from "./routing.js";

function useDemoRoute() {
  const [route, setRoute] = useState(() => getRouteFromPath());

  useEffect(() => {
    function sync() {
      setRoute(getRouteFromPath());
    }
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  return route;
}

function DemoHome() {
  const [deckActive, setDeckActive] = useState(false);

  return (
    <App
      demoBanner={deckActive ? null : <DemoBanner />}
      demoHeaderAction={<StorybookCta />}
      onActiveChange={setDeckActive}
    />
  );
}

export default function DemoSite() {
  const route = useDemoRoute();

  useEffect(() => {
    if (route === "about") document.title = demoCopy.about.documentTitle;
    else if (route === "privacy") document.title = demoCopy.privacy.documentTitle;
    else if (route === "contact") document.title = demoCopy.contact.documentTitle;
    else document.title = copy.documentTitle;
  }, [route]);

  let page = <DemoHome />;
  if (route === "about") page = <AboutPage />;
  else if (route === "privacy") page = <PrivacyPage />;
  else if (route === "contact") page = <ContactPage />;

  return (
    <div className="demo-site">
      {page}
      <DemoFooter />
    </div>
  );
}
