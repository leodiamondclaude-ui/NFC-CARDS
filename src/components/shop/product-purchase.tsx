"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useEffect, useMemo, useState, ViewTransition, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { limits } from "@/config/site";
import { ProductVisual } from "@/components/card/product-visual";
import type { CardView } from "@/components/card/card-art";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, fieldAria } from "@/components/ui/field";
import { CheckIcon, MinusIcon, PlusIcon, SpinnerIcon, TrashIcon, UploadIcon } from "@/components/ui/icons";
import { SwatchPicker } from "@/components/shop/swatch-picker";
import { track } from "@/lib/analytics";
import { cart } from "@/lib/cart-store";
import { defaultVariant, findVariant, priceLabel, variantInStock } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { customizationSchema } from "@/lib/schemas";
import type { CustomField, Product } from "@/lib/types";
import type { z } from "zod";

type FormValues = z.input<typeof customizationSchema>;

type Upload =
  | { state: "idle" }
  | { state: "uploading"; name: string; preview?: string }
  | { state: "done"; id: string; name: string; preview?: string }
  | { state: "error"; message: string };

const textFields: { key: Exclude<CustomField, "logo">; label: string; placeholder: string; hint?: string; inputMode?: "url" }[] = [
  { key: "printedName", label: "Printed name", placeholder: "Alex Rivera", hint: "Up to 40 characters" },
  { key: "jobTitle", label: "Job title", placeholder: "Founder", hint: "Up to 40 characters" },
  { key: "company", label: "Company name", placeholder: "Rivera Studio", hint: "Up to 60 characters" },
  {
    key: "profileUrl",
    label: "Website or digital profile URL",
    placeholder: "yourname.com",
    hint: "What opens when someone taps your card. You can leave this blank and send it to us after checkout.",
    inputMode: "url",
  },
];

