import type { Metadata } from "next";
import { ContactForm } from "@/features/marketing/contact-form";
import { siteConfig } from "@/config/site";
import { GradientText } from "@/components/brand/gradient-text";
import { GlowBlob } from "@/components/brand/glow-blob";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the CourtOS team.",
};

const CHANNELS = [
  { icon: "mail", title: "Email us", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
  { icon: "calendar-plus", title: "Book a demo", value: "See it live in 20 minutes", href: "/demo" },
  { icon: "book-open", title: "Read the blog", value: "Guides for club operators", href: "/blog" },
];

export default function ContactPage() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-36 lg:pt-44">
      <GlowBlob color="var(--accent-purple)" size={500} opacity={0.2} className="-right-20 top-10" />
      <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Let&apos;s <GradientText>talk</GradientText>
          </h1>
          <p className="mt-5 max-w-lg text-pretty text-lg text-ink-secondary">
            Questions about CourtOS, pricing, or migrating your club? We&apos;re here and we reply
            fast.
          </p>
          <div className="mt-8 space-y-3">
            {CHANNELS.map((c) => (
              <a
                key={c.title}
                href={c.href}
                className="flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] bg-raised p-4 transition-colors hover:border-[var(--border-strong)]"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-grad-brand-soft text-brand">
                  <Icon name={c.icon} className="size-5" />
                </span>
                <div>
                  <p className="font-medium text-foreground">{c.title}</p>
                  <p className="text-sm text-ink-secondary">{c.value}</p>
                </div>
                <Icon name="arrow-right" className="ml-auto size-4 text-ink-tertiary" />
              </a>
            ))}
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
