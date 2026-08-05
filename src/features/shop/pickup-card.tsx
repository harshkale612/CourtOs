"use client";

import Link from "next/link";
import { FULFILLMENT_STATUS, PICKUP_METHODS } from "@/lib/constants/commerce";
import { formatCurrency } from "@/lib/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useActivePickups } from "./hooks";

/**
 * "Your order is waiting" — dashboard card that only appears when the member
 * actually has something to collect.
 */
export function PickupCard({ userId }: { userId: string }) {
  const { data: pickups } = useActivePickups(userId);
  const rows = pickups ?? [];
  if (rows.length === 0) return null;

  return (
    <Card variant="featured">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="package-check" className="size-5 text-brand" />
          Ready to collect
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.slice(0, 3).map((o) => {
          const f = o.fulfillment!;
          const method = PICKUP_METHODS[f.method];
          const status = FULFILLMENT_STATUS[f.status];
          return (
            <Link
              key={o.id}
              href={`/app/shop/orders/${o.id}`}
              className="flex items-center gap-3 rounded-xl border border-(--border-subtle) bg-surface p-3 transition-colors hover:border-(--border-strong)"
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: `color-mix(in oklab, ${method.color} 16%, transparent)`,
                  color: method.color,
                }}
              >
                <Icon name={method.icon} className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">
                  {o.number} · {formatCurrency(o.total)}
                </span>
                <span className="block truncate text-xs text-ink-tertiary">
                  {method.location}
                </span>
              </span>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                style={{
                  color: status.color,
                  background: `color-mix(in oklab, ${status.color} 14%, transparent)`,
                }}
              >
                {status.label}
              </span>
            </Link>
          );
        })}
        <Button variant="secondary" size="sm" className="w-full" asChild>
          <Link href="/app/shop/orders">View all orders</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
