import Image from "next/image";
import { CardArt, type CardView } from "@/components/card/card-art";
import { finishOf } from "@/lib/catalog";
import type { Product, Variant } from "@/lib/types";

/**
 * Product image: an uploaded photo when the product has one, otherwise a
 * CSS mockup in the selected color. Packs show a small stack of cards.
 */
export function ProductVisual({
  product,
  variant,
  view = "front",
  text,
  subtext,
  logoUrl,
  photoIndex = 0,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority = false,
  className = "",
}: {
  product: Product;
  variant: Variant;
  view?: CardView;
  text?: string;
  subtext?: string;
  logoUrl?: string;
  photoIndex?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const photo = product.images[photoIndex];
  if (photo && view === "front" && !text && !logoUrl) {
    return (
      <div className={`relative aspect-[4/3] w-full overflow-hidden ${className}`}>
        <Image src={photo.url} alt={photo.alt || `${product.name} in ${variant.name}`} fill sizes={sizes} priority={priority} className="object-cover" unoptimized={photo.url.startsWith("/api/")} />
      </div>
    );
  }
  const finish = finishOf(variant);
  const label = `${product.name} in ${variant.name}`;
  if (product.unitsPerPack > 1 && view === "front") {
    return (
      <div role="img" aria-label={`${label}, pack of ${product.unitsPerPack}`} className={`relative grid aspect-[4/3] w-full place-items-center ${className}`}>
        <div className="absolute w-[62%] -translate-x-[9%] -translate-y-[12%] rotate-[-8deg] opacity-90">
          <CardArt finish={finish} text="Jordan Lee" subtext="Account Executive" shadow />
        </div>
        <div className="absolute w-[62%] translate-x-[9%] translate-y-[10%] rotate-[4deg]">
          <CardArt finish={finish} text={text || "Priya Shah"} subtext={subtext || "Head of Sales"} logoUrl={logoUrl} />
        </div>
      </div>
    );
  }
  return (
    <div role="img" aria-label={label} className={`grid aspect-[4/3] w-full place-items-center px-[14%] ${className}`}>
      <CardArt finish={finish} view={view} text={text} subtext={subtext} logoUrl={logoUrl} />
    </div>
  );
}
