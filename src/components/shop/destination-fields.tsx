"use client";

import { useId } from "react";
import {
  destinationPresets,
  socialPlatforms,
  type Destination,
  type DestinationErrors,
  type DestinationType,
  type SocialPlatform,
} from "@/lib/destinations";

export function emptyDestination(type: DestinationType): Destination {
  switch (type) {
    case "social":
      return { type, platform: "instagram", handle: "" };
    case "contact":
      return { type, name: "", email: "", phone: "", company: "" };
    default:
      return { type, url: "" };
  }
}

export function DestinationFields({
  value,
  onChange,
  errors,
  showErrors,
}: {
  value: Destination;
  onChange: (d: Destination) => void;
  errors: DestinationErrors;
  showErrors: boolean;
}) {
  const id = useId();
  const preset = destinationPresets.find((p) => p.type === value.type)!;
  const err = (k: string) => (showErrors ? errors[k] : undefined);

  return (
    <div>
      <div role="radiogroup" aria-label="Destination type" className="flex flex-wrap gap-2">
        {destinationPresets.map((p) => {
          const active = p.type === value.type;
          return (
            <button
              key={p.type}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => !active && onChange(emptyDestination(p.type))}
              className={`rounded-full px-3.5 py-2 text-sm transition-colors ${
                active ? "bg-ink text-paper" : "bg-card text-ink-2 shadow-[0_0_0_1px_var(--line-strong)] hover:text-ink"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">{preset.hint}</p>

      <div className="mt-4 grid gap-4">
        {(value.type === "website" || value.type === "business-card" || value.type === "link-in-bio") && (
          <Field id={`${id}-url`} label="Web address" error={err("url")}>
            <input
              id={`${id}-url`}
              className="field"
              inputMode="url"
              autoComplete="url"
              placeholder={value.type === "link-in-bio" ? "linktr.ee/yourname" : "yourwebsite.com"}
              value={value.url}
              onChange={(e) => onChange({ ...value, url: e.target.value })}
              aria-invalid={!!err("url")}
              aria-describedby={err("url") ? `${id}-url-err` : undefined}
            />
          </Field>
        )}

        {value.type === "social" && (
          <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
            <Field id={`${id}-platform`} label="Platform" error={err("platform")}>
              <select
                id={`${id}-platform`}
                className="field"
                value={value.platform}
                onChange={(e) => onChange({ ...value, platform: e.target.value as SocialPlatform })}
              >
                {Object.entries(socialPlatforms).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field id={`${id}-handle`} label="Username" error={err("handle")}>
              <input
                id={`${id}-handle`}
                className="field"
                placeholder="@yourname"
                autoCapitalize="none"
                value={value.handle}
                onChange={(e) => onChange({ ...value, handle: e.target.value })}
                aria-invalid={!!err("handle")}
                aria-describedby={err("handle") ? `${id}-handle-err` : undefined}
              />
            </Field>
          </div>
        )}

        {value.type === "contact" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id={`${id}-cname`} label="Full name" error={err("name")}>
              <input
                id={`${id}-cname`}
                className="field"
                autoComplete="name"
                value={value.name}
                onChange={(e) => onChange({ ...value, name: e.target.value })}
                aria-invalid={!!err("name")}
              />
            </Field>
            <Field id={`${id}-company`} label="Company (optional)" error={err("company")}>
              <input
                id={`${id}-company`}
                className="field"
                autoComplete="organization"
                value={value.company ?? ""}
                onChange={(e) => onChange({ ...value, company: e.target.value })}
              />
            </Field>
            <Field id={`${id}-email`} label="Email" error={err("email")}>
              <input
                id={`${id}-email`}
                type="email"
                className="field"
                autoComplete="email"
                value={value.email ?? ""}
                onChange={(e) => onChange({ ...value, email: e.target.value })}
                aria-invalid={!!err("email")}
              />
            </Field>
            <Field id={`${id}-phone`} label="Phone" error={err("phone")}>
              <input
                id={`${id}-phone`}
                type="tel"
                className="field"
                autoComplete="tel"
                value={value.phone ?? ""}
                onChange={(e) => onChange({ ...value, phone: e.target.value })}
                aria-invalid={!!err("phone")}
              />
            </Field>
          </div>
        )}
      </div>
    </div>
  );
}

export function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
