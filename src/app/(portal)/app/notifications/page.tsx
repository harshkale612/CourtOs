"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { formatFromNow } from "@/lib/utils/format";
import { useSessionUser } from "@/features/auth/use-session-user";
import { useNotifications, useMarkAllRead, useMarkRead } from "@/features/notifications/hooks";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const TYPE_ICON: Record<string, string> = {
  booking: "calendar-check", waitlist: "zap", payment: "credit-card", event: "trophy", system: "bell",
};
const TYPE_ACCENT: Record<string, string> = {
  booking: "var(--accent-blue)", waitlist: "var(--accent-orange)", payment: "var(--accent-emerald)",
  event: "var(--accent-pink)", system: "var(--accent-purple)",
};

export default function NotificationsPage() {
  const user = useSessionUser();
  const { data: notifications, isLoading } = useNotifications(user.id);
  const markAll = useMarkAllRead(user.id);
  const markRead = useMarkRead(user.id);
  const unread = (notifications ?? []).filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Notifications</h1>
          <p className="mt-1 text-ink-secondary">{unread > 0 ? `${unread} unread` : "You're all caught up."}</p>
        </div>
        {unread > 0 && (
          <Button variant="secondary" size="sm" onClick={() => markAll.mutate()}>Mark all read</Button>
        )}
      </div>

      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)
        ) : (notifications ?? []).length === 0 ? (
          <EmptyState icon="bell" title="No notifications" description="We'll let you know when something happens." />
        ) : (
          (notifications ?? []).map((n) => {
            const body = (
              <div
                className={cn(
                  "flex items-start gap-4 rounded-2xl border p-4 transition-colors",
                  n.read ? "border-[var(--border-subtle)] bg-raised" : "border-[var(--border-default)] bg-grad-brand-soft",
                )}
              >
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `color-mix(in oklab, ${TYPE_ACCENT[n.type]} 16%, transparent)`, color: TYPE_ACCENT[n.type] }}
                >
                  <Icon name={TYPE_ICON[n.type]} className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{n.title}</p>
                    {!n.read && <span className="size-2 rounded-full bg-brand" />}
                  </div>
                  <p className="mt-0.5 text-sm text-ink-secondary">{n.body}</p>
                  <p className="mt-1 text-xs text-ink-tertiary">{formatFromNow(n.createdAt)}</p>
                </div>
              </div>
            );
            return n.href ? (
              <Link key={n.id} href={n.href} onClick={() => !n.read && markRead.mutate(n.id)}>{body}</Link>
            ) : (
              <div key={n.id}>{body}</div>
            );
          })
        )}
      </div>
    </div>
  );
}
