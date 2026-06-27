"use client";

import Image from "next/image";
import { initials } from "@/lib/utils/format";
import { SPORTS } from "@/lib/constants/sports";
import { useCoaches } from "@/features/members/hooks";
import { AdminHeader } from "@/features/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/format";

export default function CoachesPage() {
  const { data: coaches, isLoading } = useCoaches();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Coaches"
        subtitle={`${coaches?.length ?? 0} coaches on the team`}
        actions={<Button size="sm"><Icon name="plus" className="size-4" /> Add coach</Button>}
      />

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 w-full rounded-2xl" />)}</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {coaches?.map((coach) => (
            <Card key={coach.id} variant="interactive" className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="size-14">
                  {coach.avatarUrl && <Image src={coach.avatarUrl} alt={coach.name} width={56} height={56} unoptimized />}
                  <AvatarFallback className="text-base">{initials(coach.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold tracking-tight">{coach.name}</h3>
                  <p className="flex items-center gap-1 text-sm text-ink-secondary">
                    <Icon name="star" className="size-3.5 fill-warning text-warning" /> {coach.rating}
                  </p>
                </div>
              </div>
              <p className="mt-4 line-clamp-2 text-sm text-ink-secondary">{coach.bio}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {coach.specialties.map((s) => (
                  <span key={s} className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: `color-mix(in oklab, ${SPORTS[s].color} 14%, transparent)`, color: SPORTS[s].color }}>
                    {SPORTS[s].emoji} {SPORTS[s].label}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
                <span className="text-sm text-ink-secondary">From <span className="font-semibold text-foreground">{formatCurrency(coach.hourlyRate)}</span>/hr</span>
                <Button variant="ghost" size="sm">View schedule</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
