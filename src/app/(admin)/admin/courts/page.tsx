"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { SPORTS, SPORT_LIST } from "@/lib/constants/sports";
import { formatCurrency } from "@/lib/utils/format";
import { useCourts } from "@/features/booking/hooks";
import { AdminHeader } from "@/features/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { SportBadge } from "@/components/ui/sport-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function CourtsPage() {
  const { data: courts, isLoading } = useCourts();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Record<string, boolean>>({});

  const isActive = (id: string, fallback: boolean) => active[id] ?? fallback;

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Courts"
        subtitle={`${courts?.length ?? 0} courts across the club`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm"><Icon name="plus" className="size-4" /> Add court</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add a court</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Court name</Label><Input placeholder="Tennis 5" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sport</Label>
                    <Select defaultValue="tennis">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{SPORT_LIST.map((s) => <SelectItem key={s.id} value={s.id}>{s.emoji} {s.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Hourly rate</Label><Input type="number" placeholder="32" /></div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => { setOpen(false); toast.success("Court added"); }}>Add court</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courts?.map((court) => {
            const on = isActive(court.id, court.isActive);
            return (
              <Card key={court.id} className="overflow-hidden">
                <div className="relative aspect-[16/9]">
                  {court.imageUrl && <Image src={court.imageUrl} alt={court.name} fill sizes="(max-width:1024px) 50vw, 33vw" className="object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-raised)] to-transparent" />
                  <div className="absolute left-3 top-3"><SportBadge sport={court.sport} className="bg-black/40 backdrop-blur" /></div>
                  <div className="absolute right-3 top-3">
                    {!on && <Badge tone="neutral" className="bg-black/50 backdrop-blur">Inactive</Badge>}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold tracking-tight">{court.name}</h3>
                      <p className="text-xs capitalize text-ink-tertiary">{court.surface} · {court.environment}</p>
                    </div>
                    <span className="tnum font-bold" style={{ color: SPORTS[court.sport].color }}>{formatCurrency(court.hourlyRate)}<span className="text-xs font-normal text-ink-tertiary">/hr</span></span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
                    <label className="flex items-center gap-2 text-sm text-ink-secondary">
                      <Switch checked={on} onCheckedChange={(v) => { setActive((a) => ({ ...a, [court.id]: v })); toast.success(v ? "Court activated" : "Court deactivated"); }} />
                      {on ? "Active" : "Inactive"}
                    </label>
                    <Button variant="ghost" size="sm"><Icon name="settings" className="size-4" /> Edit</Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
