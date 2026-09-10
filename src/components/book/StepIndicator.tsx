"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

/* ────────────────────────────────────────────────────────────────────
   Wizard step indicator with animated progress line.
   ──────────────────────────────────────────────────────────────────── */

const stepLabels = ["Choose Service", "Date & Time", "Details & Confirm"];

export function StepIndicator({
  current,
  furthest,
}: {
  current: number; // 1-based
  furthest: number; // 1-based
}) {
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="flex items-start justify-between">
        {stepLabels.map((label, i) => {
          const step = i + 1;
          const isDone = step < current;
          const isCurrent = step === current;
          const reachable = step <= furthest;

          return (
            <div key={label} className="relative flex flex-col items-center">
              <motion.div
                animate={{
                  scale: isCurrent ? 1.08 : 1,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors duration-300 ${
                  isDone
                    ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-glow-sm"
                    : isCurrent
                      ? "border-2 border-indigo-400 bg-indigo-500/15 text-indigo-200"
                      : reachable
                        ? "border border-white/15 bg-white/5 text-slate-300"
                        : "border border-white/10 bg-white/[0.03] text-slate-600"
                }`}
              >
                {isDone ? <Check className="h-4.5 w-4.5" /> : step}
              </motion.div>
              <span
                className={`mt-2 text-xs font-medium transition-colors duration-300 ${
                  isCurrent
                    ? "text-indigo-200"
                    : isDone
                      ? "text-slate-300"
                      : "text-slate-600"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Connecting progress line */}
      <div className="relative mx-5 mt-[-30px] h-0.5 bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
          initial={false}
          animate={{ width: `${((current - 1) / (stepLabels.length - 1)) * 100}%` }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

export function StepLoader() {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-400">
      <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
      Loading available slots…
    </div>
  );
}
