import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { DemoBanner, StorybookCta } from "./DemoExtras.jsx";
import { copy } from "./copy.js";
import "./styles.css";

document.title = copy.documentTitle;

function DemoRoot() {
  const [deckActive, setDeckActive] = useState(false);

  return (
    <App
      demoBanner={deckActive ? null : <DemoBanner />}
      demoHeaderAction={<StorybookCta />}
      onActiveChange={setDeckActive}
    />
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <DemoRoot />
  </StrictMode>,
);
