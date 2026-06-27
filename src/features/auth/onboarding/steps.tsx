"use client";

import type { Sport } from "@/types";
import { SPORT_LIST } from "@/lib/constants/sports";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";

export interface WizardState {
  clubName: string;
  location: string;
  sports: Sport[];
  courts: { id: string; name: string; sport: Sport }[];
  invites: string[];
  skill: string;
}

/* ---------- Club details ---------- */
export function ClubDetailsStep({
  state,
  update,
}: {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="clubName">Club name</Label>
        <Input
          id="clubName"
          placeholder="Riverside Racquet Club"
          value={state.clubName}
          onChange={(e) => update({ clubName: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="City, State"
          value={state.location}
          onChange={(e) => update({ location: e.target.value })}
        />
      </div>
    </div>
  );
}

/* ---------- Sports multi-select ---------- */
export function SportsStep({
  state,
  update,
}: {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}) {
  const toggle = (sport: Sport) =>
    update({
      sports: state.sports.includes(sport)
        ? state.sports.filter((s) => s !== sport)
        : [...state.sports, sport],
    });

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {SPORT_LIST.map((s) => {
        const active = state.sports.includes(s.id);
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => toggle(s.id)}
            aria-pressed={active}
            className={cn(
              "flex flex-col items-center gap-2 rounded-2xl border p-5 transition-all duration-200",
              active
                ? "border-transparent ring-2"
                : "border-[var(--border-default)] bg-surface hover:border-[var(--border-strong)]",
            )}
            style={
              active
                ? { background: `color-mix(in oklab, ${s.color} 14%, transparent)`, ["--tw-ring-color" as string]: s.color }
                : undefined
            }
          >
            <span className="text-3xl">{s.emoji}</span>
            <span className="text-sm font-medium text-foreground">{s.label}</span>
            {active && <Icon name="check-circle" className="size-4" style={{ color: s.color }} />}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Courts builder ---------- */
export function CourtsStep({
  state,
  update,
}: {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}) {
  const remove = (id: string) => update({ courts: state.courts.filter((c) => c.id !== id) });
  const addForSport = (sport: Sport) => {
    const count = state.courts.filter((c) => c.sport === sport).length + 1;
    const label = SPORT_LIST.find((s) => s.id === sport)!.label;
    update({
      courts: [...state.courts, { id: `${sport}-${Date.now()}`, name: `${label} ${count}`, sport }],
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {state.sports.map((sport) => {
          const s = SPORT_LIST.find((x) => x.id === sport)!;
          return (
            <button
              key={sport}
              type="button"
              onClick={() => addForSport(sport)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-surface px-3 py-1.5 text-sm text-ink-secondary transition-colors hover:border-[var(--border-strong)] hover:text-foreground"
            >
              <Icon name="plus" className="size-3.5" /> {s.emoji} {s.label}
            </button>
          );
        })}
      </div>

      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {state.courts.length === 0 && (
          <p className="rounded-xl border border-dashed border-[var(--border-default)] p-6 text-center text-sm text-ink-tertiary">
            Tap a sport above to add courts.
          </p>
        )}
        {state.courts.map((court) => {
          const s = SPORT_LIST.find((x) => x.id === court.sport)!;
          return (
            <div
              key={court.id}
              className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-surface px-3.5 py-2.5"
            >
              <span
                className="flex size-8 items-center justify-center rounded-lg text-sm"
                style={{ background: `color-mix(in oklab, ${s.color} 18%, transparent)` }}
              >
                {s.emoji}
              </span>
              <span className="flex-1 text-sm font-medium text-foreground">{court.name}</span>
              <button
                type="button"
                onClick={() => remove(court.id)}
                className="text-ink-tertiary transition-colors hover:text-danger"
                aria-label="Remove court"
              >
                <Icon name="x" className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Invite team ---------- */
export function InviteStep({
  state,
  update,
}: {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}) {
  const add = (email: string) => {
    const v = email.trim();
    if (v && !state.invites.includes(v)) update({ invites: [...state.invites, v] });
  };
  const remove = (email: string) => update({ invites: state.invites.filter((e) => e !== email) });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="invite">Invite teammates (optional)</Label>
        <Input
          id="invite"
          type="email"
          placeholder="Type an email and press Enter"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add((e.target as HTMLInputElement).value);
              (e.target as HTMLInputElement).value = "";
            }
          }}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {state.invites.map((email) => (
          <span
            key={email}
            className="inline-flex items-center gap-1.5 rounded-full bg-grad-brand-soft px-3 py-1 text-sm text-foreground"
          >
            {email}
            <button onClick={() => remove(email)} aria-label="Remove" className="text-ink-tertiary hover:text-danger">
              <Icon name="x" className="size-3.5" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Skill level (member) ---------- */
const SKILLS = [
  { id: "beginner", label: "Beginner", desc: "New to the game" },
  { id: "intermediate", label: "Intermediate", desc: "Comfortable rallying" },
  { id: "advanced", label: "Advanced", desc: "Competitive player" },
];

export function SkillStep({
  state,
  update,
}: {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}) {
  return (
    <div className="grid gap-3">
      {SKILLS.map((skill) => {
        const active = state.skill === skill.id;
        return (
          <button
            key={skill.id}
            type="button"
            onClick={() => update({ skill: skill.id })}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200",
              active
                ? "border-transparent bg-grad-brand-soft ring-2 ring-brand"
                : "border-[var(--border-default)] bg-surface hover:border-[var(--border-strong)]",
            )}
          >
            <span className="flex-1">
              <span className="block font-medium text-foreground">{skill.label}</span>
              <span className="block text-xs text-ink-tertiary">{skill.desc}</span>
            </span>
            {active && <Icon name="check-circle" className="size-5 text-brand" />}
          </button>
        );
      })}
    </div>
  );
}
