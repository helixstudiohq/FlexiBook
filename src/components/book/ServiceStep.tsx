"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { ServiceIcon } from "@/components/shared/icons";
import { services } from "@/lib/services";
import type { Service } from "@/lib/types";

/* ────────────────────────────────────────────────────────────────────
   Step 1 — Choose Service (selectable glass cards).
   ──────────────────────────────────────────────────────────────────── */

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function ServiceStep({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (service: Service) => void;
}) {
  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="show"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {services.map((service) => {
        const selected = service.id === selectedId;
        return (
          <motion.button
            key={service.id}
            type="button"
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(service)}
            aria-pressed={selected}
            className={`group relative flex flex-col rounded-2xl border p-5 text-left backdrop-blur-xl transition-all duration-300 ${
              selected
                ? "border-indigo-400/60 bg-indigo-500/10 shadow-glow-sm"
                : "border-white/10 bg-white/[0.03] hover:border-indigo-400/40 hover:bg-white/[0.06]"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 ${
                  selected
                    ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white"
                    : "border border-indigo-400/20 bg-indigo-500/10 text-indigo-300 group-hover:scale-105"
                }`}
              >
                <ServiceIcon name={service.icon} className="h-5.5 w-5.5" />
              </span>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-300 ${
                  selected
                    ? "border-indigo-400 bg-indigo-500 text-white"
                    : "border-white/20 bg-transparent"
                }`}
              >
                {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </span>
            </div>

            <h3 className="text-sm font-semibold text-white">{service.name}</h3>
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-400">
              {service.description}
            </p>

            <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-3">
              <span className="text-base font-bold text-white">
                ${service.price}
              </span>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                {service.duration} min
              </span>
              <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                {service.category}
              </span>
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
