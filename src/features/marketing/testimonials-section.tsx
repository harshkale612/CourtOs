import Image from "next/image";
import { TESTIMONIALS, type Testimonial } from "./content";
import { avatarPortrait } from "@/lib/mock/images";
import { Icon } from "@/components/ui/icon";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="flex h-full break-inside-avoid flex-col gap-4 rounded-2xl border border-[var(--border-subtle)] bg-raised p-6 transition-colors hover:border-[var(--border-strong)]">
      <div className="flex gap-0.5">
        {Array.from({ length: t.rating }).map((_, i) => (
          <Icon key={i} name="star" className="size-4 fill-warning text-warning" />
        ))}
      </div>
      <blockquote className="text-pretty text-sm leading-relaxed text-foreground">
        “{t.quote}”
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3 pt-2">
        <Image
          src={avatarPortrait(t.name)}
          alt={t.name}
          width={40}
          height={40}
          className="size-10 rounded-full border border-[var(--border-default)]"
          unoptimized
        />
        <div>
          <p className="text-sm font-semibold text-foreground">{t.name}</p>
          <p className="text-xs text-ink-tertiary">
            {t.role} · {t.club}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

export function TestimonialsSection({ limit }: { limit?: number }) {
  const items = limit ? TESTIMONIALS.slice(0, limit) : TESTIMONIALS;
  return (
    <StaggerContainer className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
      {items.map((t) => (
        <StaggerItem key={t.name}>
          <TestimonialCard t={t} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
