"use client";

import Image from "next/image";
import { useActionState } from "react";
import { limits } from "@/config/site";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@/components/ui/icons";
import type { ProductImage } from "@/lib/types";
import { removeProductImageAction, uploadProductImageAction, type ImageState } from "../actions";

export function ImageManager({ productId, images }: { productId: string; images: ProductImage[] }) {
  const [state, action, pending] = useActionState(uploadProductImageAction.bind(null, productId), {} as ImageState);
  return (
    <div className="space-y-4">
      {images.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3">
          {images.map((img) => (
            <li key={img.id} className="group relative overflow-hidden rounded-xl bg-paper-2">
              <div className="relative aspect-[4/3]">
                <Image src={img.url} alt={img.alt} fill sizes="160px" className="object-cover" unoptimized={img.url.startsWith("/api/")} />
              </div>
              <form action={removeProductImageAction} className="absolute right-1.5 top-1.5">
                <input type="hidden" name="imageId" value={img.id} />
                <button type="submit" aria-label="Remove photo" className="grid h-8 w-8 place-items-center rounded-full bg-card/90 text-ink-2 shadow hover:text-danger">
                  <TrashIcon size={15} />
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">No photos yet. The store shows a drawn preview of the card in each color until you add photos.</p>
      )}
      <form action={action} className="space-y-3">
        <div>
          <label htmlFor="img-file" className="mb-1 block text-sm font-medium">
            Add a photo
          </label>
          <input id="img-file" name="image" type="file" accept={Object.keys(limits.productImage.types).join(",")} className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:text-paper" />
          <p className="mt-1 text-xs text-muted">PNG, JPG or WebP, up to {limits.productImage.maxBytes / 1024 / 1024} MB.</p>
        </div>
        <div>
          <label htmlFor="img-alt" className="mb-1 block text-sm font-medium">
            Alt text
          </label>
          <input id="img-alt" name="alt" className="field py-2 text-sm" placeholder="Describe the photo for screen readers" />
        </div>
        <Button type="submit" size="sm" variant="secondary" disabled={pending}>
          {pending ? "Uploading…" : "Upload photo"}
        </Button>
        {state.message && (
          <p role={state.ok ? "status" : "alert"} className={`text-sm ${state.ok ? "text-success" : "text-danger"}`}>
            {state.message}
          </p>
        )}
      </form>
    </div>
  );
}
