"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/shop/destination-fields";
import { CheckIcon } from "@/components/ui/icons";

type Status = { state: "idle" } | { state: "sending" } | { state: "sent"; emailed: boolean } | { state: "error"; message: string };

export function QuoteForm() {
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [fields, setFields] = useState<Record<string, string[] | undefined>>({});

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setStatus({ state: "sending" });
    setFields({});
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string; fields?: Record<string, string[]>; confirmationEmailSent?: boolean };
      if (res.ok && body.ok) {
        setStatus({ state: "sent", emailed: !!body.confirmationEmailSent });
        return;
      }
      setFields(body.fields ?? {});
      setStatus({ state: "error", message: body.error ?? "Something went wrong. Please try again." });
    } catch {
      setStatus({ state: "error", message: "We couldn't reach the server. Please try again." });
    }
  }

  if (status.state === "sent") {
    return (
      <div role="status" className="rounded-[var(--radius-card)] bg-card p-8 text-center shadow-[0_0_0_1px_var(--line)]">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-ink">
          <CheckIcon />
        </span>
        <h3 className="mt-5 text-xl font-semibold">Request received</h3>
        <p className="mt-2 text-muted">
          We&apos;ve saved your request and will reply within two business days.
          {status.emailed ? " A confirmation is on its way to your inbox." : ""}
        </p>
      </div>
    );
  }

  const err = (k: string) => fields[k]?.[0];

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 rounded-[var(--radius-card)] bg-card p-6 shadow-[0_0_0_1px_var(--line)] sm:grid-cols-2 md:p-8">
      <Field id="q-name" label="Your name" error={err("name")}>
        <input id="q-name" name="name" autoComplete="name" required className="field" aria-invalid={!!err("name")} />
      </Field>
      <Field id="q-email" label="Work email" error={err("email")}>
        <input id="q-email" name="email" type="email" autoComplete="email" required className="field" aria-invalid={!!err("email")} />
      </Field>
      <Field id="q-company" label="Company" error={err("company")}>
        <input id="q-company" name="company" autoComplete="organization" required className="field" aria-invalid={!!err("company")} />
      </Field>
      <Field id="q-quantity" label="Number of cards" error={err("quantity")}>
        <input id="q-quantity" name="quantity" type="number" min={10} defaultValue={25} required className="field" aria-invalid={!!err("quantity")} />
      </Field>
      <div className="sm:col-span-2">
        <Field id="q-timeline" label="Timeline">
          <select id="q-timeline" name="timeline" className="field" defaultValue="month">
            <option value="asap">As soon as possible</option>
            <option value="month">Within a month</option>
            <option value="quarter">This quarter</option>
            <option value="exploring">Just exploring</option>
          </select>
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field id="q-message" label="Anything else? (optional)" error={err("message")}>
          <textarea id="q-message" name="message" rows={4} maxLength={2000} className="field resize-y" placeholder="Card type, finishes, events, deadlines…" />
        </Field>
      </div>
      {status.state === "error" && (
        <p role="alert" className="text-sm text-danger sm:col-span-2">
          {status.message}
        </p>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={status.state === "sending"}>
          {status.state === "sending" ? "Sending…" : "Request a quote"}
        </Button>
      </div>
    </form>
  );
}
