/**
 * Light or dark colors for this browser. Kept apart from the fitness data,
 * so Reset demo data does not change it.
 * Browser only, except `themeScript`, which the root layout puts in <head>.
 */

export const themes = ["light", "dark", "system"] as const;
export type Theme = (typeof themes)[number];

export const themeLabels: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

const THEME_KEY = "pulse:theme";
const THEME_EVENT = "pulse:theme-change";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/** `system` is stored as no key at all. */
export function readTheme(): Theme {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

export function applyTheme(theme: Theme) {
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia(DARK_QUERY).matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function saveTheme(theme: Theme) {
  try {
    if (theme === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Private mode or a full quota. The theme still applies until the page reloads.
  }
  applyTheme(theme);
  window.dispatchEvent(new Event(THEME_EVENT));
}

/** Fires on a change in this tab, in another tab, or in the system setting. */
export function subscribeTheme(onChange: () => void) {
  const media = window.matchMedia(DARK_QUERY);
  function onStorage(event: StorageEvent) {
    if (event.key === THEME_KEY || event.key === null) onChange();
  }
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  media.addEventListener("change", onChange);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
    media.removeEventListener("change", onChange);
  };
}

/** Same rule as `readTheme` and `applyTheme`, as plain ES5 that runs before the first paint. */
export const themeScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});var d=t==="dark"||(t!=="light"&&matchMedia(${JSON.stringify(DARK_QUERY)}).matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;
