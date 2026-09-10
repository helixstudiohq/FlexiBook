import type { BookingStatus } from "./status";

/* ────────────────────────────────────────────────────────────────────
   Shared FlexiBook types
   ──────────────────────────────────────────────────────────────────── */

export interface Service {
  id: string;
  name: string;
  description: string;
  /** Price in USD */
  price: number;
  /** Duration in minutes */
  duration: number;
  category: string;
  /** Lucide icon name used by the UI */
  icon: string;
  /** Featured marker on the landing grid */
  popular?: boolean;
}

export interface Booking {
  id: string;
  service_id: string;
  service_name: string;
  customer_name: string;
  customer_email: string;
  /** E.164 or free-form, kept as text */
  customer_phone: string;
  /** yyyy-mm-dd */
  booking_date: string;
  /** HH:mm (24h) */
  booking_time: string;
  notes: string;
  status: BookingStatus;
  created_at: string;
}

/** Data submitted from Step 3 of the booking wizard. */
export interface BookingDraft {
  serviceId: string;
  bookingDate: string;
  bookingTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
}

export { BookingStatus };
