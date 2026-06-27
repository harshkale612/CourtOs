"use client";

import { useState } from "react";
import Link from "next/link";
import type { NavSection } from "@/lib/constants/nav";
import { useUiStore } from "@/stores/ui-store";
import { Logo } from "@/components/brand/logo";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NavItem } from "./nav-item";
import { UserMenu } from "./user-menu";

interface TopbarProps {
  title?: string;
  sections: NavSection[];
  basePath: string;
}

export function Topbar({ title, sections, basePath }: TopbarProps) {
  const [open, setOpen] = useState(false);
  const setCommandOpen = useUiStore((s) => s.setCommandOpen);

  return (
    <header className="glass sticky top-0 z-[1100] flex h-16 items-center gap-3 px-4 sm:px-6">
      {/* Mobile: drawer trigger + logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Icon name="menu" className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader>
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Logo href="/" />
            </SheetHeader>
            <nav className="space-y-6 px-3 py-2">
              {sections.map((section, i) => (
                <div key={i} className="space-y-1">
                  {section.title && (
                    <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary">
                      {section.title}
                    </p>
                  )}
                  {section.items.map((item) => (
                    <NavItem key={item.href} item={item} onNavigate={() => setOpen(false)} />
                  ))}
                </div>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {title && <h1 className="hidden text-lg font-semibold tracking-tight sm:block">{title}</h1>}

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => setCommandOpen(true)}
          className="hidden h-10 items-center gap-2 rounded-lg border border-[var(--border-default)] bg-surface px-3 text-sm text-ink-tertiary transition-colors hover:border-[var(--border-strong)] sm:flex"
        >
          <Icon name="search" className="size-4" />
          <span>Search…</span>
          <kbd className="ml-2 rounded border border-[var(--border-default)] bg-white/5 px-1.5 text-[10px] font-medium">
            ⌘K
          </kbd>
        </button>

        {basePath === "/app" && (
          <Button variant="ghost" size="icon" asChild aria-label="Notifications">
            <Link href="/app/notifications" className="relative">
              <Icon name="bell" className="size-5" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-danger ring-2 ring-[var(--bg-canvas)]" />
            </Link>
          </Button>
        )}

        <UserMenu basePath={basePath} />
      </div>
    </header>
  );
}
