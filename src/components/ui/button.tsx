"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-[transform,filter,background-color,box-shadow,border-color] duration-200 ease-[var(--e-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-grad-brand text-white shadow-[var(--glow-brand)] hover:brightness-110 hover:-translate-y-px",
        secondary:
          "glass text-foreground hover:border-[var(--border-strong)] hover:bg-white/[0.06]",
        ghost: "text-ink-secondary hover:bg-white/[0.06] hover:text-foreground",
        outline:
          "border border-[var(--border-default)] bg-transparent text-foreground hover:border-[var(--border-strong)] hover:bg-white/[0.04]",
        destructive:
          "bg-danger text-white shadow-[var(--glow-pink)] hover:brightness-110 hover:-translate-y-px",
        sport:
          "text-white shadow-[0_8px_32px_-6px_var(--sport-accent)] hover:brightness-110 hover:-translate-y-px",
        link: "text-brand underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-10 px-5 text-sm",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    // sport variant fills with the live --sport-accent token
    const sportStyle = variant === "sport" ? { background: "var(--sport-accent)", ...style } : style;
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        style={sportStyle}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