/** Product gallery + purchase options. Physical details and the tap destination are clearly separated. */
export function ProductPurchase({ product, header }: { product: Product; header: ReactNode }) {
  const [variantId, setVariantId] = useState(defaultVariant(product)?.id ?? "");
  const variant = findVariant(product, variantId) ?? product.variants[0];
  const [view, setView] = useState<CardView | `photo-${number}`>("front");
  const [quantity, setQuantity] = useState(1);
  const [upload, setUpload] = useState<Upload>({ state: "idle" });
  const [added, setAdded] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(customizationSchema), mode: "onTouched" });
  const values = useWatch({ control });

  const has = (f: CustomField) => product.customFields.includes(f);
  const inStock = variant ? variantInStock(variant, quantity) : false;
  const preview = upload.state === "done" || upload.state === "uploading" ? upload.preview : undefined;
  const subtext = [values.jobTitle, values.company].filter(Boolean).join(", ") || undefined;

  useEffect(() => {
    track({ name: "view_item", slug: product.slug, price: product.price });
  }, [product.slug, product.price]);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const views = useMemo(() => {
    const v: { id: CardView | `photo-${number}`; label: string }[] = product.images.map((img, i) => ({ id: `photo-${i}` as const, label: img.alt || `Photo ${i + 1}` }));
    if (product.unitsPerPack === 1) v.push({ id: "front", label: "Front" }, { id: "angled", label: "Angle" }, { id: "back", label: "Back" });
    else v.push({ id: "front", label: "Pack" }, { id: "angled", label: "Card" });
    return v;
  }, [product]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!(file.type in limits.upload.types)) return setUpload({ state: "error", message: `Use a ${limits.upload.label} file.` });
    if (file.size > limits.upload.maxBytes) return setUpload({ state: "error", message: `Use a ${limits.upload.label} file.` });
    const local = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
    setUpload({ state: "uploading", name: file.name, preview: local });
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) throw new Error(data.error ?? "Upload failed. Please try again.");
      setUpload({ state: "done", id: data.id, name: file.name, preview: local });
    } catch (e) {
      setUpload({ state: "error", message: e instanceof Error ? e.message : "Upload failed. Please try again." });
    }
  }

  const onSubmit = handleSubmit((data) => {
    if (!variant || upload.state === "uploading") return;
    const customization = Object.fromEntries(
      Object.entries({
        printedName: has("printedName") ? data.printedName : undefined,
        jobTitle: has("jobTitle") ? data.jobTitle : undefined,
        company: has("company") ? data.company : undefined,
        profileUrl: has("profileUrl") ? data.profileUrl : undefined,
        ...(has("logo") && upload.state === "done" ? { logoUploadId: upload.id, logoName: upload.name } : {}),
      }).filter(([, v]) => v),
    );
    cart.add({
      slug: product.slug,
      variantId: variant.id,
      quantity,
      customization: Object.keys(customization).length ? customization : undefined,
    });
    setAdded(true);
  });

  const photoIndex = typeof view === "string" && view.startsWith("photo-") ? Number(view.slice(6)) : -1;

  return (
    <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
      {/* Gallery */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <ViewTransition name={`product-${product.slug}`} share="morph" default="none">
        <div className="overflow-hidden rounded-[1.25rem] border border-line bg-paper-2">
          {variant &&
            (photoIndex >= 0 ? (
              <ProductVisual product={product} variant={variant} photoIndex={photoIndex} priority sizes="(min-width: 1024px) 50vw, 100vw" />
            ) : (
              <div key={`${view}-${variant.id}`} className="animate-rise py-[6%]">
                <ProductVisual
                  product={{ ...product, images: [] }}
                  variant={variant}
                  view={view as CardView}
                  text={values.printedName || (product.unitsPerPack > 1 ? undefined : "Your Name")}
                  subtext={subtext}
                  logoUrl={preview}
                />
              </div>
            ))}
        </div>
        </ViewTransition>
        {views.length > 1 && (
          <div role="tablist" aria-label="Product images" className="mt-3 grid grid-cols-4 gap-2">
            {views.map((v) => (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={view === v.id}
                onClick={() => setView(v.id)}
                className={`overflow-hidden rounded-xl border bg-paper-2 transition-colors ${view === v.id ? "border-ink" : "border-line hover:border-line-strong"}`}
              >
                {variant &&
                  (v.id.startsWith("photo-") ? (
                    <span className="relative block aspect-[4/3]">
                      <Image src={product.images[Number(v.id.slice(6))].url} alt="" fill sizes="120px" className="object-cover" unoptimized={product.images[Number(v.id.slice(6))].url.startsWith("/api/")} />
                    </span>
                  ) : (
                    <span className="pointer-events-none block py-1">
                      <ProductVisual product={{ ...product, images: [] }} variant={variant} view={v.id as CardView} text={values.printedName || undefined} logoUrl={preview} />
                    </span>
                  ))}
                <span className="block pb-2 text-xs text-muted">{v.label}</span>
              </button>
            ))}
          </div>
        )}
        <p className="mt-3 text-center text-xs text-muted">Preview is a simplified illustration, not an exact proof.</p>
      </div>

      {/* Options */}
      <div>
        {header}
        <form onSubmit={onSubmit} noValidate className="mt-8 space-y-8">
          {product.variants.length > 0 && variant && (
            <fieldset>
              <legend className="mb-3 flex w-full justify-between text-sm font-medium">
                Color <span className="font-normal text-muted">{variant.name}</span>
              </legend>
              <SwatchPicker variants={product.variants} value={variant.id} onChange={setVariantId} label="Color" />
            </fieldset>
          )}

          {product.customFields.length > 0 && (
            <fieldset className="space-y-4 border-t border-line pt-6">
              <legend className="sr-only">Customization</legend>
              <p className="text-sm font-medium">{product.unitsPerPack > 1 ? "Team branding" : "Personalize your card"}</p>
              {textFields
                .filter((f) => has(f.key))
                .map((f) => (
                  <Field key={f.key} id={`pp-${f.key}`} label={f.label} hint={f.hint} optional error={errors[f.key]?.message}>
                    <input
                      {...register(f.key)}
                      {...fieldAria(`pp-${f.key}`, errors[f.key]?.message, f.hint)}
                      className="field"
                      placeholder={f.placeholder}
                      inputMode={f.inputMode}
                      autoCapitalize={f.inputMode ? "none" : undefined}
                    />
                  </Field>
                ))}

              {has("logo") && (
                <div>
                  <p className="mb-1.5 flex justify-between text-sm font-medium">
                    Logo <span className="text-xs font-normal text-muted">Optional</span>
                  </p>
                  {upload.state === "done" || upload.state === "uploading" ? (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-line-strong bg-card p-3">
                      <span className="flex min-w-0 items-center gap-2 text-sm">
                        {upload.state === "done" ? <CheckIcon size={16} className="shrink-0 text-success" /> : <SpinnerIcon size={16} className="shrink-0 animate-spin text-muted" />}
                        <span className="truncate">{upload.name}</span>
                      </span>
                      <button type="button" onClick={() => setUpload({ state: "idle" })} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-paper-2 hover:text-ink" aria-label="Remove logo">
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="logo-upload" className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed border-line-strong bg-card px-4 py-6 text-center transition-colors hover:border-ink focus-within:border-ink">
                      <UploadIcon size={20} className="text-muted" />
                      <span className="text-sm font-medium">Upload a logo</span>
                      <span className="text-xs text-muted">{limits.upload.label}. Stored privately.</span>
                      <input
                        id="logo-upload"
                        type="file"
                        accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
                        className="sr-only"
                        onChange={(e) => {
                          void onFile(e.target.files?.[0]);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  )}
                  {upload.state === "error" && (
                    <p className="mt-1.5 text-xs text-danger" role="alert">
                      {upload.message}
                    </p>
                  )}
                </div>
              )}
              {product.unitsPerPack > 1 && (
                <p className="text-sm text-muted">After checkout we&apos;ll email you a short form for each team member&apos;s name and link.</p>
              )}
            </fieldset>
          )}

          <div className="border-t border-line pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-full border border-line-strong" role="group" aria-label="Quantity">
                <button type="button" className="grid h-11 w-11 place-items-center rounded-full hover:bg-paper-2 disabled:opacity-40" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label="Decrease quantity">
                  <MinusIcon size={16} />
                </button>
                <span className="w-8 text-center tabular-nums" aria-live="polite" aria-label={`Quantity ${quantity}`}>
                  {quantity}
                </span>
                <button type="button" className="grid h-11 w-11 place-items-center rounded-full hover:bg-paper-2 disabled:opacity-40" onClick={() => setQuantity((q) => Math.min(limits.maxQuantityPerLine, q + 1))} disabled={quantity >= limits.maxQuantityPerLine} aria-label="Increase quantity">
                  <PlusIcon size={16} />
                </button>
              </div>
              <p className="text-lg font-medium tabular-nums">{formatMoney(product.price * quantity)}</p>
            </div>

            {added ? (
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/cart" size="lg" className="flex-1">
                  View cart
                </ButtonLink>
                <Button type="button" size="lg" variant="secondary" className="flex-1" onClick={() => setAdded(false)}>
                  Add another
                </Button>
              </div>
            ) : (
              <Button type="submit" size="lg" className="mt-5 w-full" disabled={!inStock || upload.state === "uploading"}>
                {!inStock ? "Unavailable" : upload.state === "uploading" ? "Uploading logo…" : `Add to cart · ${priceLabel({ ...product, startingAt: false, price: product.price * quantity })}`}
              </Button>
            )}
            {product.quoteCta && (
              <ButtonLink href="/business#quote" variant="secondary" size="lg" className="mt-3 w-full">
                Request a bulk quote
              </ButtonLink>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
