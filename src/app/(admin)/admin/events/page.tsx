"use client";

import Image from "next/image";
import { toast } from "sonner";
import { coachName } from "@/lib/mock/lookup";
import { SPORTS } from "@/lib/constants/sports";
import { formatCurrency, formatRelativeDay } from "@/lib/utils/format";
import { useEvents } from "@/features/events/hooks";
import { AdminHeader } from "@/features/admin/admin-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const TYPE_LABEL: Record<string, string> = {
  clinic: "Clinic", league: "League", tournament: "Tournament", open_play: "Open Play", lesson: "Lesson",
};

export default function AdminEventsPage() {
  const { data: events, isLoading } = useEvents();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Events"
        subtitle="Clinics, leagues, tournaments, and open play"
        actions={<Button size="sm" onClick={() => toast.success("New event draft created")}><Icon name="plus" className="size-4" /> Create event</Button>}
      />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="hidden lg:table-cell">Coach</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events?.map((e) => {
                  const pct = Math.round((e.registeredCount / e.capacity) * 100);
                  return (
                    <TableRow key={e.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative size-10 shrink-0 overflow-hidden rounded-lg">
                            {e.coverUrl && <Image src={e.coverUrl} alt="" fill sizes="40px" className="object-cover" />}
                          </div>
                          <span className="font-medium text-foreground">{SPORTS[e.sport].emoji} {e.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell"><Badge tone="neutral">{TYPE_LABEL[e.type]}</Badge></TableCell>
                      <TableCell className="hidden lg:table-cell">{coachName(e.coachId) ?? "—"}</TableCell>
                      <TableCell>{formatRelativeDay(e.start)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.06]">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: SPORTS[e.sport].color }} />
                          </div>
                          <span className="tnum text-xs text-ink-tertiary">{e.registeredCount}/{e.capacity}</span>
                        </div>
                      </TableCell>
                      <TableCell className="tnum text-right font-medium text-foreground">{e.price === 0 ? "Free" : formatCurrency(e.price)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
