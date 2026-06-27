"use client";

import { useState } from "react";
import { toast } from "sonner";
import { org } from "@/lib/mock/data";
import { SPORT_LIST } from "@/lib/constants/sports";
import { AdminHeader } from "@/features/admin/admin-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminSettingsPage() {
  const [sports, setSports] = useState<string[]>(org.sports);

  return (
    <div className="max-w-3xl space-y-6">
      <AdminHeader
        title="Settings"
        subtitle="Configure your club"
        actions={<Button size="sm" onClick={() => toast.success("Settings saved")}>Save changes</Button>}
      />

      <Card>
        <CardHeader><CardTitle>Club details</CardTitle></CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><Label>Club name</Label><Input defaultValue={org.name} /></div>
          <div className="space-y-2">
            <Label>Time zone</Label>
            <Select defaultValue="et">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="et">Eastern (ET)</SelectItem>
                <SelectItem value="ct">Central (CT)</SelectItem>
                <SelectItem value="pt">Pacific (PT)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select defaultValue="usd">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD ($)</SelectItem>
                <SelectItem value="eur">EUR (€)</SelectItem>
                <SelectItem value="gbp">GBP (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sports offered</CardTitle>
          <CardDescription>Enable the sports your club supports.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-[var(--border-subtle)]">
          {SPORT_LIST.map((s) => {
            const on = sports.includes(s.id);
            return (
              <div key={s.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <span className="flex items-center gap-2 text-sm font-medium">{s.emoji} {s.label}</span>
                <Switch
                  checked={on}
                  onCheckedChange={(v) => setSports((arr) => (v ? [...arr, s.id] : arr.filter((x) => x !== s.id)))}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking rules</CardTitle>
          <CardDescription>Defaults applied to new reservations.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2"><Label>Advance booking window (days)</Label><Input type="number" defaultValue={7} /></div>
          <div className="space-y-2"><Label>Cancellation window (hours)</Label><Input type="number" defaultValue={24} /></div>
        </CardContent>
      </Card>
    </div>
  );
}
