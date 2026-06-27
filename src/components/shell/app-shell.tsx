import type { NavSection } from "@/lib/constants/nav";
import { cn } from "@/lib/utils/cn";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import { CommandPalette } from "./command-palette";

interface AppShellProps {
  sections: NavSection[];
  basePath: string;
  variant?: "portal" | "admin";
  children: React.ReactNode;
}

/** Composed dashboard shell: sidebar + topbar + content (+ mobile tabs for portal). */
export function AppShell({
  sections,
  basePath,
  variant = "portal",
  children,
}: AppShellProps) {
  const isPortal = variant === "portal";
  return (
    <div className="flex min-h-dvh bg-canvas">
      <Sidebar sections={sections} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar sections={sections} basePath={basePath} />
        <main
          className={cn(
            "mx-auto w-full flex-1 px-4 py-6 sm:px-6 lg:py-8",
            isPortal ? "max-w-7xl pb-24 lg:pb-8" : "max-w-[1600px]",
          )}
        >
          {children}
        </main>
        {isPortal && <MobileNav />}
      </div>
      <CommandPalette basePath={basePath} />
    </div>
  );
}
