import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { AuthBrandPanel } from "./auth-brand-panel";

/** Split-screen auth layout: brand panel (lg+) beside a centered form column. */
export function AuthSplit({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <AuthBrandPanel />
      <div className="flex flex-col">
        {/* mobile logo */}
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <p className="pb-6 text-center text-xs text-ink-tertiary">
          By continuing you agree to our{" "}
          <Link href="/" className="underline-offset-2 hover:text-ink-secondary hover:underline">
            Terms
          </Link>{" "}
          &amp;{" "}
          <Link href="/" className="underline-offset-2 hover:text-ink-secondary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
