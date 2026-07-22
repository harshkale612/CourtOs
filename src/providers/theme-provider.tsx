"use client";

import { ThemeProvider as NextThemes } from "next-themes";

/**
 * Dark-mode-first, but a first-class light theme is available.
 * Theme priority (handled by next-themes):
 *   1. Stored user preference (localStorage: "courtos-theme")
 *   2. System preference        (defaultTheme="system" + enableSystem)
 *   3. Dark                     (dark-first product; :root carries dark)
 *
 * `disableTransitionOnChange` is intentionally OFF — the toggle drives its
 * own scoped 250ms cross-fade (see .theme-transition in globals.css).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="courtos-theme"
    >
      {children}
    </NextThemes>
  );
}
