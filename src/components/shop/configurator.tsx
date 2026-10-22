"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { finishes, type FinishId, type Product } from "@/config/products";
import { limits } from "@/config/site";
import { CardArt, type CardView } from "@/components/card/card-art";
import { Button, ButtonLink } from "@/components/ui/button";
import { CheckIcon, InfoIcon, MinusIcon, PlusIcon, UploadIcon, TrashIcon } from "@/components/ui/icons";
import { SwatchPicker } from "@/components/shop/swatch-picker";
import { DestinationFields, Field, emptyDestination } from "@/components/shop/destination-fields";
import { cart } from "@/lib/cart-store";
import { needsArtwork } from "@/lib/catalog";
import { describeDestination, destinationLabel, validateDestination, type Destination } from "@/lib/destinations";
import { formatMoney } from "@/lib/money";

type Upload =
  | { state: "idle" }
  | { state: "uploading"; name: string; preview?: string }
  | { state: "done"; id: string; name: string; preview?: string }
  | { state: "error"; message: string };

const views: { id: CardView; label: string }[] = [
  { id: "front", label: "Front" },
  { id: "angled", label: "Angle" },
  { id: "back", label: "Back" },
  { id: "edge", label: "Edge" },
];

/**
 * Card builder used on product pages and the standalone customizer.
 * Physical personalization and the digital destination are kept in separate,
 * clearly labelled steps. Nothing is written to a chip from the browser: the
 * configuration becomes part of the order and is programmed at fulfillment.
 */
