import { cn } from "@/lib/utils/cn";
import { Icon, type IconName } from "./icon";

export function EmptyState({
  icon = "sparkles",
  title,
  description,
  action,
  className,
}: {
  icon?: IconName;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-default)] px-6 py-16 text-center",
        className,
      )}
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 -z-10 rounded-2xl bg-grad-brand opacity-30 blur-2xl" />
        <div className="flex size-14 items-center justify-center rounded-2xl border border-[var(--border-default)] bg-raised">
          <Icon name={icon} className="size-6 text-brand" />
        </div>
      </div>
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      {description && <p className="mt-1.5 max-w-xs text-sm text-ink-secondary">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
