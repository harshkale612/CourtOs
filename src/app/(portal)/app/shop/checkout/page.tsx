"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { PosOrder } from "@/types";
import { ANCHOR_DATE } from "@/lib/mock/prng";
import { PICKUP_METHODS } from "@/lib/constants/commerce";
import { formatCurrency, formatRelativeDay } from "@/lib/utils/format";
import { computeTotals, lineNet } from "@/lib/utils/pos";
import { useShopCartStore } from "@/stores/shop-cart-store";
import { useSessionUser } from "@/features/auth/use-session-user";
import { useReservations } from "@/features/reservations/hooks";
import { PaymentSelect, type PaymentChoice } from "@/features/payments/payment-select";
import { usePlaceShopOrder } from "@/features/shop/hooks";
import { PickupSelect } from "@/features/shop/pickup-select";
import { OrderSummary } from "@/features/shop/order-summary";
import { ProductThumb } from "@/features/pos/product-thumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";

export default function ShopCheckoutPage() {
  const router = useRouter();
  const user = useSessionUser();
  const items = useShopCartStore((s) => s.items);
  const pickup = useShopCartStore((s) => s.pickup);
  const pickupNote = useShopCartStore((s) => s.pickupNote);
  const reservationId = useShopCartStore((s) => s.reservationId);
  const setPickup = useShopCartStore((s) => s.setPickup);
  const setPickupNote = useShopCartStore((s) => s.setPickupNote);
  const clear = useShopCartStore((s) => s.clear);

  const { data: reservations } = useReservations(user.id);
  const placeOrder = usePlaceShopOrder(user.id);
  const [payment, setPayment] = useState<PaymentChoice | null>(null);
  const [done, setDone] = useState<PosOrder | null>(null);

  const totals = computeTotals(items);
  const upcoming = useMemo(
    () =>
      (reservations ?? [])
        .filter((r) => r.status !== "cancelled" && +new Date(r.start) >= +ANCHOR_DATE)
        .sort((a, b) => +new Date(a.start) - +new Date(b.start)),
    [reservations],
  );

  const submit = () => {
    if (!payment || !items.length) return;
    const session = upcoming.find((r) => r.id === reservationId);
    placeOrder.mutate(
      {
        userId: user.id,
        userName: user.name,
        lineItems: items,
        payment,
        pickup: {
          method: pickup,
          reservationId: pickup === "after_booking" ? reservationId : undefined,
          readyAt: pickup === "after_booking" ? session?.end : undefined,
          note: pickupNote || undefined,
        },
        reservationId: pickup === "after_booking" ? reservationId : undefined,
      },
      {
        onSuccess: (order) => {
          setDone(order);
          clear();
        },
      },
    );
  };

  /* ------------------------------ confirmation ---------------------------- */
  if (done) {
    const cfg = PICKUP_METHODS[done.fulfillment?.method ?? "reception"];
    return (
      <div className="mx-auto max-w-lg py-6 text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 18 }}
          className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald/15 text-emerald"
        >
          <Icon name="check" className="size-9" strokeWidth={3} />
        </motion.div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Order confirmed 🎉</h1>
        <p className="mt-2 text-ink-secondary">
          {done.number} · {formatCurrency(done.total)} paid with{" "}
          {done.payments[0]?.reference ?? "your card"}.
        </p>

        <div className="mt-6 rounded-2xl border border-(--border-subtle) bg-raised p-5 text-left">
          <div className="flex items-start gap-3">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: `color-mix(in oklab, ${cfg.color} 16%, transparent)`,
                color: cfg.color,
              }}
            >
              <Icon name={cfg.icon} className="size-5" />
            </span>
            <div>
              <p className="font-semibold tracking-tight">{cfg.label}</p>
              <p className="text-sm text-ink-secondary">{done.fulfillment?.location}</p>
              {done.fulfillment?.readyAt && (
                <p className="mt-1 text-xs text-ink-tertiary">
                  Ready {formatRelativeDay(done.fulfillment.readyAt)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" className="flex-1" asChild>
            <Link href="/app/shop">Keep shopping</Link>
          </Button>
          <Button className="flex-1" asChild>
            <Link href={`/app/shop/orders/${done.id}`}>
              Track pickup <Icon name="arrow-right" className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  /* -------------------------------- empty --------------------------------- */
  if (!items.length) {
    return (
      <EmptyState
        icon="shopping-bag"
        title="Your cart is empty"
        description="Add a few things from the pro shop and come back to check out."
        action={
          <Button size="sm" asChild>
            <Link href="/app/shop">Browse the shop</Link>
          </Button>
        }
      />
    );
  }

  /* ------------------------------- checkout ------------------------------- */
  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2" onClick={() => router.back()}>
          <Icon name="chevron-left" className="size-4" /> Back
        </Button>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Checkout</h1>
        <p className="mt-1 text-ink-secondary">
          Pay with your card on file — the same way you pay for court time.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          {/* items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="shopping-bag" className="size-5 text-brand" /> Your items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.map((line) => (
                <div
                  key={line.id}
                  className="flex items-center gap-3 rounded-xl border border-(--border-subtle) bg-surface p-3"
                >
                  <ProductThumb
                    category={line.category ?? "merch"}
                    emoji={line.emoji}
                    imageUrl={line.imageUrl}
                    name={line.name}
                    className="size-12 shrink-0 rounded-lg"
                    emojiClassName="text-xl"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{line.name}</p>
                    <p className="tnum text-xs text-ink-tertiary">
                      {line.quantity} × {formatCurrency(line.unitPrice)}
                    </p>
                  </div>
                  <span className="tnum text-sm font-semibold text-foreground">
                    {formatCurrency(lineNet(line))}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* pickup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="concierge-bell" className="size-5 text-brand" /> Pickup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <PickupSelect
                value={pickup}
                reservationId={reservationId}
                onChange={setPickup}
                reservations={upcoming}
              />
              <Input
                value={pickupNote}
                onChange={(e) => setPickupNote(e.target.value)}
                placeholder="Anything the desk should know? (optional)"
                className="h-10 text-sm"
                aria-label="Pickup note"
              />
            </CardContent>
          </Card>

          {/* payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="credit-card" className="size-5 text-brand" /> Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <PaymentSelect
                userId={user.id}
                amount={totals.total}
                value={payment}
                onChange={setPayment}
              />
              <Button variant="ghost" size="sm" asChild className="-ml-2">
                <Link href="/app/payments">
                  <Icon name="plus" className="size-4" /> Manage payment methods
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* summary rail */}
        <div className="lg:sticky lg:top-6 lg:h-fit">
          <Card>
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <OrderSummary items={items} />
              <div className="flex items-center gap-2 rounded-xl bg-fill-2 px-3 py-2.5 text-xs text-ink-secondary">
                <Icon name="info" className="size-4 shrink-0 text-ink-tertiary" />
                {PICKUP_METHODS[pickup].blurb}
              </div>
              <Button
                size="lg"
                className="w-full"
                disabled={!payment || placeOrder.isPending}
                onClick={submit}
              >
                {placeOrder.isPending ? (
                  <>
                    <Spinner size="sm" /> Processing…
                  </>
                ) : (
                  <>
                    <Icon name="check" className="size-4" /> Pay {formatCurrency(totals.total)}
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-ink-tertiary">
                You&apos;ll get a notification the moment it&apos;s ready to collect.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
