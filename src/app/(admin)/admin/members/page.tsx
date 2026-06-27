"use client";

import { useState } from "react";
import type { User } from "@/types";
import { initials, formatLongDate } from "@/lib/utils/format";
import { useMembers } from "@/features/members/hooks";
import { useMembership } from "@/features/membership/hooks";
import { AdminHeader } from "@/features/admin/admin-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function MembersPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<User | null>(null);
  const { data, isLoading } = useMembers(page, query);
  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Members"
        subtitle={`${data?.total ?? 0} members`}
        actions={<Button size="sm"><Icon name="plus" className="size-4" /> Invite member</Button>}
      />

      <div className="relative max-w-sm">
        <Icon name="search" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-tertiary" />
        <Input
          placeholder="Search members…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Joined</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.items.map((m) => (
                  <TableRow key={m.id} className="cursor-pointer" onClick={() => setSelected(m)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9"><AvatarImage src={m.avatarUrl} alt={m.name} /><AvatarFallback>{initials(m.name)}</AvatarFallback></Avatar>
                        <span className="font-medium text-foreground">{m.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{m.email}</TableCell>
                    <TableCell className="hidden sm:table-cell">{formatLongDate(m.joinedAt)}</TableCell>
                    <TableCell className="text-right"><Icon name="chevron-right" className="size-4 text-ink-tertiary" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-tertiary">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </div>

      <MemberDrawer member={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function MemberDrawer({ member, onClose }: { member: User | null; onClose: () => void }) {
  const { data: membership } = useMembership(member?.id ?? "");
  return (
    <Sheet open={!!member} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        {member && (
          <>
            <SheetHeader>
              <SheetTitle className="sr-only">Member profile</SheetTitle>
              <div className="flex items-center gap-4">
                <Avatar className="size-16"><AvatarImage src={member.avatarUrl} alt={member.name} /><AvatarFallback className="text-lg">{initials(member.name)}</AvatarFallback></Avatar>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">{member.name}</h3>
                  <SheetDescription>{member.email}</SheetDescription>
                </div>
              </div>
            </SheetHeader>
            <div className="space-y-4 px-6">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Status" value={<Badge tone={membership?.status === "active" ? "success" : "neutral"}>{membership?.status ?? "—"}</Badge>} />
                <Stat label="Member since" value={formatLongDate(member.joinedAt)} />
                <Stat label="Phone" value={member.phone ?? "—"} />
                <Stat label="Auto-renew" value={membership?.autoRenew ? "On" : "Off"} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button className="flex-1" variant="secondary">Message</Button>
                <Button className="flex-1">View bookings</Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-surface p-3">
      <p className="text-xs text-ink-tertiary">{label}</p>
      <div className="mt-1 text-sm font-medium capitalize text-foreground">{value}</div>
    </div>
  );
}
