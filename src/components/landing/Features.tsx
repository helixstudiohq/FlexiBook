"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap,
  ShieldCheck,
  Clock3,
  LayoutDashboard,
  Star,
  ArrowRight,
} from "lucide-react";
import { FadeIn } from "@/components/shared/icons";

/* ────────────────────────────────────────────────────────────────────
   Features & Testimonials — interactive icon cards + review wall.
   ──────────────────────────────────────────────────────────────────── */

const features = [
  {
    icon: Zap,
    title: "Lightning-Fast Booking",
    description:
      "Three steps, one minute. Pick a service, choose a slot, confirm — done.",
    accent: "from-indigo-500 to-violet-500",
    glow: "group-hover:shadow-glow",
  },
  {
    icon: Clock3,
    title: "Real-Time Availability",
    description:
      "Live slot status pulled straight from the database, so double-booking never happens.",
    accent: "from-violet-500 to-fuchsia-500",
    glow: "group-hover:shadow-glow",
  },
  {
    icon: ShieldCheck,
    title: "Reliable & Secure",
    description:
      "Backed by Supabase with instant persistence and safe, validated records.",
    accent: "from-emerald-500 to-teal-500",
    glow: "group-hover:shadow-glow-emerald",
  },
  {
    icon: LayoutDashboard,
    title: "Powerful Dashboard",
    description:
      "Track pending, confirmed, and cancelled appointments with one-click actions.",
    accent: "from-cyan-500 to-sky-500",
    glow: "group-hover:shadow-glow",
  },
];

const testimonials = [
  {
    quote:
      "FlexiBook replaced three tools for us. Clients book themselves and our dashboard stays spotless — it genuinely feels effortless.",
    name: "Sarah Kim",
    role: "Studio Manager, Northlight",
    initials: "SK",
    accent: "from-indigo-500 to-violet-500",
  },
  {
    quote:
      "The slot grid is the best I've used. Available, booked, and past slots are unmistakable, and confirmations take one click.",
    name: "Marcus Reed",
    role: "Founder, Reed & Co. Consulting",
    initials: "MR",
    accent: "from-violet-500 to-fuchsia-500",
  },
  {
    quote:
      "We went from missed bookings to a fully booked week within days. The experience is polished enough to sell for us.",
    name: "Priya Nair",
    role: "Owner, Bloom Wellness",
    initials: "PN",
    accent: "from-cyan-500 to-sky-500",
  },
];

export function Features() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <FadeIn className="mx-auto mb-14 max-w-2xl text-center">
        <span className="eyebrow">Why FlexiBook</span>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Everything you need to{" "}
          <span className="text-gradient">stay booked</span>
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-400">
          A scheduling experience engineered to convert visitors into confirmed
          appointments.
        </p>
      </FadeIn>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6 }}
            className={`group glass-card p-6 transition-shadow duration-500 ${feature.glow}`}
          >
            <span
              className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.accent} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
            >
              <feature.icon className="h-6 w-6" strokeWidth={2} />
            </span>
            <h3 className="text-base font-semibold text-white">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 pb-28 sm:px-6 lg:px-8">
      <FadeIn className="mx-auto mb-14 max-w-2xl text-center">
        <span className="eyebrow">Testimonials</span>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Loved by teams that <span className="text-gradient">book fast</span>
        </h2>
      </FadeIn>

      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.figure
            key={t.name}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4 }}
            className="glass-card flex flex-col p-6"
          >
            <div className="mb-4 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star
                  key={s}
                  className="h-4 w-4 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <blockquote className="flex-1 text-sm leading-relaxed text-slate-300">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3 border-t border-white/5 pt-4">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.accent} text-xs font-bold text-white`}
              >
                {t.initials}
              </span>
              <div>
                <div className="text-sm font-semibold text-white">{t.name}</div>
                <div className="text-xs text-slate-500">{t.role}</div>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>

      {/* Closing CTA band */}
      <FadeIn delay={0.15} className="mt-16">
        <div className="glass-card relative overflow-hidden p-10 text-center sm:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[520px] -translate-x-1/2 rounded-full bg-indigo-600/25 blur-[110px]"
          />
          <h2 className="relative text-2xl font-bold text-white sm:text-3xl">
            Ready to fill your calendar?
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-sm text-slate-400">
            Join the teams scheduling smarter with FlexiBook — your first
            booking takes less than a minute.
          </p>
          <div className="relative mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/book" className="btn-primary">
              Book Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              View Dashboard
            </Link>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
