import type { OrderChannel, OrderFulfillment, PosLineItem, PosPayment } from "@/types";
import { db } from "@/lib/mock/data";
import { ANCHOR_DATE } from "@/lib/mock/prng";
import { LINE_ITEM_KINDS, POS_PAYMENT_METHODS, TAX_LABEL } from "@/lib/constants/pos";
import { FULFILLMENT_STATUS, ORDER_CHANNELS, PICKUP_METHODS } from "@/lib/constants/commerce";
import { formatCurrency, formatLongDate, formatTime } from "@/lib/utils/format";
import { lineNet, round2 } from "@/lib/utils/pos";
import { cn } from "@/lib/utils/cn";

export interface ReceiptData {
  number?: string;
  /** Defaults to a desk sale; online orders name the shop, not a cashier. */
  channel?: OrderChannel;
  cashierName: string;
  customerName?: string;
  fulfillment?: OrderFulfillment;
  lineItems: PosLineItem[];
  subtotal: number;
  discountTotal: number;
  tax: number;
  total: number;
  payments?: PosPayment[];
  createdAt?: string;
  note?: string;
}

function Row({ label, value, strong, negative }: { label: string; value: string; strong?: boolean; negative?: boolean }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-3", strong && "text-base font-bold")}>
      <span className={cn(strong ? "text-foreground" : "text-ink-secondary")}>{label}</span>
      <span className={cn("tnum", strong ? "text-foreground" : "text-foreground", negative && "text-danger")}>
        {value}
      </span>
    </div>
  );
}

const Divider = () => <div className="my-3 border-t border-dashed border-(--border-default)" />;

/** A print-ready receipt — the single invoice for a unified POS transaction. */
export function Receipt({ order, className }: { order: ReceiptData; className?: string }) {
  const createdAt = order.createdAt ?? ANCHOR_DATE.toISOString();
  return (
    <div
      className={cn(
        "pos-receipt mx-auto w-full max-w-sm rounded-2xl border border-(--border-default) bg-surface p-6 text-sm text-foreground shadow-sh-2",
        className,
      )}
    >
      {/* header */}
      <div className="text-center">
        <div className="mx-auto mb-2 flex size-11 items-center justify-center rounded-xl bg-grad-brand text-lg font-bold text-white shadow-glow-brand">
          B
        </div>
        <p className="text-base font-bold tracking-tight">{db.org.name}</p>
        <p className="mt-0.5 text-xs text-ink-tertiary">{db.facilities[0]?.address}</p>
      </div>

      <Divider />

      {/* meta */}
      <div className="space-y-1 text-xs">
        {order.number && <Row label="Receipt" value={order.number} />}
        <Row label="Date" value={`${formatLongDate(createdAt)} · ${formatTime(createdAt)}`} />
        {order.channel === "online" ? (
          <Row label="Placed" value={ORDER_CHANNELS.online.label} />
        ) : (
          <Row label="Cashier" value={order.cashierName} />
        )}
        <Row label="Customer" value={order.customerName ?? "Walk-in"} />
      </div>

      {/* pickup */}
      {order.fulfillment && (
        <>
          <Divider />
          <div className="space-y-1 text-xs">
            <Row label="Pickup" value={PICKUP_METHODS[order.fulfillment.method].label} />
            <Row label="Where" value={order.fulfillment.location} />
            <Row label="Status" value={FULFILLMENT_STATUS[order.fulfillment.status].label} />
          </div>
        </>
      )}

      <Divider />

      {/* line items */}
      <div className="space-y-2.5">
        {order.lineItems.map((item) => {
          const isService = item.kind !== "product";
          const kindCfg = LINE_ITEM_KINDS[item.kind];
          return (
            <div key={item.id}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 font-medium">
                  <span className="mr-1" aria-hidden>{item.emoji ?? "•"}</span>
                  {item.name}
                </span>
                <span className="tnum shrink-0 font-semibold">
                  {formatCurrency(lineNet(item))}
                </span>
              </div>
              <div className="mt-0.5 flex items-center justify-between gap-2 pl-5 text-xs text-ink-tertiary">
                <span className="tnum">
                  {item.quantity} × {formatCurrency(item.unitPrice)}
                  {item.discount > 0 && (
                    <span className="ml-1 text-danger">− {formatCurrency(item.discount)}</span>
                  )}
                </span>
                {isService && (
                  <span style={{ color: kindCfg.color }} className="font-medium">
                    {kindCfg.label}
                  </span>
                )}
              </div>
              {item.note && <p className="pl-5 text-xs italic text-ink-tertiary">“{item.note}”</p>}
            </div>
          );
        })}
      </div>

      <Divider />

      {/* totals */}
      <div className="space-y-1.5">
        <Row label="Subtotal" value={formatCurrency(order.subtotal)} />
        {order.discountTotal > 0 && (
          <Row label="Discount" value={`− ${formatCurrency(order.discountTotal)}`} negative />
        )}
        <Row label={`${TAX_LABEL} (13%)`} value={formatCurrency(order.tax)} />
        <div className="my-1.5 border-t border-(--border-default)" />
        <Row label="Total" value={formatCurrency(order.total)} strong />
      </div>

      {order.payments && order.payments.length > 0 && (
        <>
          <Divider />
          <div className="space-y-1.5 text-xs">
            {order.payments.map((p, i) => {
              const cfg = POS_PAYMENT_METHODS[p.method];
              const change =
                p.method === "cash" && p.tendered ? round2(p.tendered - p.amount) : 0;
              return (
                <div key={i}>
                  <Row label={`Paid · ${cfg.label}`} value={formatCurrency(p.amount)} />
                  {p.method === "cash" && p.tendered ? (
                    <div className="flex items-center justify-between text-ink-tertiary">
                      <span>Tendered {formatCurrency(p.tendered)}</span>
                      <span className="tnum">Change {formatCurrency(change)}</span>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </>
      )}

      {order.note && (
        <>
          <Divider />
          <p className="text-xs italic text-ink-secondary">Note: {order.note}</p>
        </>
      )}

      <Divider />
      <p className="text-center text-xs text-ink-tertiary">
        Thank you! See you on court 🎾
      </p>
    </div>
  );
}
