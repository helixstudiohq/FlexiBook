"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarPlus, RefreshCw } from "lucide-react";
import { StatCards } from "./StatCards";
import { BookingsTable } from "./BookingsTable";
import { fetchBookings, setBookingStatus } from "@/lib/bookings";
import type { Booking, BookingStatus } from "@/lib/types";

/* ────────────────────────────────────────────────────────────────────
   Dashboard client shell — data fetching, skeleton loading state,
   stat widgets and the interactive appointment table.
   ──────────────────────────────────────────────────────────────────── */

export function DashboardClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    setError(null);
    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not load bookings.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleStatusChange = useCallback(
    async (id: string, status: BookingStatus) => {
      // Optimistic update
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b)),
      );
      try {
        await setBookingStatus(id, status);
      } catch {
        await load();
      }
    },
    [load],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Booking <span className="text-gradient">Overview</span>
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-400">
            Monitor every appointment, approve pending requests, and keep your
            calendar in perfect shape.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => void load(true)}
            disabled={refreshing}
            className="btn-secondary !px-4 !py-2.5 text-xs"
            aria-label="Refresh bookings"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <Link href="/book" className="btn-primary !px-5 !py-2.5 text-xs">
            <CalendarPlus className="h-3.5 w-3.5" />
            New Booking
          </Link>
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <DashboardSkeleton />
      ) : error ? (
        <div className="glass-card flex flex-col items-center gap-4 p-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-500/10">
            <RefreshCw className="h-6 w-6 text-rose-300" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-white">
              Something went wrong
            </h2>
            <p className="mt-1.5 text-sm text-slate-400">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="btn-primary !px-5 !py-2.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      ) : (
        <>
          <StatCards bookings={bookings} />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6"
          >
            <BookingsTable
              bookings={bookings}
              onStatusChange={handleStatusChange}
            />
          </motion.div>
        </>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="glass-card h-[136px] animate-pulse"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
      <div className="glass-card h-[420px] animate-pulse" />
    </div>
  );
}
