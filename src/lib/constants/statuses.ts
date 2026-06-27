import type { BookingStatus, PaymentStatus, WaitlistStatus } from "@/types";

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

export interface StatusConfig {
  label: string;
  tone: StatusTone;
}

/** Maps a tone to the Tailwind utility classes used by <Badge tone>. */
export const TONE_CLASSES: Record<StatusTone, string> = {
  success: "bg-emerald/12 text-emerald border-emerald/20",
  warning: "bg-orange/12 text-orange border-orange/20",
  danger: "bg-danger/12 text-danger border-danger/20",
  info: "bg-cyan/12 text-cyan border-cyan/20",
  neutral: "bg-white/8 text-ink-secondary border-white/10",
};

export const BOOKING_STATUS: Record<BookingStatus, StatusConfig> = {
  confirmed: { label: "Confirmed", tone: "success" },
  pending: { label: "Pending", tone: "warning" },
  cancelled: { label: "Cancelled", tone: "danger" },
  completed: { label: "Completed", tone: "neutral" },
  no_show: { label: "No-show", tone: "danger" },
};

export const PAYMENT_STATUS: Record<PaymentStatus, StatusConfig> = {
  paid: { label: "Paid", tone: "success" },
  due: { label: "Due", tone: "warning" },
  failed: { label: "Failed", tone: "danger" },
  refunded: { label: "Refunded", tone: "info" },
};

export const WAITLIST_STATUS: Record<WaitlistStatus, StatusConfig> = {
  waiting: { label: "Waiting", tone: "info" },
  offered: { label: "Offer sent", tone: "warning" },
  claimed: { label: "Claimed", tone: "success" },
  expired: { label: "Expired", tone: "neutral" },
};
