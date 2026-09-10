"use client";

import type { Booking, BookingStatus } from "./types";

/* ────────────────────────────────────────────────────────────────────
   Demo-mode fallback store. Used only when Supabase credentials are
   not configured, so the whole booking flow stays fully interactive.
   ──────────────────────────────────────────────────────────────────── */

const STORAGE_KEY = "flexibook.demo.bookings.v1";

const dayOffset = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const seed: Booking[] = [
  {
    id: "demo-seed-1",
    service_id: "ui-ux-design",
    service_name: "UI/UX Design Sprint",
    customer_name: "Amelia Hart",
    customer_email: "amelia.hart@example.com",
    customer_phone: "+1 (415) 555-0132",
    booking_date: dayOffset(1),
    booking_time: "10:00",
    notes: "Focus on the onboarding flow redesign.",
    status: "confirmed",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-seed-2",
    service_id: "strategy-consultation",
    service_name: "Strategy Consultation",
    customer_name: "Noah Bennett",
    customer_email: "noah.bennett@example.com",
    customer_phone: "+1 (628) 555-0198",
    booking_date: dayOffset(2),
    booking_time: "13:30",
    notes: "",
    status: "pending",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-seed-3",
    service_id: "seo-audit",
    service_name: "SEO & Analytics Audit",
    customer_name: "Lena Moreau",
    customer_email: "lena.moreau@example.com",
    customer_phone: "+1 (302) 555-0117",
    booking_date: dayOffset(-1),
    booking_time: "15:00",
    notes: "E-commerce store, 40+ SKUs.",
    status: "cancelled",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-seed-4",
    service_id: "web-development",
    service_name: "Web Development Session",
    customer_name: "Diego Ramos",
    customer_email: "diego.ramos@example.com",
    customer_phone: "+1 (212) 555-0144",
    booking_date: dayOffset(0),
    booking_time: "11:00",
    notes: "Checkout page performance work.",
    status: "confirmed",
    created_at: new Date().toISOString(),
  },
];

function safeParse(raw: string | null): Booking[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Booking[]) : [];
  } catch {
    return [];
  }
}

export function loadDemoBookings(): Booking[] {
  if (typeof window === "undefined") return seed;
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

/** Ensures the demo store has data on first run. */
export function ensureDemoSeed(): Booking[] {
  const existing = loadDemoBookings();
  if (typeof window !== "undefined" && existing.length === 0) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
  return existing;
}

export function saveDemoBooking(booking: Booking): Booking {
  const all = ensureDemoSeed();
  const next = [booking, ...all];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return booking;
}

export function updateDemoBookingStatus(
  id: string,
  status: BookingStatus,
): Booking | null {
  const all = ensureDemoSeed();
  let updated: Booking | null = null;
  const next = all.map((b) => {
    if (b.id === id) {
      updated = { ...b, status };
      return updated;
    }
    return b;
  });
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return updated;
}
