"use client";

import { useState } from "react";
import { toast } from "sonner";
import { initials, formatLongDate } from "@/lib/utils/format";
import { SPORT_LIST } from "@/lib/constants/sports";
import { cn } from "@/lib/utils/cn";
import { useSessionUser } from "@/features/auth/use-session-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";

export default function ProfilePage() {
  const user = useSessionUser();
  const [form, setForm] = useState({ name: user.name, email: user.email, phone: user.phone ?? "" });
  const [favorites, setFavorites] = useState<string[]>(["tennis", "padel"]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Profile</h1>

      {/* header card */}
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
          <Avatar className="size-20">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="text-xl">{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-bold tracking-tight">{user.name}</h2>
            <p className="text-ink-secondary">{user.email}</p>
            <p className="mt-1 text-xs text-ink-tertiary">Member since {formatLongDate(user.joinedAt)}</p>
          </div>
        </CardContent>
      </Card>

      {/* edit form */}
      <Card>
        <CardHeader><CardTitle>Personal information</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2"><Label>Full name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="flex justify-end">
            <Button onClick={() => toast.success("Profile updated")}>Save changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* favorite sports */}
      <Card>
        <CardHeader><CardTitle>Favorite sports</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {SPORT_LIST.map((s) => {
              const active = favorites.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => setFavorites((f) => (active ? f.filter((x) => x !== s.id) : [...f, s.id]))}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all",
                    active ? "border-transparent text-white" : "border-[var(--border-default)] bg-surface text-ink-secondary hover:border-[var(--border-strong)]",
                  )}
                  style={active ? { background: s.color } : undefined}
                >
                  <span>{s.emoji}</span> {s.label}
                  {active && <Icon name="check" className="size-3.5" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
