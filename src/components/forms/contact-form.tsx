"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, fieldAria } from "@/components/ui/field";
import { FormStatus, postForm, type FormState } from "@/components/forms/form-status";
import { contactMessageSchema, type ContactMessageInput } from "@/lib/schemas";

export function ContactForm() {
  const [status, setStatus] = useState<FormState>({ state: "idle" });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactMessageInput>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: { name: "", email: "", orderNumber: "", message: "", website: "" },
  });

  async function onSubmit(values: ContactMessageInput) {
    setStatus({ state: "idle" });
    const result = await postForm("/api/contact", { ...values, orderNumber: values.orderNumber || undefined });
    if (!result.ok) return setStatus({ state: "error", message: result.message });
    reset();
    setStatus({ state: "success", message: `Thanks, we've received your message and will reply to ${values.email}.` });
  }

  const e = errors;
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative space-y-5 rounded-[var(--radius-card)] border border-line bg-card p-6 md:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="c-name" label="Name" error={e.name?.message}>
          <input autoComplete="name" className="field" {...fieldAria("c-name", e.name?.message)} {...register("name")} />
        </Field>
        <Field id="c-email" label="Email" error={e.email?.message}>
          <input type="email" autoComplete="email" className="field" {...fieldAria("c-email", e.email?.message)} {...register("email")} />
        </Field>
      </div>
      <Field id="c-order" label="Order number" optional error={e.orderNumber?.message} hint="If your message is about an order, e.g. TC-1A2B3C4D.">
        <input className="field uppercase" {...fieldAria("c-order", e.orderNumber?.message, "hint")} {...register("orderNumber")} />
      </Field>
      <Field id="c-message" label="Message" error={e.message?.message}>
        <textarea rows={6} className="field resize-y" {...fieldAria("c-message", e.message?.message)} {...register("message")} />
      </Field>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="c-website">Website</label>
        <input id="c-website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
      <FormStatus status={status} />
      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
