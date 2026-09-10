"use client";

import { motion } from "framer-motion";
import {
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { Booking } from "@/lib/types";

/* ────────────────────────────────────────────────────────────────────
   Dashboard status widgets with animated counters and sparkline-ish
   micro stats.
   ──────────────────────────────────────────────────────────────────── */

export function StatCards({ bookings }: { bookings: Booking[] }) {
  const total = bookings.length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const pending = bookings.filter((b) => b.status === "pending").length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;

  const upcoming = bookings.filter((b) => {
    if (b.status === "cancelled") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [y, m, d] = b.booking_date.split("-").map(Number);
    return new Date(y, m - 1, d) >= today;
  }).length;

  const cards = [
    {
      label: "Total Bookings",
      value: total,
      icon: CalendarCheck2,
      gradient: "from-indigo-500 to-violet-500",
      shadow: "shadow-glow-sm",
      hint: `${upcoming} upcoming · ${total - upcoming} past`,
      trend: 0,
    },
    {
      label: "Confirmed",
      value: confirmed,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-500",
      shadow: "shadow-glow-emerald",
      hint:
        total > 0
          ? `${Math.round((confirmed / total) * 100)}% of all bookings`
          : "No bookings yet",
      trend: total > 0 ? Math.round((confirmed / total) * 100) : 0,
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock3,
      gradient: "from-amber-400 to-orange-500",
      shadow: "shadow-glow-sm",
      hint:
        pending > 0
          ? "Needs your review"
          : "Nothing waiting on you",
      trend: total > 0 ? Math.round((pending / total) * 100) : 0,
    },
    {
      label: "Cancelled",
      value: cancelled,
      icon: XCircle,
      gradient: "from-rose-500 to-red-500",
      shadow: "",
      hint:
        total > 0
          ? `${Math.round((cancelled / total) * 100)}% of all bookings`
          : "No cancellations",
      trend: total > 0 ? -Math.round((cancelled / total) * 100) : 0,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4 }}
          className="glass-card relative overflow-hidden p-5"
        >
          <div
            aria-hidden
            className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${card.gradient} opacity-[0.12] blur-2xl`}
          />
          <div className="flex items-start justify-between">
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} text-white ${card.shadow}`}
            >
              <card.icon className="h-5 w-5" strokeWidth={2.2} />
            </span>
            {card.trend !== 0 ? (
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${
                  card.trend > 0
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "bg-rose-400/10 text-rose-300"
                }`}
              >
                {card.trend > 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(card.trend)}%
              </span>
            ) : (
              <span className="h-[22px] w-[52px]" />
            )}
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold tracking-tight text-white">
              {card.value}
            </div>
            <div className="mt-0.5 text-xs font-medium text-slate-400">
              {card.label}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">{card.hint}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
