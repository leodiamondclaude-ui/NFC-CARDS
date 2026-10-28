/**
 * Brand and business configuration.
 *
 * Everything a non-developer is likely to change before launch lives here:
 * the brand name, contact details, shipping rules and discount codes.
 * Starter products (with SAMPLE prices) live in `src/config/products.ts`;
 * once the store is running, products are managed in the admin dashboard.
 */

export const site = {
  name: "TAPCARD",
  /** Short line used in metadata and the footer. */
  tagline: "Smart NFC business cards for people who make connections.",
  description:
    "Premium NFC business cards. Share your contact information, social profiles and professional identity with a single tap.",
  /** Public base URL. Set NEXT_PUBLIC_SITE_URL in production; the example domain is only a placeholder. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://tapcard.example",
  /**
   * Contact details. PLACEHOLDERS: replace with the real inboxes before launch.
   * No address, phone number or legal entity is published until you add one.
   */
  contact: {
    email: "hello@tapcard.example",
    salesEmail: "business@tapcard.example",
  },
  /** Legal business name for policy pages. Leave null until confirmed. */
  legalName: null as string | null,
  /** Add real profile URLs once the accounts exist; the footer hides this when empty. */
  social: [] as { label: string; href: string }[],
  currency: "usd",
  locale: "en-US",
  /**
   * While true, the shop shows a short note that products, prices and
   * specifications are samples. Turn off once the catalog is confirmed.
   */
  sampleCatalogNotice: true,
} as const;

export type ShippingMethodId = "standard" | "express";

export type ShippingMethod = {
  id: ShippingMethodId;
  label: string;
  /** Price in cents. */
  price: number;
  /** Orders whose subtotal (after discount) reaches this amount ship free. */
  freeOver?: number;
  /** Business days in transit, after production. */
  transitDays: [number, number];
};

/** Shipping rules. SAMPLE values: set them to your real carrier rates and lead times. */
export const shipping = {
  methods: [
    { id: "standard", label: "Standard", price: 499, freeOver: 5000, transitDays: [3, 6] },
    { id: "express", label: "Express", price: 1499, transitDays: [1, 2] },
  ] satisfies ShippingMethod[],
  /** Business days to produce a card before it ships. */
  productionDays: { standard: [1, 3], custom: [3, 7] } as Record<"standard" | "custom", [number, number]>,
  countries: ["US", "CA"] as const,
  /** Shown on the returns page. Set to your actual policy. */
  returnsWindowDays: 30,
};

export type DiscountCode = {
  code: string;
  description: string;
  kind: "percent" | "fixed";
  /** Percent (0-100) or cents, depending on kind. */
  value: number;
  minSubtotal?: number;
  active: boolean;
};

/** SAMPLE discount codes for testing the checkout. Replace or remove before launch. */
export const discountCodes: DiscountCode[] = [
  { code: "WELCOME10", description: "10% off your first order", kind: "percent", value: 10, active: true },
];

export const limits = {
  maxQuantityPerLine: 50,
  maxLines: 20,
  /** Customer logo uploads. SVG is not accepted because it can carry scripts. */
  upload: {
    maxBytes: 5 * 1024 * 1024,
    types: { "image/png": "png", "image/jpeg": "jpg", "application/pdf": "pdf" } as Record<string, string>,
    label: "PNG, JPG or PDF, up to 5 MB",
  },
  /** Product photos uploaded by admins. */
  productImage: {
    maxBytes: 8 * 1024 * 1024,
    types: { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" } as Record<string, string>,
  },
};

/**
 * Marketing integrations. Nothing loads unless the matching environment
 * variable is set AND the visitor accepts cookies in the consent banner.
 */
export const analytics = {
  gaId: process.env.NEXT_PUBLIC_GA_ID || null,
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || null,
};
