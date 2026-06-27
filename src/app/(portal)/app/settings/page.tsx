"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const PREFS = [
  { key: "emailBooking", label: "Booking confirmations", desc: "Email me when a booking is confirmed or changed.", default: true },
  { key: "emailWaitlist", label: "Waitlist offers", desc: "Notify me the moment a waitlisted slot opens.", default: true },
  { key: "emailEvents", label: "Event announcements", desc: "New clinics, leagues, and tournaments.", default: false },
  { key: "reminders", label: "Session reminders", desc: "A nudge 2 hours before each booking.", default: true },
];

export default function SettingsPage() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(PREFS.map((p) => [p.key, p.default])),
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>

      <Card>
        <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
        <CardContent className="divide-y divide-[var(--border-subtle)]">
          {PREFS.map((pref) => (
            <div key={pref.key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-foreground">{pref.label}</p>
                <p className="text-xs text-ink-tertiary">{pref.desc}</p>
              </div>
              <Switch
                checked={prefs[pref.key]}
                onCheckedChange={(v) => { setPrefs((p) => ({ ...p, [pref.key]: v })); toast.success("Preference saved"); }}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Language</Label>
            <Select defaultValue="en">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Button variant="secondary" onClick={() => { logout(); router.push("/login"); }}>
            Sign out
          </Button>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-danger">Delete account</p>
              <p className="text-xs text-ink-tertiary">Permanently remove your account and data.</p>
            </div>
            <Button variant="destructive" onClick={() => toast.error("This is a demo — account deletion is disabled.")}>
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
