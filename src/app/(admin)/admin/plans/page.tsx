"use client";

import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils/format";
import { usePlans } from "@/features/membership/hooks";
import { AdminHeader } from "@/features/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlansPage() {
  const { data: plans, isLoading } = usePlans();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Membership plans"
        subtitle="Configure tiers, pricing, and perks"
        actions={<Button size="sm" onClick={() => toast.success("New plan draft created")}><Icon name="plus" className="size-4" /> New plan</Button>}
      />

      {isLoading ? (
        <div className="grid gap-5 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-2xl" />)}</div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {plans?.map((plan) => (
            <Card key={plan.id} className="flex flex-col p-6" variant={plan.popular ? "featured" : "default"}>
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl" style={{ background: `color-mix(in oklab, ${plan.accentColor} 16%, transparent)`, color: plan.accentColor }}>
                  <Icon name="badge-check" className="size-5" />
                </span>
                {plan.popular && <Badge tone="info">Most popular</Badge>}
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">{plan.name}</h3>
              <p className="mt-1 text-sm text-ink-secondary">{plan.description}</p>
              <p className="mt-4 text-3xl font-bold tracking-tight">{formatCurrency(plan.price)}<span className="text-sm font-normal text-ink-tertiary">/{plan.interval.replace("ly", "")}</span></p>
              <ul className="mt-5 flex-1 space-y-2">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-sm text-ink-secondary">
                    <Icon name="check-circle" className="mt-0.5 size-4 shrink-0 text-brand" /> {perk}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex gap-2 border-t border-[var(--border-subtle)] pt-4">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => toast.success("Editing " + plan.name)}>Edit</Button>
                <Button variant="ghost" size="icon"><Icon name="ellipsis" className="size-4" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
