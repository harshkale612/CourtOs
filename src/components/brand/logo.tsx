import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { siteConfig } from "@/config/site";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-9 items-center justify-center rounded-xl bg-grad-brand shadow-[var(--glow-brand)]",
        className,
      )}
    >
      <svg viewBox="0 0 32 32" className="size-5" fill="none" aria-hidden>
        <path
          d="M22.5 10.2 A8 8 0 1 0 22.5 21.8"
          stroke="white"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function Logo({
  className,
  href = "/",
  showWordmark = true,
}: {
  className?: string;
  href?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)}>
      <LogoMark className="transition-transform duration-300 group-hover:scale-105" />
      {showWordmark && (
        <span className="text-lg font-bold tracking-tight text-foreground">{siteConfig.name}</span>
      )}
    </Link>
  );
}
