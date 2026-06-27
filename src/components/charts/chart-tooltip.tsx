import type { TooltipProps } from "recharts";

/** Premium glass tooltip for Recharts charts. */
export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: TooltipProps<number, string> & { formatter?: (value: number, name: string) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-raised/95 px-3 py-2 shadow-[var(--sh-3)] backdrop-blur-xl">
      {label != null && (
        <p className="mb-1 text-xs font-medium text-ink-tertiary">{String(label)}</p>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span
              className="size-2 rounded-full"
              style={{ background: entry.color ?? entry.stroke ?? "var(--brand)" }}
            />
            <span className="text-ink-secondary">{entry.name}</span>
            <span className="tnum ml-auto font-semibold text-foreground">
              {formatter && typeof entry.value === "number"
                ? formatter(entry.value, String(entry.name))
                : entry.value?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
