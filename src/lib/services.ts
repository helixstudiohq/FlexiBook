import type { Service } from "./types";

/** FlexiBook service catalogue. */
export const services: Service[] = [
  {
    id: "strategy-consultation",
    name: "Strategy Consultation",
    description:
      "A focused one-on-one session to map out your product roadmap, priorities, and growth levers.",
    price: 89,
    duration: 45,
    category: "Consultation",
    icon: "Compass",
    popular: true,
  },
  {
    id: "ui-ux-design",
    name: "UI/UX Design Sprint",
    description:
      "Rapid, high-fidelity interface design for a key flow — wireframe to polished prototype in one sitting.",
    price: 149,
    duration: 90,
    category: "Design",
    icon: "Palette",
    popular: true,
  },
  {
    id: "web-development",
    name: "Web Development Session",
    description:
      "Pair with a senior engineer to build, refactor, or ship a feature with production-ready code.",
    price: 129,
    duration: 60,
    category: "Development",
    icon: "Code2",
  },
  {
    id: "brand-identity",
    name: "Brand Identity Workshop",
    description:
      "Logo direction, color system, and typography — leave with a complete mini brand kit.",
    price: 199,
    duration: 120,
    category: "Branding",
    icon: "Sparkles",
  },
  {
    id: "seo-audit",
    name: "SEO & Analytics Audit",
    description:
      "A full technical and content audit with a prioritized action list to grow organic traffic.",
    price: 99,
    duration: 60,
    category: "Marketing",
    icon: "TrendingUp",
  },
  {
    id: "cloud-architecture",
    name: "Cloud Architecture Review",
    description:
      "Expert review of your infrastructure for scalability, cost efficiency, and reliability.",
    price: 179,
    duration: 90,
    category: "Development",
    icon: "CloudCog",
  },
  {
    id: "wellness-coaching",
    name: "Wellness Coaching",
    description:
      "Personalized guidance on energy, focus, and sustainable habits from a certified coach.",
    price: 59,
    duration: 45,
    category: "Wellness",
    icon: "HeartPulse",
  },
  {
    id: "video-production",
    name: "Video Production Planning",
    description:
      "Storyboarding, shot lists, and a production plan for your next launch or brand film.",
    price: 159,
    duration: 90,
    category: "Creative",
    icon: "Clapperboard",
    popular: true,
  },
  {
    id: "data-insights",
    name: "Data Insights Consult",
    description:
      "Turn raw metrics into a clear dashboard and the three numbers you should watch weekly.",
    price: 119,
    duration: 60,
    category: "Analytics",
    icon: "LineChart",
  },
];

export function getServiceById(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}
