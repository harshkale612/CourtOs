import { MarketingNav } from "@/features/marketing/marketing-nav";
import { MarketingFooter } from "@/features/marketing/marketing-footer";
import { ScrollToTop } from "@/features/marketing/scroll-to-top";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-x-clip bg-canvas">
      <MarketingNav />
      <main>{children}</main>
      <MarketingFooter />
      <ScrollToTop />
    </div>
  );
}
