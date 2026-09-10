"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, LayoutGrid, Sparkles } from "lucide-react";
import { ServiceIcon } from "@/components/shared/icons";
import { services } from "@/lib/services";

/* ────────────────────────────────────────────────────────────────────
   Hero — headline with gradient text, sub-headline, live interactive
   demo badge, and dual CTA buttons.
   ──────────────────────────────────────────────────────────────────── */

const rotatingHighlights = [
  "UI/UX Design Sprint",
  "Strategy Consultation",
  "SEO & Analytics Audit",
  "Cloud Architecture Review",
];

export function Hero() {
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setHighlightIndex((i) => (i + 1) % rotatingHighlights.length),
      2600,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* Ambient glow orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-32 right-[8%] h-64 w-64 rounded-full bg-cyan-500/10 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-48 left-[6%] h-56 w-56 rounded-full bg-violet-600/10 blur-[100px]"
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pt-28 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Live interactive demo badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Live interactive demo — no account needed
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-balance text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl"
          >
            Smart Scheduling Made Effortless for{" "}
            <span className="text-gradient animate-gradient-x">FlexiBook</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-slate-400 sm:text-lg"
          >
            Discover services, grab the perfect time slot, and confirm your
            booking in three effortless steps — then track every appointment
            from one beautiful dashboard.
          </motion.p>

          {/* Dual CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.44, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link href="/book" className="btn-primary w-full sm:w-auto">
              Book Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/#services"
              className="btn-secondary w-full sm:w-auto"
            >
              <LayoutGrid className="h-4 w-4 text-indigo-300" />
              View Services
            </Link>
          </motion.div>

          {/* Rotating service highlight chip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-12 inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-4 py-2 text-xs text-slate-500"
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-300" />
            Trending right now:
            <AnimatePresence mode="wait">
              <motion.span
                key={rotatingHighlights[highlightIndex]}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="font-semibold text-slate-300"
              >
                {rotatingHighlights[0]}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
