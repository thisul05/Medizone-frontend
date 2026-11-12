"use client";

// Light theme aligned with Medizone's universal light design tokens.
import { createContext, useContext, type ReactNode } from "react";

export type ThemePreference = "light";
type ResolvedTheme = "light";

interface ThemeContextValue {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  preference: "light",
  resolved: "light",
  setPreference: () => {},
});

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

/** The module's root element: carries the design tokens locked in Medizone light theme. */
export function ThemeRoot({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={{ preference: "light", resolved: "light", setPreference: () => {} }}>
      <div className="mz-theme" data-theme="light">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
