"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PORTAL_MOBILE_NAV } from "@/lib/constants/nav";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";

function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

/** Thumb-reachable bottom tab bar (member portal, mobile only). */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-[1100] flex h-[68px] items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] lg:hidden">
      {PORTAL_MOBILE_NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium transition-colors",
              active ? "text-foreground" : "text-ink-tertiary",
            )}
          >
            {active && (
              <span className="absolute -top-0.5 h-1 w-8 rounded-full bg-grad-brand shadow-[var(--glow-brand)]" />
            )}
            <Icon name={item.icon} className={cn("size-5", active && "text-brand")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
