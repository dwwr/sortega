import { demoCopy } from "../demoCopy.js";

const LEGAL_ROUTES = new Set(["about", "privacy", "contact"]);

/** Optional public contact email (`VITE_CONTACT_EMAIL`). */
export function getContactEmail() {
  const value = import.meta.env.VITE_CONTACT_EMAIL?.trim();
  return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : undefined;
}

export function getRouteFromPath(pathname = window.location.pathname) {
  const cleaned = pathname.replace(/\/+$/, "") || "/";
  const segment = cleaned.split("/").filter(Boolean).pop() || "";
  const name = segment.replace(/\.html$/i, "");
  if (LEGAL_ROUTES.has(name)) return name;
  return "home";
}

export function pathForRoute(route) {
  if (route === "home") return demoCopy.homeHref;
  return `/${route}`;
}

export function navigateDemo(href) {
  if (window.location.pathname === href) {
    window.dispatchEvent(new PopStateEvent("popstate"));
    return;
  }
  window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo(0, 0);
}
