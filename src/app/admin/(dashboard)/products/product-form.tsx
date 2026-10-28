"use client";

import { useActionState, useState } from "react";
import { categories, finishes } from "@/config/products";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon } from "@/components/ui/icons";
import type { CustomField, FinishId, Product } from "@/lib/types";
import { saveProductAction, type ProductFormState } from "./actions";

const customFieldLabels: Record<CustomField, string> = {
  printedName: "Printed name",
  jobTitle: "Job title",
  company: "Company",
  profileUrl: "Website / profile URL",
  logo: "Logo upload",
};

type VariantDraft = { key: string; id: string; name: string; finish: FinishId; sku: string; inventory: string; available: boolean };

let draftKey = 0;
const toDraft = (v?: Product["variants"][number]): VariantDraft => ({
  key: `d${draftKey++}`,
  id: v?.id ?? "",
  name: v?.name ?? "",
  finish: v?.finish ?? "black",
  sku: v?.sku ?? "",
  inventory: v?.inventory === null || v?.inventory === undefined ? "" : String(v.inventory),
  available: v?.available ?? true,
});

function Label({ htmlFor, children, hint }: { htmlFor: string; children: React.ReactNode; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium">
      {children}
      {hint && <span className="ml-1 font-normal text-muted">{hint}</span>}
    </label>
  );
}

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1 text-xs text-danger">{msg}</p> : null;
}

