"use client";

import { ThemeProvider as NextThemes } from "next-themes";

/** Dark-mode-first. We force dark for the MVP but keep the provider so a
 *  light theme can be introduced later without rewiring. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
      {children}
    </NextThemes>
  );
}
