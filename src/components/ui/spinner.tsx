import { cn } from "@/lib/utils/cn";

const sizes = { sm: "size-4 border-2", md: "size-6 border-2", lg: "size-9 border-[3px]" };

export function Spinner({
  size = "md",
  className,
}: {
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block animate-spin rounded-full border-white/10 border-t-brand",
        sizes[size],
        className,
      )}
    />
  );
}
