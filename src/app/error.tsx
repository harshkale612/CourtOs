"use client";

import { useEffect } from "react";
import { GlowBlob } from "@/components/brand/glow-blob";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Phase 10: wire to telemetry.
    console.error(error);
  }, [error]);

  return (
    <div className="mesh-bg relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <GlowBlob color="var(--danger)" size={460} opacity={0.2} className="left-1/2 top-1/3 -translate-x-1/2" />
      <div className="glass w-full max-w-md rounded-3xl p-10">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-danger/15 text-danger">
          <Icon name="triangle-alert" className="size-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Something went off court</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          An unexpected error occurred. Most issues clear up on a retry.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={reset}>
            <Icon name="zap" className="size-4" /> Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
