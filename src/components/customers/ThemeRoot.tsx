"use client";

// Light / Dark / System theme for the Customers module.
// The choice is saved in localStorage (a per-browser convenience, safe to lose).

import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from "react";

export type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "medizone-theme";
const CHANGE_EVENT = "medizone-theme-change";

function readPreference(): ThemePreference {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

function systemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    media.removeEventListener("change", onChange);
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

// Snapshot is a string so React can compare it cheaply: "<preference>:<resolved>".
function getSnapshot(): string {
  const preference = readPreference();
  return `${preference}:${preference === "system" ? systemTheme() : preference}`;
}

function getServerSnapshot(): string {
  return "system:";
}

// Runs while the HTML is parsed, before first paint, so a saved theme never flashes.
const NO_FLASH_SCRIPT = `(function(){try{var p=localStorage.getItem("${STORAGE_KEY}");var d=p==="dark"||(p!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.currentScript.parentElement.setAttribute("data-theme",d?"dark":"light")}catch(e){}})();`;

interface ThemeContextValue {
  preference: ThemePreference;
  resolved: ResolvedTheme | undefined;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeRoot>");
  return ctx;
}

/** The module's root element: carries the design tokens and the current theme. */
export function ThemeRoot({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [preference, resolvedText] = snapshot.split(":") as [ThemePreference, string];
  const resolved = resolvedText === "dark" || resolvedText === "light" ? resolvedText : undefined;

  const setPreference = useCallback((next: ThemePreference) => {
    try {
      if (next === "system") window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage blocked (private window): the choice still applies until refresh.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return (
    <ThemeContext.Provider value={{ preference, resolved, setPreference }}>
      <div className="mz-theme" data-theme={resolved} suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
