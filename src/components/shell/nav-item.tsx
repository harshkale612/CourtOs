"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem as NavItemType } from "@/lib/constants/nav";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

function isActive(pathname: string, href: string) {
  // exact match for index routes (/app, /admin), prefix match otherwise
  if (href === "/app" || href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export function NavItem({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItemType;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = isActive(pathname, item.href);

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        active
          ? "bg-grad-brand-soft text-foreground"
          : "text-ink-secondary hover:bg-white/[0.04] hover:text-foreground",
        collapsed && "justify-center px-0",
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-grad-brand shadow-[var(--glow-brand)]" />
      )}
      <Icon
        name={item.icon}
        className={cn("size-[18px] transition-colors", active ? "text-brand" : "")}
      />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && item.badge && (
        <Badge tone="info" className="px-1.5 py-0">
          {item.badge}
        </Badge>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }
  return link;
}
