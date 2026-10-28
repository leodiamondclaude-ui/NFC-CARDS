"use client";

import { useId } from "react";
import { finishOf, variantInStock } from "@/lib/catalog";
import type { Variant } from "@/lib/types";

/** Radio group of color swatches, keyboard accessible via native radios. */
export function SwatchPicker({
  variants,
  value,
  onChange,
  label,
  size = "md",
}: {
  variants: Variant[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  size?: "sm" | "md";
}) {
  const name = useId();
  const dim = size === "sm" ? "h-6 w-6" : "h-9 w-9";
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2.5">
      {variants.map((v) => {
        const selected = v.id === value;
        const out = !variantInStock(v);
        return (
          <label key={v.id} className={`relative ${out ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`} title={out ? `${v.name} (unavailable)` : v.name}>
            <input
              type="radio"
              name={name}
              value={v.id}
              checked={selected}
              disabled={out}
              onChange={() => onChange(v.id)}
              className="peer sr-only"
            />
            <span
              className={`block ${dim} rounded-full ring-1 ring-black/15 transition-shadow duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
                selected ? "shadow-[0_0_0_2px_var(--card),0_0_0_3.5px_var(--ink)]" : ""
              }`}
              style={{ background: finishOf(v).surface }}
            />
            <span className="sr-only">
              {v.name}
              {out ? " (unavailable)" : ""}
            </span>
          </label>
        );
      })}
    </div>
  );
}
