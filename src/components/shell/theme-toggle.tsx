"use client";

import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { useMounted } from "@/hooks/use-mounted";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils/cn";

/**
 * Animated sun/moon theme toggle.
 * • Crossfades + rotates the icon between states (respects reduced-motion).
 * • Drives a scoped 250ms cross-fade of the whole UI via `.theme-transition`.
 * • Fully keyboard accessible (native <button>, visible focus ring, live label).
 * • Persistence + system-preference handled by next-themes (see ThemeProvider).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const isDark = resolvedTheme === "dark";
  const next = isDark ? "light" : "dark";

  function toggle() {
    const root = document.documentElement;
    // Scope the cross-fade to the moment of switching only.
    root.classList.add("theme-transition");
    setTheme(next);
    window.setTimeout(() => root.classList.remove("theme-transition"), 320);
  }

  const label = mounted ? `Switch to ${next} theme` : "Toggle theme";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "relative inline-flex size-10 items-center justify-center rounded-lg text-ink-secondary transition-colors duration-200 hover:bg-fill-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
        className,
      )}
    >
      <span className="relative block size-5">
        {!mounted ? (
          // Neutral placeholder before hydration — avoids a theme flash/mismatch.
          <Icon name="sun" className="size-5 opacity-0" />
        ) : (
          <AnimatePresence initial={false}>
            <motion.span
              key={isDark ? "moon" : "sun"}
              initial={{ rotate: -90, opacity: 0, scale: 0.4 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.4 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Icon name={isDark ? "moon" : "sun"} className="size-5" />
            </motion.span>
          </AnimatePresence>
        )}
      </span>
    </button>
  );
}
