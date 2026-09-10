"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  LayoutDashboard,
  Plus,
  Tag,
} from "lucide-react";
import { useState } from "react";
import type { Booking } from "@/lib/types";
import { formatDayLabel, formatTimeLabel } from "@/lib/slots";

/* ────────────────────────────────────────────────────────────────────
   Success screen — shown after a booking is persisted successfully.
   ──────────────────────────────────────────────────────────────────── */

export function SuccessScreen({ booking }: { booking: Booking }) {
  const [copied, setCopied] = useState(false);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(booking.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-lg text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-glow-emerald"
      >
        <CheckCircle2 className="h-10 w-10 text-white" strokeWidth={2.2} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Booking Confirmed!
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Thanks, {booking.customer_name.split(" ")[0]}! Your request is in —
          it now appears as{" "}
          <span className="font-semibold text-amber-300">Pending</span> until
          approved from the dashboard.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42, duration: 0.5 }}
        className="glass-card mt-8 p-6 text-left"
      >
        <div className="space-y-3.5 text-sm">
          <div className="flex items-start gap-3">
            <Tag className="mt-0.5 h-4 w-4 text-indigo-300" />
            <div>
              <div className="font-semibold text-white">
                {booking.service_name}
              </div>
              <div className="text-xs text-slate-500">
                Booking reference
              </div>
            </div>
            <button
              type="button"
              onClick={copyId}
              className="ml-auto flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 font-mono text-[11px] text-slate-300 transition-colors hover:border-indigo-400/40 hover:text-white"
              aria-label="Copy booking reference"
            >
              {booking.id.slice(0, 8)}…
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <CalendarDays className="h-4 w-4 text-indigo-300" />
            <span className="text-slate-300">
              {formatDayLabel(booking.booking_date)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-indigo-300" />
            <span className="text-slate-300">
              {formatTimeLabel(booking.booking_time)}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.54, duration: 0.5 }}
        className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
      >
        <Link href="/dashboard" className="btn-primary">
          <LayoutDashboard className="h-4 w-4" />
          View in Dashboard
        </Link>
        <Link href="/book" className="btn-secondary">
          <Plus className="h-4 w-4" />
          Make Another Booking
        </Link>
      </motion.div>
    </motion.div>
  );
}
