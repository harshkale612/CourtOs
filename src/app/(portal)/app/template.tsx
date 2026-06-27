import { PageTransition } from "@/components/motion/page-transition";

/** Re-mounts on every navigation within the portal, animating route changes. */
export default function PortalTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
