"use client";

import { motion } from "framer-motion";
import { AlertCircle, CalendarDays, Clock, Tag } from "lucide-react";
import type { BookingDraft, Service } from "@/lib/types";
import { formatDayLabel, formatTimeLabel } from "@/lib/slots";

/* ────────────────────────────────────────────────────────────────────
   Step 3 — Enter Details & Confirm. Real-time field validation plus a
   live summary of the selection made in Steps 1–2.
   ──────────────────────────────────────────────────────────────────── */

export interface DetailsForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
}

export type DetailsErrors = Partial<Record<keyof DetailsForm, string>>;

export function validateDetails(form: DetailsForm): DetailsErrors {
  const errors: DetailsErrors = {};
  if (!form.customerName.trim()) {
    errors.customerName = "Full name is required.";
  } else if (form.customerName.trim().length < 2) {
    errors.customerName = "Name must be at least 2 characters.";
  }
  if (!form.customerEmail.trim()) {
    errors.customerEmail = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.customerEmail.trim())) {
    errors.customerEmail = "Enter a valid email address.";
  }
  if (!form.customerPhone.trim()) {
    errors.customerPhone = "Phone number is required.";
  } else if (!/^[+()\-.\s\d]{7,20}$/.test(form.customerPhone.trim())) {
    errors.customerPhone = "Enter a valid phone number.";
  }
  if (form.notes.length > 500) {
    errors.notes = "Notes must be under 500 characters.";
  }
  return errors;
}

export function DetailsStep({
  form,
  errors,
  onChange,
  service,
  bookingDate,
  bookingTime,
}: {
  form: DetailsForm;
  errors: DetailsErrors;
  onChange: (patch: Partial<DetailsForm>) => void;
  service: Service;
  bookingDate: string;
  bookingTime: string;
}) {
  const fields: {
    key: keyof DetailsForm;
    label: string;
    type: string;
    placeholder: string;
    required?: boolean;
    textarea?: boolean;
  }[] = [
    {
      key: "customerName",
      label: "Full Name",
      type: "text",
      placeholder: "Jane Cooper",
      required: true,
    },
    {
      key: "customerEmail",
      label: "Email Address",
      type: "email",
      placeholder: "jane@example.com",
      required: true,
    },
    {
      key: "customerPhone",
      label: "Phone Number",
      type: "tel",
      placeholder: "+1 (555) 000-0000",
      required: true,
    },
    {
      key: "notes",
      label: "Notes (optional)",
      type: "text",
      placeholder: "Anything we should know before the session?",
      textarea: true,
    },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      {/* Form */}
      <div className="space-y-5">
        {fields.map((field) => (
          <div key={field.key}>
            <label
              htmlFor={`field-${field.key}`}
              className="label-text"
            >
              {field.label}
              {field.required && <span className="text-rose-400"> *</span>}
            </label>
            {field.textarea ? (
              <textarea
                id={`field-${field.key}`}
                value={form[field.key]}
                onChange={(e) => onChange({ [field.key]: e.target.value })}
                placeholder={field.placeholder}
                rows={3}
                className="input-field resize-none"
                aria-invalid={Boolean(errors[field.key])}
              />
            ) : (
              <input
                id={`field-${field.key}`}
                type={field.type}
                value={form[field.key]}
                onChange={(e) => onChange({ [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="input-field"
                aria-invalid={Boolean(errors[field.key])}
              />
            )}
            {errors[field.key] && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="field-error"
                role="alert"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                {errors[field.key]}
              </motion.p>
            )}
          </div>
        ))}
      </div>

      {/* Live summary card */}
      <motion.aside
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card h-fit p-6"
      >
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Booking Summary
        </h3>
        <div className="mt-4 space-y-3.5 text-sm">
          <div className="flex items-start gap-3">
            <Tag className="mt-0.5 h-4 w-4 text-indigo-300" />
            <div>
              <div className="font-semibold text-white">{service.name}</div>
              <div className="text-xs text-slate-500">{service.category}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CalendarDays className="h-4 w-4 text-indigo-300" />
            <span className="text-slate-300">
              {formatDayLabel(bookingDate)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-indigo-300" />
            <span className="text-slate-300">
              {formatTimeLabel(bookingTime)} · {service.duration} min
            </span>
          </div>
        </div>

        <div className="mt-5 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Total</span>
            <span className="text-2xl font-bold text-gradient">
              ${service.price}
            </span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            Pay at the time of your session. You&apos;ll receive a confirmation
            once the booking is approved.
          </p>
        </div>
      </motion.aside>
    </div>
  );
}
