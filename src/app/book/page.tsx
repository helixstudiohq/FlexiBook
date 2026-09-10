import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingWizard } from "@/components/book/BookingWizard";

export const metadata: Metadata = {
  title: "Book a Session — FlexiBook",
  description:
    "Choose a service, pick the perfect time slot, and confirm your booking in three effortless steps.",
};

export default function BookPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Book Your <span className="text-gradient">Session</span>
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
          Three quick steps: choose a service, select a date and time, then
          confirm your details.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="mx-auto h-10 w-72 animate-pulse rounded-full bg-white/5" />
            <div className="glass-card h-[420px] animate-pulse" />
          </div>
        }
      >
        <BookingWizard />
      </Suspense>
    </div>
  );
}
