"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useUiStore } from "@/stores/ui-store";
import { PORTAL_NAV, ADMIN_NAV } from "@/lib/constants/nav";
import { SPORT_LIST } from "@/lib/constants/sports";
import { useBookingStore } from "@/stores/booking-store";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";

interface Command {
  id: string;
  label: string;
  icon: string;
  group: string;
  run: () => void;
  keywords?: string;
}

export function CommandPalette({ basePath = "/app" }: { basePath?: string }) {
  const router = useRouter();
  const open = useUiStore((s) => s.commandOpen);
  const setOpen = useUiStore((s) => s.setCommandOpen);
  const setSport = useBookingStore((s) => s.setSport);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  // global ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!useUiStore.getState().commandOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const commands = useMemo<Command[]>(() => {
    const go = (href: string) => () => {
      router.push(href);
      setOpen(false);
    };
    const nav = (basePath === "/admin" ? ADMIN_NAV : PORTAL_NAV).flatMap((section) =>
      section.items.map((item) => ({
        id: item.href,
        label: item.label,
        icon: item.icon,
        group: "Navigate",
        run: go(item.href),
      })),
    );
    const bookActions: Command[] =
      basePath === "/app"
        ? SPORT_LIST.map((s) => ({
            id: `book-${s.id}`,
            label: `Book ${s.label}`,
            icon: "calendar-plus",
            group: "Quick actions",
            keywords: "book reserve court",
            run: () => {
              setSport(s.id);
              router.push("/app/booking");
              setOpen(false);
            },
          }))
        : [];
    return [...bookActions, ...nav];
  }, [basePath, router, setOpen, setSport]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return commands;
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.keywords?.includes(q),
    );
  }, [commands, query]);

  useEffect(() => setActive(0), [query, open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === "Enter") { e.preventDefault(); filtered[active]?.run(); }
  };

  // group for display
  const groups = useMemo(() => {
    const map = new Map<string, { cmd: Command; index: number }[]>();
    filtered.forEach((cmd, index) => {
      if (!map.has(cmd.group)) map.set(cmd.group, []);
      map.get(cmd.group)!.push({ cmd, index });
    });
    return [...map.entries()];
  }, [filtered]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[1300] bg-[var(--bg-overlay)] backdrop-blur-[var(--blur-overlay)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          onKeyDown={onKeyDown}
          className="fixed left-1/2 top-[12%] z-[1300] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-[var(--border-default)] bg-raised/95 shadow-[var(--sh-4)] backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <DialogPrimitive.Title className="sr-only">Command palette</DialogPrimitive.Title>
          <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4">
            <Icon name="search" className="size-5 text-ink-tertiary" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or jump to…"
              className="h-14 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-ink-tertiary"
            />
            <kbd className="rounded border border-[var(--border-default)] bg-white/5 px-1.5 py-0.5 text-[10px] text-ink-tertiary">ESC</kbd>
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink-tertiary">No results for “{query}”</p>
            ) : (
              groups.map(([group, items]) => (
                <div key={group} className="mb-2">
                  <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary">{group}</p>
                  {items.map(({ cmd, index }) => (
                    <button
                      key={cmd.id}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => cmd.run()}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        active === index ? "bg-grad-brand-soft text-foreground" : "text-ink-secondary",
                      )}
                    >
                      <Icon name={cmd.icon} className={cn("size-4", active === index && "text-brand")} />
                      <span className="flex-1 text-left">{cmd.label}</span>
                      {active === index && <Icon name="arrow-right" className="size-4 text-ink-tertiary" />}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
