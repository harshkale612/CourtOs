"use client";

import type { NavSection } from "@/lib/constants/nav";
import { cn } from "@/lib/utils/cn";
import { useUiStore } from "@/stores/ui-store";
import { Logo } from "@/components/brand/logo";
import { Icon } from "@/components/ui/icon";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NavItem } from "./nav-item";

/** Desktop sidebar (hidden < lg). Collapsible to an icon rail. */
export function Sidebar({ sections }: { sections: NavSection[] }) {
  const { sidebarCollapsed, toggleSidebar } = useUiStore();

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-[var(--border-subtle)] bg-surface/60 backdrop-blur-xl transition-[width] duration-300 ease-[var(--e-out)] lg:flex",
          sidebarCollapsed ? "w-[76px]" : "w-64",
        )}
      >
        <div className={cn("flex h-16 items-center px-4", sidebarCollapsed && "justify-center px-0")}>
          <Logo href="/" showWordmark={!sidebarCollapsed} />
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {sections.map((section, i) => (
            <div key={i} className="space-y-1">
              {section.title && !sidebarCollapsed && (
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => (
                <NavItem key={item.href} item={item} collapsed={sidebarCollapsed} />
              ))}
            </div>
          ))}
        </nav>

        <button
          onClick={toggleSidebar}
          className={cn(
            "m-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-tertiary transition-colors hover:bg-white/[0.04] hover:text-foreground",
            sidebarCollapsed && "justify-center px-0",
          )}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Icon
            name="panel-left"
            className={cn("size-[18px] transition-transform", sidebarCollapsed && "rotate-180")}
          />
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>
      </aside>
    </TooltipProvider>
  );
}