export function ProductForm({ product }: { product?: Product }) {
  const [state, action, pending] = useActionState(saveProductAction.bind(null, product?.id ?? null), {} as ProductFormState);
  const [variants, setVariants] = useState<VariantDraft[]>(() => (product?.variants.length ? product.variants.map(toDraft) : [toDraft()]));
  const e = state.fieldErrors ?? {};
  const update = (key: string, patch: Partial<VariantDraft>) => setVariants((vs) => vs.map((v) => (v.key === key ? { ...v, ...patch } : v)));

  return (
    <form action={action} className="space-y-6">
      <section className="space-y-4 rounded-2xl border border-line bg-card p-5">
        <h2 className="text-sm font-semibold">Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="p-name">Name</Label>
            <input id="p-name" name="name" defaultValue={product?.name} className="field py-2 text-sm" aria-invalid={!!e.name} />
            <Err msg={e.name} />
          </div>
          <div>
            <Label htmlFor="p-slug" hint="(URL)">
              Slug
            </Label>
            <input id="p-slug" name="slug" defaultValue={product?.slug} className="field py-2 font-mono text-sm" placeholder="my-nfc-card" aria-invalid={!!e.slug} />
            <Err msg={e.slug} />
          </div>
          <div>
            <Label htmlFor="p-category">Category</Label>
            <select id="p-category" name="category" defaultValue={product?.category ?? "cards"} className="field py-2 text-sm">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="p-sort" hint="(lower shows first)">
              Sort order
            </Label>
            <input id="p-sort" name="sortOrder" type="number" min={0} defaultValue={product?.sortOrder ?? 10} className="field py-2 text-sm" />
          </div>
        </div>
        <div>
          <Label htmlFor="p-short">Short description</Label>
          <input id="p-short" name="shortDescription" defaultValue={product?.shortDescription} className="field py-2 text-sm" aria-invalid={!!e.shortDescription} />
          <Err msg={e.shortDescription} />
        </div>
        <div>
          <Label htmlFor="p-desc">Description</Label>
          <textarea id="p-desc" name="description" rows={4} defaultValue={product?.description} className="field text-sm" aria-invalid={!!e.description} />
          <Err msg={e.description} />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-line bg-card p-5">
        <h2 className="text-sm font-semibold">Pricing and visibility</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="p-price" hint="(USD)">
              Price
            </Label>
            <input
              id="p-price"
              name="price"
              type="number"
              step="0.01"
              min="0.5"
              defaultValue={product ? (product.price / 100).toFixed(2) : ""}
              className="field py-2 text-sm"
              aria-invalid={!!e.price}
            />
            <Err msg={e.price} />
          </div>
          <div>
            <Label htmlFor="p-units">Cards per unit</Label>
            <input id="p-units" name="unitsPerPack" type="number" min={1} defaultValue={product?.unitsPerPack ?? 1} className="field py-2 text-sm" />
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {(
            [
              ["active", "Available in the store", product?.active ?? true],
              ["featured", "Featured on the homepage", product?.featured ?? false],
              ["startingAt", 'Show price as "From"', product?.startingAt ?? false],
              ["quoteCta", "Show bulk quote button", product?.quoteCta ?? false],
            ] as const
          ).map(([name, label, checked]) => (
            <label key={name} className="flex items-center gap-2">
              <input type="checkbox" name={name} defaultChecked={checked} className="accent-[var(--accent)]" /> {label}
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-line bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Variants and inventory</h2>
          <button
            type="button"
            onClick={() => setVariants((vs) => [...vs, toDraft()])}
            disabled={variants.length >= 12}
            className="inline-flex items-center gap-1 text-sm text-accent disabled:opacity-40"
          >
            <PlusIcon size={15} /> Add variant
          </button>
        </div>
        <p className="text-xs text-muted">Leave inventory blank if you don&apos;t track stock. Tracked stock goes down when a payment is confirmed.</p>
        <input type="hidden" name="variantCount" value={variants.length} />
        <div className="space-y-3">
          {variants.map((v, i) => (
            <div key={v.key} className="grid items-end gap-3 rounded-xl bg-paper-2 p-3 sm:grid-cols-[1.2fr_1fr_1fr_0.8fr_auto_auto]">
              <input type="hidden" name={`variants.${i}.id`} value={v.id} />
              <div>
                <Label htmlFor={`v-name-${v.key}`}>Color name</Label>
                <input id={`v-name-${v.key}`} name={`variants.${i}.name`} value={v.name} onChange={(ev) => update(v.key, { name: ev.target.value })} className="field py-2 text-sm" />
              </div>
              <div>
                <Label htmlFor={`v-finish-${v.key}`}>Preview style</Label>
                <select id={`v-finish-${v.key}`} name={`variants.${i}.finish`} value={v.finish} onChange={(ev) => update(v.key, { finish: ev.target.value as FinishId })} className="field py-2 text-sm">
                  {Object.keys(finishes).map((f) => (
                    <option key={f} value={f}>
                      {f[0].toUpperCase() + f.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor={`v-sku-${v.key}`}>SKU</Label>
                <input id={`v-sku-${v.key}`} name={`variants.${i}.sku`} value={v.sku} onChange={(ev) => update(v.key, { sku: ev.target.value })} className="field py-2 font-mono text-sm uppercase" />
              </div>
              <div>
                <Label htmlFor={`v-inv-${v.key}`}>Inventory</Label>
                <input id={`v-inv-${v.key}`} name={`variants.${i}.inventory`} type="number" min={0} value={v.inventory} onChange={(ev) => update(v.key, { inventory: ev.target.value })} placeholder="Not tracked" className="field py-2 text-sm" />
              </div>
              <label className="flex h-10 items-center gap-2 text-sm">
                <input type="checkbox" name={`variants.${i}.available`} checked={v.available} onChange={(ev) => update(v.key, { available: ev.target.checked })} className="accent-[var(--accent)]" />
                Available
              </label>
              <button
                type="button"
                onClick={() => setVariants((vs) => vs.filter((x) => x.key !== v.key))}
                disabled={variants.length <= 1}
                aria-label={`Remove variant ${v.name || i + 1}`}
                className="grid h-10 w-10 place-items-center rounded-full text-muted hover:text-danger disabled:opacity-30"
              >
                <TrashIcon size={16} />
              </button>
            </div>
          ))}
        </div>
        <Err msg={e.variants} />
      </section>

      <section className="space-y-4 rounded-2xl border border-line bg-card p-5">
        <h2 className="text-sm font-semibold">Customization offered</h2>
        <p className="text-xs text-muted">Only enable options you can produce. Customers see a field for each one on the product page.</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {(Object.keys(customFieldLabels) as CustomField[]).map((f) => (
            <label key={f} className="flex items-center gap-2">
              <input type="checkbox" name="customFields" value={f} defaultChecked={product?.customFields.includes(f)} className="accent-[var(--accent)]" />
              {customFieldLabels[f]}
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-line bg-card p-5">
        <h2 className="text-sm font-semibold">Specs and FAQ</h2>
        <div>
          <Label htmlFor="p-specs" hint="One per line: Label: value">
            Specifications
          </Label>
          <textarea id="p-specs" name="specs" rows={5} defaultValue={product?.specs.map((s) => `${s.label}: ${s.value}`).join("\n")} className="field font-mono text-xs" />
        </div>
        <div>
          <Label htmlFor="p-faq" hint="One per line: Question | Answer">
            Product FAQ
          </Label>
          <textarea id="p-faq" name="faq" rows={4} defaultValue={product?.faq.map((f) => `${f.q} | ${f.a}`).join("\n")} className="field font-mono text-xs" />
        </div>
      </section>

      <div className="sticky bottom-4 flex items-center gap-4 rounded-2xl border border-line bg-card/95 p-3 backdrop-blur">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : product ? "Save changes" : "Create product"}
        </Button>
        {state.message && (
          <p role={state.ok ? "status" : "alert"} className={`text-sm ${state.ok ? "text-success" : "text-danger"}`}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
