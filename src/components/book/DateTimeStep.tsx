"use client";

import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MoonStar,
  Sun,
  Sunrise,
} from "lucide-react";
import {
  buildSlots,
  formatDayLabel,
  formatTimeLabel,
  type DayOption,
} from "@/lib/slots";
import { useRef } from "react";

/* ────────────────────────────────────────────────────────────────────
   Step 2 — Select Date & Time Slot. Day rail + slot grid with
   available / booked / past status indicators.
   ──────────────────────────────────────────────────────────────────── */

function periodOf(time: string): "morning" | "afternoon" | "evening" {
  const h = Number(time.split(":")[0]);
  if (h < 12) return "morning";
  if (h < 15) return "afternoon";
  return "evening";
}

const periodMeta = {
  morning: { label: "Morning", icon: Sunrise },
  afternoon: { label: "Afternoon", icon: Sun },
  evening: { label: "Evening", icon: MoonStar },
} as const;

export function DateTimeStep({
  days,
  selectedDate,
  onSelectDate,
  slots,
  loading,
  selectedTime,
  onSelectTime,
}: {
  days: DayOption[];
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
  slots: ReturnType<typeof buildSlots>;
  loading: boolean;
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
}) {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollRail = (dir: 1 | -1) => {
    railRef.current?.scrollBy({ left: dir * 240, behavior: "smooth" });
  };

  const periods = ["morning", "afternoon", "evening"] as const;

  return (
    <div className="space-y-8">
      {/* Day rail */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Select a date</h3>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => scrollRail(-1)}
              aria-label="Scroll dates left"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-indigo-400/40 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollRail(1)}
              aria-label="Scroll dates right"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-indigo-400/40 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={railRef}
          className="flex gap-2.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {days.map((day, i) => {
            const selected = day.value === selectedDate;
            return (
              <motion.button
                key={day.value}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.03 }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectDate(day.value)}
                aria-pressed={selected}
                className={`flex w-16 shrink-0 flex-col items-center rounded-2xl border py-3 transition-all duration-300 ${
                  selected
                    ? "border-indigo-400/70 bg-gradient-to-b from-indigo-500/25 to-violet-500/10 shadow-glow-sm"
                    : "border-white/10 bg-white/[0.03] hover:border-indigo-400/40"
                }`}
              >
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    selected ? "text-indigo-200" : "text-slate-500"
                  }`}
                >
                  {day.weekday}
                </span>
                <span
                  className={`mt-1 text-lg font-bold ${
                    selected ? "text-white" : "text-slate-300"
                  }`}
                >
                  {day.dayNumber}
                </span>
                <span
                  className={`text-[10px] ${
                    selected ? "text-indigo-300" : "text-slate-600"
                  }`}
                >
                  {day.month}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Slot grid */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
          <Clock className="h-4 w-4 text-indigo-300" />
          Available times ·{" "}
          <span className="font-normal text-slate-400">
            {formatDayLabel(selectedDate)}
          </span>
        </h3>

        {loading ? (
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="h-11 animate-pulse rounded-xl border border-white/5 bg-white/[0.04]"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {periods.map((period) => {
              const group = slots.filter((s) => periodOf(s.time) === period);
              if (group.length === 0) return null;
              const meta = periodMeta[period];
              return (
                <div key={period}>
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <meta.icon className="h-3.5 w-3.5 text-slate-500" />
                    {meta.label}
                  </div>
                  <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
                    {group.map((slot, i) => {
                      const isSelected = slot.time === selectedTime;
                      const isAvailable = slot.status === "available";

                      if (!isAvailable) {
                        return (
                          <span
                            key={slot.time}
                            title={
                              slot.status === "booked"
                                ? "Already booked"
                                : "Past time"
                            }
                            className="flex h-11 cursor-not-allowed items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-xs font-medium text-slate-600 line-through"
                          >
                            {formatTimeLabel(slot.time)}
                          </span>
                        );
                      }

                      return (
                        <motion.button
                          key={slot.time}
                          type="button"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: 0.25,
                            delay: i * 0.02,
                          }}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onSelectTime(slot.time)}
                          aria-pressed={isSelected}
                          className={`flex h-11 items-center justify-center rounded-xl border text-xs font-semibold transition-all duration-200 ${
                            isSelected
                              ? "border-indigo-400 bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-glow-sm"
                              : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-indigo-400/50 hover:bg-indigo-500/10 hover:text-white"
                          }`}
                        >
                          {formatTimeLabel(slot.time)}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="mt-5 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
            Selected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
            Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            Booked / Past
          </span>
        </div>
      </div>
    </div>
  );
}
