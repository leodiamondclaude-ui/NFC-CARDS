"use client";

import { useId } from "react";
import { finishes, type FinishId } from "@/config/products";

/** Radio-group of finish swatches, keyboard accessible via native radios. */
export function SwatchPicker({
  finishIds,
  value,
  onChange,
  label,
  size = "md",
}: {
  finishIds: FinishId[];
  value: FinishId;
  onChange: (id: FinishId) => void;
  label: string;
  size?: "sm" | "md";
}) {
  const name = useId();
  const dim = size === "sm" ? "h-6 w-6" : "h-9 w-9";
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {finishIds.map((id) => {
        const f = finishes[id];
        const selected = id === value;
        return (
          <label key={id} className="relative cursor-pointer" title={f.name}>
            <input
              type="radio"
              name={name}
              value={id}
              checked={selected}
              onChange={() => onChange(id)}
              className="peer sr-only"
            />
            <span
              className={`block ${dim} rounded-full ring-1 ring-black/10 transition-shadow peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
                selected ? "shadow-[0_0_0_2px_var(--card),0_0_0_3.5px_var(--ink)]" : ""
              }`}
              style={{ background: f.surface }}
            />
            <span className="sr-only">{f.name}</span>
          </label>
        );
      })}
    </div>
  );
}
