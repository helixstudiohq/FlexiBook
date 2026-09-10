/* ────────────────────────────────────────────────────────────────────
   Slot generation & helpers for the FlexiBook booking flow.
   ──────────────────────────────────────────────────────────────────── */

export interface DayOption {
  /** yyyy-mm-dd */
  value: string;
  weekday: string; // Mon
  dayNumber: string; // 07
  month: string; // Sep
}

/** Next `count` days starting today. */
export function getNextDays(count = 14): DayOption[] {
  const out: DayOption[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    out.push({
      value: toDateKey(d),
      weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
      dayNumber: String(d.getDate()).padStart(2, "0"),
      month: d.toLocaleDateString("en-US", { month: "short" }),
    });
  }
  return out;
}

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Pretty label, e.g. "Mon, Sep 7". */
export function formatDayLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** Business hours 09:00–17:00 in 30-minute steps. */
export const BUSINESS_HOURS: string[] = (() => {
  const slots: string[] = [];
  for (let h = 9; h < 17; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
})();

/** 09:00 → "9:00 AM" */
export function formatTimeLabel(time: string): string {
  const [h, min] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(min).padStart(2, "0")} ${suffix}`;
}

export type SlotStatus = "available" | "booked" | "past";

export interface Slot {
  time: string;
  status: SlotStatus;
}

/**
 * Build the slot grid for a given day.
 * `taken` is a list of "HH:mm" times already booked.
 */
export function buildSlots(dateKey: string, taken: string[]): Slot[] {
  const [y, m, d] = dateKey.split("-").map(Number);
  const selected = new Date(y, m - 1, d);
  const now = new Date();
  const isToday = toDateKey(now) === dateKey;
  const bookedSet = new Set(taken);

  return BUSINESS_HOURS.map((time) => {
    if (bookedSet.has(time)) return { time, status: "booked" as const };
    if (isToday) {
      const [h, min] = time.split(":").map(Number);
      const slotDate = new Date(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate(),
        h,
        min,
      );
      if (slotDate.getTime() <= now.getTime() + 30 * 60 * 1000) {
        return { time, status: "past" as const };
      }
    }
    return { time, status: "available" as const };
  });
}
