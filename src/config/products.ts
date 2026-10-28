import type { FinishId, Product } from "@/lib/types";

/**
 * Finish styles for the CSS product mockups. These only control how a card
 * is drawn on screen; they make no claim about materials.
 */
export type Finish = { id: FinishId; surface: string; ink: string; swatch: string };

export const finishes: Record<FinishId, Finish> = {
  black: {
    id: "black",
    surface: "linear-gradient(135deg, #1c1c21 0%, #0c0c0f 60%, #1a1a1f 100%)",
    ink: "#f4f4f6",
    swatch: "#141418",
  },
  white: {
    id: "white",
    surface: "linear-gradient(135deg, #ffffff 0%, #f1f1f4 55%, #fafafb 100%)",
    ink: "#111114",
    swatch: "#f3f3f5",
  },
  metallic: {
    id: "metallic",
    surface:
      "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, rgba(0,0,0,0.035) 1px 3px), linear-gradient(135deg, #dcdde1 0%, #a9acb3 45%, #d6d8dc 70%, #9b9ea5 100%)",
    ink: "#16171a",
    swatch: "#b9bcc2",
  },
  navy: {
    id: "navy",
    surface: "linear-gradient(135deg, #1d2a5c 0%, #121a3d 60%, #1b2756 100%)",
    ink: "#eef1ff",
    swatch: "#18224a",
  },
};

export const categories: { id: Product["category"]; label: string }[] = [
  { id: "cards", label: "NFC cards" },
  { id: "custom", label: "Custom" },
  { id: "business", label: "Business" },
];

const TBC = "To be confirmed";

/** Specs that hold for passive NFC cards in general. Product-specific details stay "To be confirmed". */
const commonSpecs = [
  { label: "Format", value: "Standard business card size" },
  { label: "Power", value: "None. NFC cards are passive and powered by the phone when tapped" },
  { label: "Works with", value: "NFC-enabled smartphones. Support and tap position vary by model" },
  { label: "Chip", value: TBC },
  { label: "Material and finish", value: TBC },
];

const commonFaq = [
  {
    q: "Do the people I share with need an app?",
    a: "No. Most NFC-enabled phones open a link from the card in the browser without an app. Some older phones need NFC switched on first.",
  },
  {
    q: "What does my card open?",
    a: "The web address you give us, such as your website or a digital profile page. If it points to a page you can edit, you can update what people see without changing the card.",
  },
];

/**
 * STARTER CATALOG with SAMPLE prices (in cents). On first run these are
 * copied into the database (or local dev store); after that, edit products
 * in the admin dashboard. Confirm prices, specs and options before launch.
 */
export const starterProducts: Omit<Product, "updatedAt">[] = [
  {
    id: "prod_essential",
    slug: "essential-nfc-card",
    name: "Essential NFC Card",
    category: "cards",
    shortDescription: "A clean, professional NFC card for everyday networking.",
    description:
      "A clean, professional NFC card for everyday networking. Tap it to a compatible phone to open your website or digital profile. Add the web address it should open when you order.",
    price: 1999,
    startingAt: false,
    unitsPerPack: 1,
    variants: [
      { id: "var_essential_black", name: "Black", finish: "black", sku: "ESS-BLK", inventory: null, available: true },
      { id: "var_essential_white", name: "White", finish: "white", sku: "ESS-WHT", inventory: null, available: true },
    ],
    customFields: ["profileUrl"],
    quoteCta: false,
    featured: true,
    sortOrder: 1,
    active: true,
    images: [],
    specs: commonSpecs,
    faq: commonFaq,
  },
  {
    id: "prod_premium",
    slug: "premium-nfc-card",
    name: "Premium NFC Card",
    category: "cards",
    shortDescription: "A refined NFC card for professionals who want a premium finish.",
    description:
      "A refined NFC card for professionals who want a premium finish. The same simple tap-to-share experience, with a more elevated look in your wallet and in your hand.",
    price: 2999,
    startingAt: false,
    unitsPerPack: 1,
    variants: [
      { id: "var_premium_black", name: "Black", finish: "black", sku: "PRM-BLK", inventory: null, available: true },
      { id: "var_premium_metallic", name: "Metallic", finish: "metallic", sku: "PRM-MET", inventory: null, available: true },
    ],
    customFields: ["printedName", "profileUrl"],
    quoteCta: false,
    featured: true,
    sortOrder: 2,
    active: true,
    images: [],
    specs: commonSpecs,
    faq: commonFaq,
  },
  {
    id: "prod_custom",
    slug: "custom-nfc-card",
    name: "Custom NFC Card",
    category: "custom",
    shortDescription: "A personalized NFC card designed around your professional identity.",
    description:
      "A personalized NFC card designed around your professional identity. Add your name, title, company and logo, and choose what opens when someone taps. Your details are saved with your order for production.",
    price: 3999,
    startingAt: true,
    unitsPerPack: 1,
    variants: [
      { id: "var_custom_black", name: "Black", finish: "black", sku: "CUS-BLK", inventory: null, available: true },
      { id: "var_custom_white", name: "White", finish: "white", sku: "CUS-WHT", inventory: null, available: true },
    ],
    customFields: ["printedName", "jobTitle", "company", "profileUrl", "logo"],
    quoteCta: false,
    featured: true,
    sortOrder: 3,
    active: true,
    images: [],
    specs: [...commonSpecs, { label: "Logo files", value: "PNG, JPG or PDF, up to 5 MB" }],
    faq: [
      ...commonFaq,
      {
        q: "Which logo files can I upload?",
        a: "PNG, JPG or PDF files up to 5 MB. A high-resolution file gives the best result.",
      },
    ],
  },
  {
    id: "prod_business",
    slug: "business-pack",
    name: "Business Pack",
    category: "business",
    shortDescription: "A bulk package of NFC cards for teams and organizations.",
    description:
      "A bulk package of NFC cards for teams and organizations, with one consistent design. Add your company name and logo when you order. For larger teams, per-person details or custom branding, request a quote.",
    price: 9999,
    startingAt: true,
    unitsPerPack: 5,
    variants: [
      { id: "var_business_black", name: "Black", finish: "black", sku: "BIZ-BLK", inventory: null, available: true },
      { id: "var_business_white", name: "White", finish: "white", sku: "BIZ-WHT", inventory: null, available: true },
    ],
    customFields: ["company", "logo"],
    quoteCta: true,
    featured: true,
    sortOrder: 4,
    active: true,
    images: [],
    specs: [{ label: "Cards per pack", value: "5 (sample value, configurable)" }, ...commonSpecs],
    faq: [
      {
        q: "How do I send each person's details?",
        a: "Add your company details when you order. For per-person details across a larger team, request a quote and we'll arrange the details with you.",
      },
      {
        q: "Do you offer volume pricing?",
        a: "Yes. Request a quote with your estimated quantity and we'll reply with options.",
      },
    ],
  },
];