export function Configurator({
  products,
  initialSlug,
  allowProductChoice = false,
  header,
}: {
  products: Product[];
  initialSlug: string;
  allowProductChoice?: boolean;
  header?: ReactNode;
}) {
  const [slug, setSlug] = useState(initialSlug);
  const product = products.find((p) => p.slug === slug) ?? products[0];
  const [finishId, setFinishId] = useState<FinishId>(product.finishes[0]);
  const [view, setView] = useState<CardView>("front");
  const [text, setText] = useState("");
  const [subtext, setSubtext] = useState("");
  const [upload, setUpload] = useState<Upload>({ state: "idle" });
  const [destination, setDestination] = useState<Destination>(emptyDestination("website"));
  const [quantity, setQuantity] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [added, setAdded] = useState(false);

  const perCardSetup = product.unitsPerPack > 1;
  const destErrors = useMemo(() => validateDestination(destination), [destination]);
  const destValid = Object.keys(destErrors).length === 0;
  const artworkRequired = needsArtwork(product);
  const artworkOk = !artworkRequired || upload.state === "done";
  const uploadBusy = upload.state === "uploading";
  const finish = finishes[product.finishes.includes(finishId) ? finishId : product.finishes[0]];

  const preview = upload.state === "done" || upload.state === "uploading" ? upload.preview : undefined;

  // Revoke object URLs when replaced.
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  function chooseProduct(next: Product) {
    setSlug(next.slug);
    if (!next.finishes.includes(finishId)) setFinishId(next.finishes[0]);
    if (!next.acceptsLogo) setUpload({ state: "idle" });
    if (!next.customizable) {
      setText("");
      setSubtext("");
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!(file.type in limits.upload.types)) {
      setUpload({ state: "error", message: "Use a PNG, JPG, SVG or PDF file." });
      return;
    }
    if (file.size > limits.upload.maxBytes) {
      setUpload({ state: "error", message: `Files must be under ${limits.upload.maxBytes / 1024 / 1024} MB.` });
      return;
    }
    const localPreview = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
    setUpload({ state: "uploading", name: file.name, preview: localPreview });
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) throw new Error(data.error ?? "Upload failed. Please try again.");
      setUpload({ state: "done", id: data.id, name: file.name, preview: localPreview });
    } catch (e) {
      setUpload({ state: "error", message: e instanceof Error ? e.message : "Upload failed. Please try again." });
    }
  }

  function addToCart() {
    setSubmitted(true);
    if ((!perCardSetup && !destValid) || !artworkOk || uploadBusy) return;
    cart.add({
      slug: product.slug,
      finishId: finish.id,
      quantity,
      customization: product.customizable
        ? {
            text: text.trim() || undefined,
            subtext: subtext.trim() || undefined,
            ...(upload.state === "done" ? { uploadId: upload.id, uploadName: upload.name } : {}),
          }
        : undefined,
      destination: perCardSetup ? undefined : destination,
    });
    setAdded(true);
  }

  let step = 0;
  const nextStep = () => ++step;

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
      <Suspense fallback={null}>
        <FinishFromUrl product={product} onFinish={setFinishId} />
      </Suspense>

      {/* Preview */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="grid aspect-[5/4] place-items-center overflow-hidden rounded-[1.5rem] bg-paper-2 px-[14%] shadow-[0_0_0_1px_var(--line)]">
          <CardArt
            key={view}
            finish={finish}
            form={product.form}
            view={view}
            text={text || undefined}
            subtext={subtext || undefined}
            logoUrl={preview}
            className="animate-rise"
          />
        </div>
        {product.form === "card" && (
          <div role="tablist" aria-label="Preview angle" className="mt-3 grid grid-cols-4 gap-2">
            {views.map((v) => (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={view === v.id}
                onClick={() => setView(v.id)}
                className={`rounded-xl px-2 py-3 transition-shadow ${view === v.id ? "bg-card shadow-[0_0_0_1.5px_var(--ink)]" : "bg-paper-2 shadow-[0_0_0_1px_var(--line)] hover:bg-card"}`}
              >
                <span className="pointer-events-none mx-auto block w-[70%]">
                  <CardArt finish={finish} view={v.id} text={text || undefined} subtext={subtext || undefined} logoUrl={preview} shadow={false} />
                </span>
                <span className="mt-2 block text-xs text-muted">{v.label}</span>
              </button>
            ))}
          </div>
        )}
        <p className="mt-3 text-center text-xs text-muted">
          Preview is a simplified representation. {artworkRequired ? "You'll get a digital proof before production." : ""}
        </p>
      </div>

      {/* Options */}
      <div>
        {header}

        <form
          className="mt-8 space-y-10"
          onSubmit={(e) => {
            e.preventDefault();
            addToCart();
          }}
          noValidate
        >
          {allowProductChoice && (
            <Step n={nextStep()} title="Card style">
              <div className="grid gap-2 sm:grid-cols-2">
                {products
                  .filter((p) => p.form === "card")
                  .map((p) => {
                    const active = p.slug === product.slug;
                    return (
                      <button
                        key={p.slug}
                        type="button"
                        aria-pressed={active}
                        onClick={() => chooseProduct(p)}
                        className={`flex items-center justify-between gap-3 rounded-2xl p-4 text-left transition-shadow ${
                          active ? "bg-card shadow-[0_0_0_1.5px_var(--ink)]" : "bg-card shadow-[0_0_0_1px_var(--line)] hover:shadow-[0_0_0_1px_var(--line-strong)]"
                        }`}
                      >
                        <span>
                          <span className="block text-sm font-medium">{p.name}</span>
                          <span className="block text-xs text-muted">{p.tagline}</span>
                        </span>
                        <span className="text-sm tabular-nums">{formatMoney(p.price)}</span>
                      </button>
                    );
                  })}
              </div>
            </Step>
          )}

          <Step n={nextStep()} title="Color and finish" aside={finish.name}>
            <SwatchPicker finishIds={product.finishes} value={finish.id} onChange={setFinishId} label="Finish" />
            <p className="mt-3 text-sm text-muted">{finish.material}</p>
          </Step>

          {product.customizable && (
            <Step
              n={nextStep()}
              title="On the card"
              badge="Physical design"
              description={
                perCardSetup
                  ? "Your shared design for every card in the pack. You'll send individual names after checkout."
                  : "What's printed or engraved on the card itself."
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="card-text" label={perCardSetup ? "Company name" : "Name or business name"} hint="Up to 40 characters">
                  <input id="card-text" className="field" maxLength={40} value={text} onChange={(e) => setText(e.target.value)} />
                </Field>
                <Field id="card-subtext" label={perCardSetup ? "Tagline (optional)" : "Title or tagline (optional)"} hint="Up to 40 characters">
                  <input id="card-subtext" className="field" maxLength={40} value={subtext} onChange={(e) => setSubtext(e.target.value)} />
                </Field>
              </div>

              {product.acceptsLogo && (
                <div className="mt-5">
                  <p className="mb-1.5 text-sm font-medium">
                    {artworkRequired ? "Logo or design file" : "Logo (optional)"}
                  </p>
                  {upload.state === "done" || upload.state === "uploading" ? (
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-card p-3 shadow-[0_0_0_1px_var(--line-strong)]">
                      <span className="flex min-w-0 items-center gap-2 text-sm">
                        {upload.state === "done" ? <CheckIcon size={16} className="shrink-0 text-success" /> : <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-line-strong border-t-ink" />}
                        <span className="truncate">{upload.name}</span>
                      </span>
                      <button type="button" onClick={() => setUpload({ state: "idle" })} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-paper-2 hover:text-ink" aria-label="Remove file">
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="logo-upload"
                      className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed bg-card px-4 py-6 text-center transition-colors hover:border-ink ${
                        submitted && !artworkOk ? "border-danger" : "border-line-strong"
                      }`}
                    >
                      <UploadIcon size={20} className="text-muted" />
                      <span className="text-sm font-medium">Choose a file</span>
                      <span className="text-xs text-muted">PNG, JPG, SVG or PDF, up to 10 MB. Stored privately.</span>
                      <input
                        id="logo-upload"
                        type="file"
                        accept=".png,.jpg,.jpeg,.svg,.pdf,image/png,image/jpeg,image/svg+xml,application/pdf"
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
                  {submitted && !artworkOk && upload.state !== "error" && (
                    <p className="mt-1.5 text-xs text-danger" role="alert">
                      Upload your logo or design to continue.
                    </p>
                  )}
                </div>
              )}
            </Step>
          )}

          <Step
            n={nextStep()}
            title="When someone taps"
            badge="Digital destination"
            description={
              perCardSetup
                ? undefined
                : "What the card opens on a phone. We write this to the chip and test it before shipping."
            }
          >
            {perCardSetup ? (
              <div className="flex gap-3 rounded-2xl bg-card p-4 text-sm leading-relaxed text-ink-2 shadow-[0_0_0_1px_var(--line)]">
                <InfoIcon size={18} className="mt-0.5 shrink-0 text-muted" />
                Each card in a team pack gets its own destination. After checkout we&apos;ll email you a short form to
                collect each person&apos;s name and link.
              </div>
            ) : (
              <>
                <DestinationFields value={destination} onChange={setDestination} errors={destErrors} showErrors={submitted} />
                <div className="mt-4 flex gap-3 rounded-2xl bg-paper-2 p-4 text-xs leading-relaxed text-ink-2">
                  <InfoIcon size={16} className="mt-0.5 shrink-0 text-muted" />
                  <span>
                    The chip stores a fixed link. To update what people see later without rewriting the card, point it
                    to a page you can edit, like your own site, a link-in-bio page or a digital business card.
                  </span>
                </div>
              </>
            )}
          </Step>

          <Step n={nextStep()} title="Review">
            <dl className="divide-y divide-line rounded-2xl bg-card text-sm shadow-[0_0_0_1px_var(--line)]">
              <Row label="Card" value={product.name} />
              <Row label="Finish" value={finish.name} />
              {product.customizable && <Row label="On the card" value={[text, subtext].filter(Boolean).join(" · ") || "No text"} />}
              {product.acceptsLogo && <Row label="Artwork" value={upload.state === "done" ? upload.name : "None"} />}
              <Row
                label="Tap opens"
                value={perCardSetup ? "Set per card after checkout" : destValid ? `${destinationLabel(destination.type)}: ${describeDestination(destination)}` : "Not set yet"}
              />
            </dl>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-full bg-card shadow-[0_0_0_1px_var(--line-strong)]" role="group" aria-label="Quantity">
                <button type="button" className="grid h-11 w-11 place-items-center rounded-full hover:bg-paper-2 disabled:opacity-40" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label="Decrease quantity">
                  <MinusIcon size={16} />
                </button>
                <span className="w-8 text-center tabular-nums" aria-live="polite">
                  {quantity}
                </span>
                <button type="button" className="grid h-11 w-11 place-items-center rounded-full hover:bg-paper-2 disabled:opacity-40" onClick={() => setQuantity((q) => Math.min(limits.maxQuantityPerLine, q + 1))} disabled={quantity >= limits.maxQuantityPerLine} aria-label="Increase quantity">
                  <PlusIcon size={16} />
                </button>
              </div>
              <p className="text-lg font-medium tabular-nums">{formatMoney(product.price * quantity)}</p>
            </div>

            {added ? (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/cart" size="lg" className="flex-1">
                  View cart and check out
                </ButtonLink>
                <Button type="button" size="lg" variant="secondary" className="flex-1" onClick={() => setAdded(false)}>
                  Add another
                </Button>
              </div>
            ) : (
              <Button type="submit" size="lg" className="mt-6 w-full" disabled={!product.inStock || uploadBusy}>
                {!product.inStock ? "Sold out" : uploadBusy ? "Uploading…" : "Add to cart"}
              </Button>
            )}
            {submitted && !added && ((!perCardSetup && !destValid) || !artworkOk) && (
              <p className="mt-3 text-sm text-danger" role="alert">
                Check the highlighted fields above.
              </p>
            )}
          </Step>
        </form>
      </div>
    </div>
  );
}

function FinishFromUrl({ product, onFinish }: { product: Product; onFinish: (f: FinishId) => void }) {
  const finish = useSearchParams().get("finish");
  useEffect(() => {
    if (finish && product.finishes.includes(finish as FinishId)) onFinish(finish as FinishId);
  }, [finish, product, onFinish]);
  return null;
}

function Step({
  n,
  title,
  badge,
  aside,
  description,
  children,
}: {
  n: number;
  title: string;
  badge?: string;
  aside?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`step-${n}`}>
      <div className="mb-4 flex items-baseline justify-between gap-3 border-t border-line pt-6">
        <h2 id={`step-${n}`} className="flex items-center gap-3 text-lg font-semibold tracking-tight">
          <span className="font-mono text-xs text-muted">{String(n).padStart(2, "0")}</span>
          {title}
          {badge && <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[0.7rem] font-medium text-accent-ink">{badge}</span>}
        </h2>
        {aside && <span className="text-sm text-muted">{aside}</span>}
      </div>
      {description && <p className="-mt-1 mb-4 text-sm leading-relaxed text-muted">{description}</p>}
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 px-4 py-3">
      <dt className="text-muted">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium">{value}</dd>
    </div>
  );
}
