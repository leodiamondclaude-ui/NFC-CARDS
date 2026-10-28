"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, fieldAria } from "@/components/ui/field";
import { FormStatus, postForm, type FormState } from "@/components/forms/form-status";
import { track } from "@/lib/analytics";
import { inquiryTypes, quoteSchema } from "@/lib/schemas";

type In = z.input<typeof quoteSchema>;
type Out = z.output<typeof quoteSchema>;

export function QuoteForm() {
  const [status, setStatus] = useState<FormState>({ state: "idle" });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<In, unknown, Out>({
    resolver: zodResolver(quoteSchema),
    defaultValues: { name: "", email: "", company: "", quantity: "", inquiryType: "bulk", details: "", website: "" },
  });

  async function onSubmit(values: Out) {
    setStatus({ state: "idle" });
    const result = await postForm("/api/quote", values);
    if (!result.ok) return setStatus({ state: "error", message: result.message });
    track({ name: "generate_lead", kind: "quote" });
    reset();
    setStatus({
      state: "success",
      message: result.data.emailed
        ? `Thanks, ${values.name.split(" ")[0]}. We've received your request and sent a copy to ${values.email}. We'll reply with options soon.`
        : `Thanks, ${values.name.split(" ")[0]}. We've received your request and will reply to ${values.email} with options.`,
    });
  }

  const e = errors;
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative space-y-5 rounded-[var(--radius-card)] border border-line bg-card p-6 md:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="q-name" label="Name" error={e.name?.message}>
          <input autoComplete="name" className="field" {...fieldAria("q-name", e.name?.message)} {...register("name")} />
        </Field>
        <Field id="q-email" label="Business email" error={e.email?.message}>
          <input type="email" autoComplete="email" className="field" {...fieldAria("q-email", e.email?.message)} {...register("email")} />
        </Field>
        <Field id="q-company" label="Company" error={e.company?.message}>
          <input autoComplete="organization" className="field" {...fieldAria("q-company", e.company?.message)} {...register("company")} />
        </Field>
        <Field id="q-qty" label="Estimated quantity" error={e.quantity?.message}>
          <input type="number" inputMode="numeric" min={1} className="field" {...fieldAria("q-qty", e.quantity?.message)} {...register("quantity")} />
        </Field>
      </div>
      <Field id="q-type" label="What do you need?">
        <select className="field" {...fieldAria("q-type")} {...register("inquiryType")}>
          {inquiryTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>
      <Field id="q-details" label="Project details" error={e.details?.message} hint="Team size, branding needs, timeline, anything else that helps.">
        <textarea rows={5} className="field resize-y" {...fieldAria("q-details", e.details?.message, "hint")} {...register("details")} />
      </Field>
      {/* Honeypot: hidden from people and assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="q-website">Website</label>
        <input id="q-website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
      <FormStatus status={status} />
      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Sending…" : "Request a Quote"}
      </Button>
      <p className="text-xs text-muted">We use these details only to reply to your request.</p>
    </form>
  );
}
