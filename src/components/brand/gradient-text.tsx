import { cn } from "@/lib/utils/cn";

/** Headline treatment using the signature --grad-text. */
export function GradientText({
  children,
  className,
  as: Tag = "span",
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  return <Tag className={cn("text-gradient", className)}>{children}</Tag>;
}
