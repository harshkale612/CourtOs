import { PageTransition } from "@/components/motion/page-transition";

/** Re-mounts on every navigation within the admin app, animating route changes. */
export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
