"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  CalendarPlus,
  Loader2,
  SearchX,
} from "lucide-react";
import { StepIndicator, StepLoader } from "./StepIndicator";
import { ServiceStep } from "./ServiceStep";
import { DateTimeStep } from "./DateTimeStep";
import {
  DetailsStep,
  validateDetails,
  type DetailsForm,
  type DetailsErrors,
} from "./DetailsStep";
import { SuccessScreen } from "./SuccessScreen";
import { services, getServiceById } from "@/lib/services";
import { getNextDays, buildSlots } from "@/lib/slots";
import { fetchTakenSlots, createBooking } from "@/lib/bookings";
import type { Booking, Service } from "@/lib/types";

/* ────────────────────────────────────────────────────────────────────
   Multi-step booking wizard:
     Step 1 · Choose Service
     Step 2 · Select Date & Time Slot
     Step 3 · Enter Details & Confirm  → persists to Supabase `bookings`
   ──────────────────────────────────────────────────────────────────── */

type SubmitState = "idle" | "submitting" | "error";

export function BookingWizard() {
  const searchParams = useSearchParams();
  const days = useMemo(() => getNextDays(14), []);

  /* Wizard state */
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [furthest, setFurthest] = useState(1);
  const [direction, setDirection] = useState<1 | -1>(1);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(days[0]?.value ?? "");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [form, setForm] = useState<DetailsForm>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    notes: "",
  });
  const [errors, setErrors] = useState<DetailsErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [confirmed, setConfirmed] = useState<Booking | null>(null);

  /* Preselect a service coming from the landing page (?service=…). */
  useEffect(() => {
    const preselect = searchParams.get("service");
    if (!preselect) return;
    const found = getServiceById(preselect);
    if (found) {
      setSelectedService(found);
      setFurthest(2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Real-time validation — clear/set errors while typing. */
  useEffect(() => {
    if (Object.keys(errors).length === 0) return;
    setErrors(validateDetails(form));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  /* Load booked slots whenever the selected date changes (step 2+). */
  useEffect(() => {
    if (!selectedDate) return;
    let cancelled = false;
    setSlotsLoading(true);
    fetchTakenSlots(selectedDate)
      .then((times) => {
        if (!cancelled) setTakenSlots(times);
      })
      .catch(() => {
        if (!cancelled) setTakenSlots([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  /* Drop a selected slot if it becomes unavailable after refresh. */
  useEffect(() => {
    if (
      selectedTime &&
      slotsLoaded(takenSlots, selectedDate, selectedTime)
    ) {
      setSelectedTime(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [takenSlots]);

  const slots = useMemo(
    () => buildSlots(selectedDate, takenSlots),
    [selectedDate, takenSlots],
  );

  const goTo = (next: 1 | 2 | 3) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    setFurthest((f) => Math.max(f, next));
  };

  const goNext = () => {
    if (step === 1) {
      if (selectedService) goTo(2);
      return;
    }
    if (step === 2) {
      if (selectedTime) goTo(3);
      return;
    }
  };

  const goBack = () => {
    if (step > 1) goTo((step - 1) as 1 | 2);
  };

  const handleSubmit = async () => {
    const nextErrors = validateDetails(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (!selectedService || !selectedDate || !selectedTime) return;

    setSubmitState("submitting");
    try {
      const booking = await createBooking({
        serviceId: selectedService.id,
        bookingDate: selectedDate,
        bookingTime: selectedTime,
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone,
        notes: form.notes,
      });
      setConfirmed(booking);
    } catch {
      setSubmitState("error");
    }
  };

  const resetWizard = () => {
    setConfirmed(null);
    setStep(1);
    setFurthest(1);
    setSelectedService(null);
    setSelectedTime(null);
    setForm({ customerName: "", customerEmail: "", customerPhone: "", notes: "" });
    setErrors({});
    setSubmitState("idle");
  };

  /* Confirmed view replaces the whole wizard. */
  if (confirmed) {
    return (
      <div className="py-4">
        <SuccessScreen booking={confirmed} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <StepIndicator current={step} furthest={furthest} />

      <div className="glass-card mt-10 p-6 sm:p-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -48 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 1 && (
              <ServiceStep
                selectedId={selectedService?.id ?? null}
                onSelect={(service) => {
                  setSelectedService(service);
                  window.setTimeout(() => goTo(2), 160);
                }}
              />
            )}

            {step === 2 && selectedService && (
              <DateTimeStep
                days={days}
                selectedDate={selectedDate}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                }}
                slots={slots}
                loading={slotsLoading}
                selectedTime={selectedTime}
                onSelectTime={setSelectedTime}
              />
            )}

            {step === 3 && selectedService && selectedDate && selectedTime && (
              <DetailsStep
                form={form}
                errors={errors}
                onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
                service={selectedService}
                bookingDate={selectedDate}
                bookingTime={selectedTime}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Error banner */}
        {submitState === "error" && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            <SearchX className="h-4 w-4" />
            Something went wrong while saving your booking. Please try again.
          </div>
        )}

        {/* Footer navigation */}
        <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={goBack}
              className="btn-secondary !px-5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <span />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={
                (step === 1 && !selectedService) ||
                (step === 2 && !selectedTime)
              }
              className="btn-primary"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitState === "submitting"}
              className="btn-primary min-w-[210px]"
            >
              {submitState === "submitting" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Confirming…
                </>
              ) : (
                <>
                  <CalendarCheck2 className="h-4 w-4" />
                  Confirm Booking · $
                  {selectedService?.price ?? 0}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Step meta hint */}
      <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
        <CalendarPlus className="h-3.5 w-3.5" />
        Step {step} of 3 ·{" "}
        {step === 1
          ? "Pick the session that fits your goal"
          : step === 2
            ? "All times shown in your local timezone"
            : "Review the summary, then confirm"}
      </p>
    </div>
  );
}

/* Guard: was the chosen slot taken while the user was on another step? */
function slotsLoaded(
  taken: string[],
  dateKey: string,
  time: string,
): boolean {
  void dateKey;
  return taken.includes(time);
}
