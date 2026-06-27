"use client";

import type { Role } from "@/types";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";

interface RoleOption {
  role: Role;
  label: string;
  description: string;
  icon: string;
}

const OPTIONS: RoleOption[] = [
  { role: "owner", label: "Manage a club", description: "Owner / administrator", icon: "layout-dashboard" },
  { role: "coach", label: "Coach", description: "Run sessions & clinics", icon: "whistle" },
  { role: "member", label: "Play & book", description: "Member", icon: "user" },
];

export function RoleSelect({ value, onChange }: { value: Role; onChange: (role: Role) => void }) {
  return (
    <div className="grid gap-2.5" role="radiogroup" aria-label="How will you use CourtOS?">
      {OPTIONS.map((opt) => {
        const active = value === opt.role;
        return (
          <button
            key={opt.role}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.role)}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200",
              active
                ? "border-transparent bg-grad-brand-soft ring-2 ring-brand"
                : "border-[var(--border-default)] bg-surface hover:border-[var(--border-strong)]",
            )}
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                active ? "bg-grad-brand text-white" : "bg-white/[0.05] text-ink-secondary",
              )}
            >
              <Icon name={opt.icon} className="size-4" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium text-foreground">{opt.label}</span>
              <span className="block text-xs text-ink-tertiary">{opt.description}</span>
            </span>
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full border transition-colors",
                active ? "border-brand bg-brand text-white" : "border-[var(--border-strong)]",
              )}
            >
              {active && <Icon name="check" className="size-3" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
