"use client";

import { useShopCartStore } from "@/stores/shop-cart-store";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { useReorder } from "./hooks";

/**
 * Buy it again. Re-prices the basket at today's prices, drops anything that's
 * gone, and opens the cart so the member can adjust before paying.
 */
export function ReorderButton({
  orderId,
  className,
  variant = "secondary",
  size = "sm",
  label = "Reorder",
}: {
  orderId: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const addLine = useShopCartStore((s) => s.addLine);
  const setOpen = useShopCartStore((s) => s.setOpen);
  const reorder = useReorder();

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={reorder.isPending}
      onClick={() =>
        reorder.mutate(orderId, {
          onSuccess: (result) => {
            // Drop the server-side line id — the cart mints its own.
            for (const { id, ...line } of result.lineItems) {
              void id;
              addLine(line);
            }
            setOpen(true);
          },
        })
      }
    >
      {reorder.isPending ? (
        <>
          <Spinner size="sm" /> Adding…
        </>
      ) : (
        <>
          <Icon name="rotate-ccw" className="size-4" /> {label}
        </>
      )}
    </Button>
  );
}
