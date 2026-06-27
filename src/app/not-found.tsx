import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { GlowBlob } from "@/components/brand/glow-blob";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export default function NotFound() {
  return (
    <div className="mesh-bg relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <GlowBlob color="var(--accent-purple)" size={500} opacity={0.25} className="left-1/2 top-1/4 -translate-x-1/2" />
      <div className="absolute left-6 top-6">
        <Logo />
      </div>
      <p className="text-gradient text-8xl font-bold tracking-tight">404</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">This court doesn’t exist</h1>
      <p className="mt-2 max-w-sm text-pretty text-ink-secondary">
        The page you’re looking for is out of bounds. Let’s get you back in the game.
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" asChild>
          <Link href="/">
            <Icon name="home" className="size-4" /> Back home
          </Link>
        </Button>
        <Button size="lg" variant="secondary" asChild>
          <Link href="/app/booking">Book a court</Link>
        </Button>
      </div>
    </div>
  );
}
