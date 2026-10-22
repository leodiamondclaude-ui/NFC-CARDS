/**
 * Brand and business configuration.
 *
 * Everything a non-developer is likely to change before launch lives here:
 * the brand name, contact details, shipping rules and discount codes.
 * Product data (including the SAMPLE prices) lives in `src/config/products.ts`.
 */

export const site = {
  name: "TAPFORM",
  /** Short line used in metadata and the footer. */
  tagline: "Programmable NFC cards for people who meet people.",
  description:
    "Premium programmable NFC cards. Share your contact details, website and social profiles with a single tap.",
  /**
   * Public base URL. Set NEXT_PUBLIC_SITE_URL in production; the example
   * domain is only a placeholder.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://tapform.example",
  /**
   * Contact details. These are placeholders: replace them with the real
   * support inbox before launch. No address, phone number or social
   * accounts are published until they exist.
   */
  contact: {
    email: "hello@tapform.example",
    salesEmail: "teams@tapform.example",
  },
  /** Add real profile URLs here once the accounts exist; empty entries are hidden. */
  social: [] as { label: string; href: string }[],
  currency: "usd",
  locale: "en-US",
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

/**
 * Shipping rules. SAMPLE values: adjust to your carrier rates before launch.
 */
export const shipping = {
  methods: [
    {
      id: "standard",
      label: "Standard",
      price: 499,
      freeOver: 5000,
      transitDays: [3, 6],
    },
    {
      id: "express",
      label: "Express",
      price: 1499,
      transitDays: [1, 2],
    },
  ] satisfies ShippingMethod[],
  /** Business days to produce and program a card before it ships. */
  productionDays: { standard: [1, 2], custom: [3, 5] } as Record<
    "standard" | "custom",
    [number, number]
  >,
  countries: ["US", "CA"] as const,
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

/**
 * SAMPLE discount codes for testing the checkout. Replace or remove before
 * launch (or move them to the database; see README).
 */
export const discountCodes: DiscountCode[] = [
  {
    code: "WELCOME10",
    description: "10% off your first order",
    kind: "percent",
    value: 10,
    active: true,
  },
  {
    code: "TEAM25",
    description: "$25 off orders over $150",
    kind: "fixed",
    value: 2500,
    minSubtotal: 15000,
    active: true,
  },
];

export const limits = {
  maxQuantityPerLine: 50,
  maxLines: 20,
  /** Customer logo/design uploads. */
  upload: {
    maxBytes: 10 * 1024 * 1024,
    types: {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/svg+xml": "svg",
      "application/pdf": "pdf",
    } as Record<string, string>,
  },
};
