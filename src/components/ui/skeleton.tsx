import { cn } from "@/lib/utils/cn";

/** Shimmer skeleton. Match the final element's radius via className. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-(--skeleton-base)",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.4s_infinite] after:bg-linear-to-r after:from-transparent after:via-(--skeleton-shimmer) after:to-transparent",
        className,
      )}
      {...props}
    />
  );
}
