"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import type { Court } from "@/types";
import { SPORTS, SPORT_LIST } from "@/lib/constants/sports";
import { COURT_TYPE, sectionColor } from "@/lib/constants/courts";
import { formatCurrency } from "@/lib/utils/format";
import { priceRange } from "@/lib/utils/pricing";
import { cn } from "@/lib/utils/cn";
import { useCourts, useSectionStatuses } from "@/features/booking/hooks";
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
  const { data: statuses } = useSectionStatuses();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Record<string, boolean>>({});

  const isActive = (id: string, fallback: boolean) => active[id] ?? fallback;
  const toggle = (id: string, v: boolean) => {
    setActive((a) => ({ ...a, [id]: v }));
    toast.success(v ? "Court activated" : "Court deactivated");
  };

  const whole = (courts ?? []).filter((c) => c.type === "whole");
  const shareable = (courts ?? []).filter((c) => c.type === "shareable");
  const totalSections = shareable.reduce((n, c) => n + (c.sections?.length ?? 0), 0);

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Courts"
        subtitle={
          courts
            ? `${courts.length} physical courts · ${whole.length} whole · ${shareable.length} shareable · ${totalSections} sections`
            : "Loading courts…"
        }
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm"><Icon name="plus" className="size-4" /> Add court</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add a court</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Court name</Label><Input placeholder="Court 9 / Court E" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Court type</Label>
                    <Select defaultValue="whole">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whole">Whole court</SelectItem>
                        <SelectItem value="shareable">Shareable court</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sport</Label>
                    <Select defaultValue="tennis">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{SPORT_LIST.map((s) => <SelectItem key={s.id} value={s.id}>{s.emoji} {s.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2"><Label>Whole-court hourly rate (CAD)</Label><Input type="number" placeholder="52" /></div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => { setOpen(false); toast.success("Court added"); }}>Add court</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading || !courts ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
        </div>
      ) : (
        <>
          {/* Whole courts */}
          <section className="space-y-4">
            <GroupHeader type="whole" count={whole.length} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {whole.map((court) => (
                <WholeCourtCard key={court.id} court={court} on={isActive(court.id, court.isActive)} onToggle={(v) => toggle(court.id, v)} />
              ))}
            </div>
          </section>

          {/* Shareable courts */}
          <section className="space-y-4">
            <GroupHeader type="shareable" count={shareable.length} />
            <div className="space-y-4">
              {shareable.map((court) => (
                <ShareableCourtCard
                  key={court.id}
                  court={court}
                  statuses={statuses}
                  on={isActive(court.id, court.isActive)}
                  onToggle={(v) => toggle(court.id, v)}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function GroupHeader({ type, count }: { type: "whole" | "shareable"; count: number }) {
  const cfg = COURT_TYPE[type];
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-xl" style={{ background: `color-mix(in oklab, ${cfg.color} 16%, transparent)`, color: cfg.color }}>
        <Icon name={cfg.icon} className="size-5" />
      </span>
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{cfg.label}s</h2>
        <p className="text-xs text-ink-tertiary">{cfg.description}</p>
      </div>
      <span className="ml-auto rounded-full bg-fill-4 px-2.5 py-1 text-sm font-semibold text-ink-secondary">{count}</span>
    </div>
  );
}

function WholeCourtCard({ court, on, onToggle }: { court: Court; on: boolean; onToggle: (v: boolean) => void }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-16/9">
        {court.imageUrl && <Image src={court.imageUrl} alt={court.name} fill sizes="(max-width:1024px) 50vw, 33vw" className="object-cover" />}
        <div className="absolute inset-0 bg-linear-to-t from-raised to-transparent" />
        <div className="absolute left-3 top-3"><SportBadge sport={court.sport} className="bg-black/40 backdrop-blur" /></div>
        <div className="absolute right-3 top-3">{!on && <Badge tone="neutral" className="bg-black/50 backdrop-blur">Inactive</Badge>}</div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold tracking-tight">{court.name}</h3>
            <p className="text-xs capitalize text-ink-tertiary">{court.surface} · {court.environment}</p>
          </div>
          <span className="tnum font-bold" style={{ color: SPORTS[court.sport].color }}>
            {formatCurrency(court.hourlyRate)}<span className="text-xs font-normal text-ink-tertiary">/hr</span>
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-(--border-subtle) pt-4">
          <label className="flex items-center gap-2 text-sm text-ink-secondary">
            <Switch checked={on} onCheckedChange={onToggle} />
            {on ? "Active" : "Inactive"}
          </label>
          <Button variant="ghost" size="sm"><Icon name="settings" className="size-4" /> Edit</Button>
        </div>
      </div>
    </Card>
  );
}

function ShareableCourtCard({
  court,
  statuses,
  on,
  onToggle,
}: {
  court: Court;
  statuses?: Record<string, string>;
  on: boolean;
  onToggle: (v: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const accent = SPORTS[court.sport].color;
  const purple = COURT_TYPE.shareable.color;
  const range = priceRange(court);
  const sections = court.sections ?? [];

  return (
    <Card className="overflow-hidden">
      {/* header */}
      <div className="flex items-center gap-4 p-5">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-xl">
          {court.imageUrl && <Image src={court.imageUrl} alt={court.name} fill sizes="56px" className="object-cover" />}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-2xl">{SPORTS[court.sport].emoji}</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold tracking-tight">{court.name}</h3>
            <SportBadge sport={court.sport} />
            <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: purple, borderColor: `color-mix(in oklab, ${purple} 25%, transparent)`, background: `color-mix(in oklab, ${purple} 12%, transparent)` }}>
              <Icon name="layout-grid" className="size-3" /> Shareable
            </span>
          </div>
          <p className="mt-0.5 text-xs text-ink-tertiary">
            {sections.length} sections · sections {formatCurrency(range.from)}–{formatCurrency(range.to ?? range.from)}/hr
          </p>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">Entire court</p>
          <p className="tnum font-bold" style={{ color: accent }}>{formatCurrency(court.hourlyRate)}<span className="text-xs font-normal text-ink-tertiary">/hr</span></p>
        </div>
        <button onClick={() => setExpanded((v) => !v)} aria-label="Toggle sections" className="flex size-9 items-center justify-center rounded-lg border border-(--border-subtle) text-ink-secondary transition-colors hover:text-foreground">
          <Icon name="chevron-down" className={cn("size-5 transition-transform", expanded && "rotate-180")} />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-(--border-subtle) p-5">
              {/* entire-court booking option */}
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-dashed border-(--border-default) bg-fill-1 p-3.5">
                <span className="flex size-9 items-center justify-center rounded-lg" style={{ background: `color-mix(in oklab, ${accent} 16%, transparent)`, color: accent }}>
                  <Icon name="maximize" className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">Entire court</p>
                  <p className="text-xs text-ink-tertiary">Books all {sections.length} sections at once</p>
                </div>
                <span className="tnum font-bold" style={{ color: accent }}>{formatCurrency(court.hourlyRate)}<span className="text-xs font-normal text-ink-tertiary">/hr</span></span>
              </div>

              {/* sections */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sections.map((section, i) => {
                  const sAccent = sectionColor(i);
                  const status = statuses?.[section.id];
                  const occupied = status === "occupied";
                  return (
                    <div key={section.id} className="flex items-center gap-3 rounded-xl border border-(--border-subtle) bg-raised p-3.5">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold" style={{ background: `color-mix(in oklab, ${sAccent} 18%, transparent)`, color: sAccent }}>
                        {section.shortLabel}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{section.name}</p>
                        <p className="tnum text-xs text-ink-tertiary">{formatCurrency(section.hourlyPrice)}/hr</p>
                      </div>
                      <Badge tone={occupied ? "danger" : "success"} dot>{occupied ? "Occupied" : "Available"}</Badge>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-(--border-subtle) pt-4">
                <label className="flex items-center gap-2 text-sm text-ink-secondary">
                  <Switch checked={on} onCheckedChange={onToggle} />
                  {on ? "Active" : "Inactive"}
                </label>
                <Button variant="ghost" size="sm"><Icon name="settings" className="size-4" /> Manage sections</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
