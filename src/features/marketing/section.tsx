import { cn } from "@/lib/utils/cn";
import { SectionHeading } from "./section-heading";

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("px-6 py-16 lg:py-24", className)}>
      <div className="mx-auto max-w-6xl">
        {title && (
          <div className="mb-12">
            <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} align={align} />
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
