import { Hero } from "@/components/landing/Hero";
import { ServiceGrid } from "@/components/landing/ServiceGrid";
import { Features, Testimonials } from "@/components/landing/Features";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServiceGrid />
      <Features />
      <Testimonials />
    </>
  );
}
