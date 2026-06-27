"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatLongDate } from "@/lib/utils/format";
import { useSessionUser } from "@/features/auth/use-session-user";
import { useMembership, usePlans } from "@/features/membership/hooks";
import { useReservations } from "@/features/reservations/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";

export default function MembershipPage() {
  const user = useSessionUser();
  const { data: plans, isLoading } = usePlans();
  const { data: membership } = useMembership(user.id);
  const { data: reservations } = useReservations(user.id);
  const [autoRenew, setAutoRenew] = useState(membership?.autoRenew ?? true);

  const current = plans?.find((p) => p.id === membership?.planId);
  const used = (reservations ?? []).filter((r) => r.status === "completed").length;

  if (isLoading) return <Skeleton className="h-96 w-full rounded-3xl" />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Membership</h1>
        <p className="mt-1 text-ink-secondary">Manage your plan, usage, and renewal.</p>
      </div>

      {/* current plan */}
      {current && (
        <Card variant="featured">
          <CardContent className="grid gap-6 p-6 md:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <Badge tone="success" dot>{membership?.status === "active" ? "Active" : membership?.status}</Badge>
                <span className="text-sm text-ink-tertiary">Renews {formatLongDate(membership!.renewsAt)}</span>
              </div>
              <h2 className="mt-3 flex items-center gap-2 text-2xl font-bold tracking-tight">
                <Icon name="badge-check" className="size-6 text-brand" /> {current.name}
              </h2>
              <p className="mt-1 text-ink-secondary">{current.description}</p>

              <div className="mt-5 flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-surface p-4">
                <div className="flex items-center gap-3">
                  <Icon name="calendar-check" className="size-5 text-brand" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Auto-renew</p>
                    <p className="text-xs text-ink-tertiary">{formatCurrency(current.price)} / {current.interval.replace("ly", "")}</p>
                  </div>
                </div>
                <Switch
                  checked={autoRenew}
                  onCheckedChange={(v) => { setAutoRenew(v); toast.success(v ? "Auto-renew on" : "Auto-renew off"); }}
                />
              </div>
            </div>

            <div className="space-y-4">
              {current.includedBookings !== -1 ? (
                <div>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-ink-secondary">Bookings used</span>
                    <span className="tnum font-medium text-foreground">{used} / {current.includedBookings}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-grad-brand" style={{ width: `${Math.min(100, (used / Math.max(1, current.includedBookings)) * 100)}%` }} />
                  </div>
                </div>
              ) : (
                <p className="rounded-xl bg-grad-brand-soft p-3 text-sm text-foreground">Unlimited bookings included ✨</p>
              )}
              <ul className="space-y-2">
                {current.perks.slice(0, 4).map((perk) => (
                  <li key={perk} className="flex items-center gap-2 text-sm text-ink-secondary">
                    <Icon name="check-circle" className="size-4 text-brand" /> {perk}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* plan comparison */}
      <div>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Change your plan</h2>
        <div className="grid gap-5 lg:grid-cols-3">
          {plans?.map((plan) => {
            const isCurrent = plan.id === membership?.planId;
            return (
              <div
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-3xl border p-6",
                  isCurrent ? "border-brand bg-grad-brand-soft" : "border-[var(--border-subtle)] bg-raised",
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  {isCurrent && <Badge tone="info">Current</Badge>}
                </div>
                <p className="mt-2 text-sm text-ink-secondary">{plan.description}</p>
                <p className="mt-4 text-3xl font-bold tracking-tight">
                  {formatCurrency(plan.price)}<span className="text-sm font-normal text-ink-tertiary">/mo</span>
                </p>
                <Button
                  className="mt-5 w-full"
                  variant={isCurrent ? "secondary" : "primary"}
                  disabled={isCurrent}
                  onClick={() => toast.success(`Switched to ${plan.name}`)}
                >
                  {isCurrent ? "Current plan" : "Switch to " + plan.name}
                </Button>
                <ul className="mt-6 space-y-2.5">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-ink-secondary">
                      <Icon name="check-circle" className="mt-0.5 size-4 shrink-0 text-brand" /> {perk}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
