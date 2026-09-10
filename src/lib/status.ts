/* ────────────────────────────────────────────────────────────────────
   Booking status styling — Pending: yellow, Confirmed: emerald,
   Cancelled: rose.
   ──────────────────────────────────────────────────────────────────── */

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export const BOOKING_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "cancelled",
];

export const statusStyles: Record<
  BookingStatus,
  { badge: string; dot: string; label: string }
> = {
  pending: {
    badge: "bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/30",
    dot: "bg-amber-400",
    label: "Pending",
  },
  confirmed: {
    badge: "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/30",
    dot: "bg-emerald-400",
    label: "Confirmed",
  },
  cancelled: {
    badge: "bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/30",
    dot: "bg-rose-400",
    label: "Cancelled",
  },
};

export function isBookingStatus(value: string): value is BookingStatus {
  return (BOOKING_STATUSES as string[]).includes(value);
}
