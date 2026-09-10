"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoreHorizontal,
  Search,
  CalendarDays,
  Clock,
  Inbox,
  CheckCircle2,
  Clock3,
  XCircle,
  RotateCcw,
} from "lucide-react";
import type { Booking, BookingStatus } from "@/lib/types";
import { statusStyles, BOOKING_STATUSES } from "@/lib/status";
import { formatDayLabel, formatTimeLabel } from "@/lib/slots";

/* ────────────────────────────────────────────────────────────────────
   Interactive appointment table — search, status filter pills,
   animated status badges (Pending yellow / Confirmed emerald /
   Cancelled rose) and quick action menus per row.
   ──────────────────────────────────────────────────────────────────── */

type StatusFilter = "all" | BookingStatus;

export function BookingsTable({
  bookings,
  onStatusChange,
}: {
  bookings: Booking[];
  onStatusChange: (id: string, status: BookingStatus) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      const matchesStatus = filter === "all" || b.status === filter;
      const matchesQuery =
        q.length === 0 ||
        b.customer_name.toLowerCase().includes(q) ||
        b.customer_email.toLowerCase().includes(q) ||
        b.service_name.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [bookings, query, filter]);

  const counts = useMemo(
    () => ({
      all: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    }),
    [bookings],
  );

  return (
    <div className="glass-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 border-b border-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, or service…"
            aria-label="Search bookings"
            className="input-field !py-2.5 pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", ...BOOKING_STATUSES] as StatusFilter[]).map((status) => {
            const active = filter === status;
            const label =
              status === "all"
                ? "All"
                : statusStyles[status].label;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  active
                    ? "bg-indigo-500/20 text-indigo-200 ring-1 ring-indigo-400/40"
                    : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200"
                }`}
              >
                {label}
                <span className="ml-1.5 text-[10px] font-bold text-slate-500">
                  {counts[status]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-[11px] uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3.5 font-semibold">Customer</th>
              <th className="px-5 py-3.5 font-semibold">Service</th>
              <th className="px-5 py-3.5 font-semibold">Date &amp; Time</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {filtered.map((booking, i) => (
                <motion.tr
                  key={booking.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.25) }}
                  className="group border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.03]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/70 to-violet-500/70 text-[11px] font-bold text-white">
                        {initials(booking.customer_name)}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-white">
                          {booking.customer_name}
                        </div>
                        <div className="truncate text-xs text-slate-500">
                          {booking.customer_email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-200">
                      {booking.service_name}
                    </div>
                    {booking.notes ? (
                      <div className="mt-0.5 max-w-[220px] truncate text-xs text-slate-500">
                        {booking.notes}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <CalendarDays className="h-3.5 w-3.5 text-indigo-300" />
                      {formatDayLabel(booking.booking_date)}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      {formatTimeLabel(booking.booking_time)}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <RowActions
                      booking={booking}
                      open={openMenuId === booking.id}
                      onToggle={() =>
                        setOpenMenuId((id) => (id === booking.id ? null : booking.id))
                      }
                      onClose={() => setOpenMenuId(null)}
                      onStatusChange={onStatusChange}
                    />
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState query={query} />}
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 p-4 md:hidden">
        <AnimatePresence initial={false}>
          {filtered.map((booking, i) => (
            <motion.div
              key={booking.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.2) }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/70 to-violet-500/70 text-[11px] font-bold text-white">
                    {initials(booking.customer_name)}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">
                      {booking.customer_name}
                    </div>
                    <div className="truncate text-xs text-slate-500">
                      {booking.customer_email}
                    </div>
                  </div>
                </div>
                <StatusBadge status={booking.status} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                <span className="font-medium text-slate-300">
                  {booking.service_name}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3 w-3 text-indigo-300" />
                  {formatDayLabel(booking.booking_date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {formatTimeLabel(booking.booking_time)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-[11px] text-slate-500">
                  {booking.notes ? `"${truncate(booking.notes, 46)}"` : "No notes"}
                </span>
                <RowActions
                  booking={booking}
                  open={openMenuId === booking.id}
                  onToggle={() =>
                    setOpenMenuId((id) => (id === booking.id ? null : booking.id))
                  }
                  onClose={() => setOpenMenuId(null)}
                  onStatusChange={onStatusChange}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && <EmptyState query={query} />}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const style = statusStyles[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${style.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

function RowActions({
  booking,
  open,
  onToggle,
  onClose,
  onStatusChange,
}: {
  booking: Booking;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onStatusChange: (id: string, status: BookingStatus) => void;
}) {
  const act = (status: BookingStatus) => {
    onStatusChange(booking.id, status);
    onClose();
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={onToggle}
        aria-label={`Actions for booking ${booking.id}`}
        aria-expanded={open}
        className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-200 ${
          open
            ? "border-indigo-400/50 bg-indigo-500/15 text-indigo-200"
            : "border-white/10 bg-white/5 text-slate-400 hover:border-indigo-400/40 hover:text-white"
        }`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={onClose} aria-hidden />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 z-40 mt-1.5 w-44 overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 py-1 shadow-card backdrop-blur-xl"
            role="menu"
          >
            {booking.status !== "confirmed" && (
              <MenuItem
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                label="Confirm booking"
                onClick={() => act("confirmed")}
                className="text-emerald-300 hover:bg-emerald-500/10"
              />
            )}
            {booking.status !== "pending" && (
              <MenuItem
                icon={<Clock3 className="h-3.5 w-3.5" />}
                label="Mark as pending"
                onClick={() => act("pending")}
                className="text-amber-300 hover:bg-amber-500/10"
              />
            )}
            {booking.status !== "cancelled" && (
              <MenuItem
                icon={<XCircle className="h-3.5 w-3.5" />}
                label="Cancel booking"
                onClick={() => act("cancelled")}
                className="text-rose-300 hover:bg-rose-500/10"
              />
            )}
            <div className="my-1 border-t border-white/5" />
            <MenuItem
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              label="Refresh list"
              onClick={onClose}
              className="text-slate-400 hover:bg-white/5"
            />
          </motion.div>
        </>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="menuitem"
      className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-semibold transition-colors ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
        <Inbox className="h-6 w-6 text-slate-500" />
      </span>
      <h3 className="text-sm font-semibold text-white">No bookings found</h3>
      <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-slate-500">
        {query
          ? `Nothing matches “${query}”. Try a different search or clear the filters.`
          : "New bookings will appear here the moment customers confirm them."}
      </p>
    </div>
  );
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
