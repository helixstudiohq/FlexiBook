"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

/** Icon registry — maps catalogue names to imported Lucide components. */
import {
  Compass,
  Palette,
  Code2,
  Sparkles,
  TrendingUp,
  CloudCog,
  HeartPulse,
  Clapperboard,
  LineChart,
  type LucideProps,
} from "lucide-react";

export const iconRegistry: Record<string, LucideIcon> = {
  Compass,
  Palette,
  Code2,
  Sparkles,
  TrendingUp,
  CloudCog,
  HeartPulse,
  Clapperboard,
  LineChart,
};

export function ServiceIcon({
  name,
  ...props
}: { name: string } & LucideProps) {
  const Icon = iconRegistry[name] ?? Sparkles;
  return <Icon {...props} />;
}

/** Reusable fade-up entrance wrapper. */
export function FadeIn({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
