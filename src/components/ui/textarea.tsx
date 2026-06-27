import * as React from "react";
import { cn } from "@/lib/utils/cn";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-24 w-full rounded-md border border-[var(--border-default)] bg-surface px-3.5 py-2.5 text-sm text-foreground shadow-[var(--sh-1)] transition-colors duration-200",
      "placeholder:text-ink-tertiary",
      "focus-visible:border-[var(--border-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "aria-[invalid=true]:border-danger",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
