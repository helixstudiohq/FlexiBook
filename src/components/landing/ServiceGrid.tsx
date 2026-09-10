"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CalendarCheck2 } from "lucide-react";
import { ServiceIcon } from "@/components/shared/icons";
import { services } from "@/lib/services";
import type { Service } from "@/lib/types";

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function ServiceGrid() {
  return (
    <section id="services" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mb-14 max-w-2xl text-center"
      >
        <span className="eyebrow">
          <Sparkles className="h-3.5 w-3.5" />
          Services
        </span>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Sessions designed around{" "}
          <span className="text-gradient">your schedule</span>
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Browse the FlexiBook catalogue and lock in your slot in seconds —
          every booking lands straight in your dashboard.
        </p>
      </motion.div>

      <motion.div
        variants={gridVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </motion.div>
    </section>
  );
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <motion.article
      variants={cardVariants}
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative"
    >
      {/* Glowing border on hover */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-indigo-500/0 via-violet-500/0 to-cyan-400/0 opacity-0 blur-[6px] transition-opacity duration-500 group-hover:from-indigo-500/50 group-hover:via-violet-500/40 group-hover:to-cyan-400/40 group-hover:opacity-100" />
      <div className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl transition-colors duration-300 group-hover:border-indigo-400/40">
        {service.popular && (
          <span className="absolute -top-2.5 right-5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-glow-sm">
            Popular
          </span>
        )}

        <div className="mb-4 flex items-start justify-between">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300 transition-all duration-300 group-hover:scale-110 group-hover:text-indigo-200">
            <ServiceIcon name={service.icon} className="h-6 w-6" />
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-300">
            {service.category}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-white">{service.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
          {service.description}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-white">
              ${service.price}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-400">
              <CalendarCheck2 className="h-3.5 w-3.5 text-indigo-300" />
              {service.duration} min
            </span>
          </div>
          <Link
            href={`/book?service=${service.id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-4 py-2 text-xs font-semibold text-indigo-300 ring-1 ring-inset ring-indigo-400/30 transition-all duration-300 hover:bg-indigo-500 hover:text-white hover:shadow-glow-sm active:scale-95"
          >
            Select &amp; Book
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
