import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BLOG_POSTS } from "@/features/marketing/content";
import { PageHeader } from "@/features/marketing/page-header";
import { Section } from "@/features/marketing/section";
import { formatLongDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights on running a world-class racquet club.",
};

export default function BlogPage() {
  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="Insights for"
        highlight="club operators"
        subtitle="Playbooks on booking, pricing, retention, and growth — from the team behind CourtOS."
      />

      <Section className="!pt-4">
        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {BLOG_POSTS.map((post) => (
            <StaggerItem key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-raised transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-[var(--sh-3)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={post.cover}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-raised)] to-transparent opacity-60" />
                  <Badge tone="info" className="absolute left-3 top-3">
                    {post.category}
                  </Badge>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-balance text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-brand">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-ink-secondary">{post.excerpt}</p>
                  <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-ink-tertiary">
                    <span>{post.author}</span>
                    <span>·</span>
                    <span>{formatLongDate(post.date)}</span>
                    <span>·</span>
                    <span>{post.readingTime}</span>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Section>
    </>
  );
}
