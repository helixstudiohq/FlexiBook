import { getSupabase, isSupabaseConfigured, BOOKINGS_TABLE } from "./supabase";
import {
  loadDemoBookings,
  ensureDemoSeed,
  saveDemoBooking,
  updateDemoBookingStatus,
} from "./demoStore";
import type { Booking, BookingDraft, BookingStatus } from "./types";
import { getServiceById } from "./services";

/* ────────────────────────────────────────────────────────────────────
   Data layer: transparently switches between Supabase (live) and the
   local demo store (no credentials). Same API everywhere.
   ──────────────────────────────────────────────────────────────────── */

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `bk_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function draftToBooking(draft: BookingDraft): Booking {
  const service = getServiceById(draft.serviceId);
  return {
    id: makeId(),
    service_id: draft.serviceId,
    service_name: service?.name ?? "FlexiBook Service",
    customer_name: draft.customerName.trim(),
    customer_email: draft.customerEmail.trim(),
    customer_phone: draft.customerPhone.trim(),
    booking_date: draft.bookingDate,
    booking_time: draft.bookingTime,
    notes: draft.notes.trim(),
    status: "pending",
    created_at: new Date().toISOString(),
  };
}

function normalize(row: Record<string, unknown>): Booking {
  const status = String(row.status ?? "pending");
  return {
    id: String(row.id ?? makeId()),
    service_id: String(row.service_id ?? ""),
    service_name: String(row.service_name ?? "FlexiBook Service"),
    customer_name: String(row.customer_name ?? ""),
    customer_email: String(row.customer_email ?? ""),
    customer_phone: String(row.customer_phone ?? ""),
    booking_date: String(row.booking_date ?? ""),
    booking_time: String(row.booking_time ?? ""),
    notes: String(row.notes ?? ""),
    status:
      status === "confirmed" || status === "cancelled"
        ? status
        : ("pending" as BookingStatus),
    created_at: String(row.created_at ?? new Date().toISOString()),
  };
}

/** All bookings, newest first. */
export async function fetchBookings(): Promise<Booking[]> {
  if (!isSupabaseConfigured) return ensureDemoSeed();

  const supabase = getSupabase();
  if (!supabase) return ensureDemoSeed();

  const { data, error } = await supabase
    .from(BOOKINGS_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[FlexiBook] Failed to fetch bookings:", error.message);
    throw new Error("Could not load bookings. Please try again.");
  }
  return (data ?? []).map((row) => normalize(row as Record<string, unknown>));
}

/** Times ("HH:mm") already booked for a specific date. */
export async function fetchTakenSlots(dateKey: string): Promise<string[]> {
  if (!isSupabaseConfigured) {
    return loadDemoBookings()
      .filter(
        (b) =>
          b.booking_date === dateKey &&
          (b.status === "pending" || b.status === "confirmed"),
      )
      .map((b) => b.booking_time);
  }

  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(BOOKINGS_TABLE)
    .select("booking_time")
    .eq("booking_date", dateKey)
    .in("status", ["pending", "confirmed"]);

  if (error) {
    console.error("[FlexiBook] Failed to fetch slots:", error.message);
    return [];
  }
  return (data ?? [])
    .map((row) => String((row as { booking_time?: string }).booking_time ?? ""))
    .filter(Boolean);
}

/** Persist a new booking. Always saved as "pending". */
export async function createBooking(
  draft: BookingDraft,
): Promise<Booking> {
  const booking = draftToBooking(draft);

  if (!isSupabaseConfigured) return saveDemoBooking(booking);

  const supabase = getSupabase();
  if (!supabase) return saveDemoBooking(booking);

  const { data, error } = await supabase
    .from(BOOKINGS_TABLE)
    .insert({
      service_id: booking.service_id,
      service_name: booking.service_name,
      customer_name: booking.customer_name,
      customer_email: booking.customer_email,
      customer_phone: booking.customer_phone,
      booking_date: booking.booking_date,
      booking_time: booking.booking_time,
      notes: booking.notes,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("[FlexiBook] Failed to create booking:", error.message);
    throw new Error("Booking failed. Please try again in a moment.");
  }
  return normalize(data as Record<string, unknown>);
}

/** Move a booking to a new status. */
export async function setBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<void> {
  if (!isSupabaseConfigured) {
    updateDemoBookingStatus(id, status);
    return;
  }

  const supabase = getSupabase();
  if (!supabase) {
    updateDemoBookingStatus(id, status);
    return;
  }

  const { error } = await supabase
    .from(BOOKINGS_TABLE)
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("[FlexiBook] Failed to update status:", error.message);
    throw new Error("Update failed. Please try again.");
  }
}
