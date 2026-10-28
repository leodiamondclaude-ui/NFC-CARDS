/** Shared domain types used by the storefront, the server and the admin. */

export type FinishId = "black" | "white" | "metallic" | "navy";

export type Category = "cards" | "custom" | "business";

export type Variant = {
  id: string;
  /** Customer-facing color name, e.g. "Black". */
  name: string;
  /** Visual style used for the CSS product mockup. */
  finish: FinishId;
  sku: string;
  /** Units in stock. null means stock isn't tracked for this variant. */
  inventory: number | null;
  available: boolean;
};

export type ProductImage = { id: string; url: string; alt: string };

/** Customization fields a product can offer. Only enable fields you can fulfill. */
export type CustomField = "printedName" | "jobTitle" | "company" | "profileUrl" | "logo";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  shortDescription: string;
  description: string;
  /** Price in cents. */
  price: number;
  /** Show the price as "From $x". */
  startingAt: boolean;
  /** Cards included per unit sold (for packs). */
  unitsPerPack: number;
  variants: Variant[];
  customFields: CustomField[];
  /** Show a "Request a bulk quote" button. */
  quoteCta: boolean;
  featured: boolean;
  /** Merchandising order for "Featured" sorting (lower first). */
  sortOrder: number;
  /** false hides the product from the shop and blocks checkout. */
  active: boolean;
  images: ProductImage[];
  specs: { label: string; value: string }[];
  faq: { q: string; a: string }[];
  updatedAt: string;
};

export type Customization = {
  printedName?: string;
  jobTitle?: string;
  company?: string;
  profileUrl?: string;
  /** Opaque id of a privately stored upload (never a public URL). */
  logoUploadId?: string;
  logoName?: string;
};

export type CartLine = {
  /** Stable key for this exact configuration. */
  key: string;
  slug: string;
  variantId: string;
  quantity: number;
  customization?: Customization;
};
