import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/brand/logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Testimonials", href: "/testimonials" },
      { label: "Book a demo", href: "/demo" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
      { label: "Sign in", href: "/login" },
      { label: "Get started", href: "/signup" },
    ],
  },
  {
    title: "Sports",
    links: [
      { label: "Tennis", href: "/features" },
      { label: "Pickleball", href: "/features" },
      { label: "Padel", href: "/features" },
      { label: "Badminton & Squash", href: "/features" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="relative border-t border-[var(--border-subtle)] px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-ink-secondary">{siteConfig.tagline}</p>
          <p className="text-xs text-ink-tertiary">
            © {2026} {siteConfig.name}. Crafted for premium racquet clubs.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title} className="space-y-3">
            <p className="text-sm font-semibold text-foreground">{col.title}</p>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-secondary transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
