import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/features/marketing/content";
import { formatLongDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { CtaSection } from "@/features/marketing/cta-section";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  return { title: post?.title ?? "Article", description: post?.excerpt };
}

const BODY = [
  "Running a racquet club has always been a balancing act between keeping members happy and keeping courts full. For years, the tools available made that harder than it needed to be — clunky booking flows, opaque pricing, and analytics that raised more questions than they answered.",
  "The clubs that win treat their court schedule like a product. They make booking effortless, they price intelligently, and they use data to turn quiet hours into reliable revenue.",
  "In this piece we'll walk through a practical framework you can apply this week — no consultants, no spreadsheets, and no guesswork required.",
  "Start by looking at your utilization heatmap. The pattern is almost always the same: prime-time evenings sell out while mid-afternoons sit empty. The opportunity isn't to discount your way out of it — it's to give different members different reasons to play at different times.",
  "Done well, this shifts demand without eroding your margins, and it makes your club feel busier, more social, and more valuable to every member who walks through the door.",
];

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <>
      <article className="px-6 pb-16 pt-32 lg:pt-40">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-ink-secondary transition-colors hover:text-foreground"
          >
            <Icon name="chevron-left" className="size-4" /> All articles
          </Link>

          <div className="mt-6 flex items-center gap-3">
            <Badge tone="info">{post.category}</Badge>
            <span className="text-sm text-ink-tertiary">
              {formatLongDate(post.date)} · {post.readingTime}
            </span>
          </div>

          <h1 className="mt-4 text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-ink-secondary">{post.excerpt}</p>

          <div className="mt-6 flex items-center gap-2 text-sm text-ink-secondary">
            <span className="font-medium text-foreground">{post.author}</span>
          </div>

          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl border border-[var(--border-subtle)]">
            <Image src={post.cover} alt={post.title} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" priority />
          </div>

          <div className="mt-10 space-y-6">
            {BODY.map((para, i) => (
              <p key={i} className="text-pretty text-base leading-relaxed text-ink-secondary sm:text-lg">
                {para}
              </p>
            ))}
          </div>
        </div>
      </article>

      <CtaSection />
    </>
  );
}
