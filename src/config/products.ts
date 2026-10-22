/**
 * Product catalog.
 *
 * ⚠️ SAMPLE PRICES: every `price` below is a placeholder (in cents) chosen for
 * the initial build. Confirm pricing, chip specifications and stock with your
 * supplier before launch. The server always reads prices from this file (or
 * the database, once connected), never from the browser.
 */

export const SAMPLE_PRICES = true;

export type FinishId =
  | "matte-black"
  | "pearl-white"
  | "signal"
  | "brushed-steel"
  | "black-metal"
  | "champagne"
  | "frost"
  | "bamboo";

export type Finish = {
  id: FinishId;
  name: string;
  /** CSS background for the card face. */
  surface: string;
  /** Text and logo color on the card. */
  ink: string;
  /** Swatch color for selectors. */
  swatch: string;
  material: string;
};

export const finishes: Record<FinishId, Finish> = {
  "matte-black": {
    id: "matte-black",
    name: "Matte Black",
    surface: "linear-gradient(135deg, #1b1b1d 0%, #0d0d0e 60%, #19191b 100%)",
    ink: "#f4f2ee",
    swatch: "#141415",
    material: "PVC",
  },
  "pearl-white": {
    id: "pearl-white",
    name: "Pearl White",
    surface: "linear-gradient(135deg, #fbfaf7 0%, #efede7 55%, #f8f6f1 100%)",
    ink: "#141415",
    swatch: "#f2f0ea",
    material: "PVC",
  },
  signal: {
    id: "signal",
    name: "Signal Orange",
    surface: "linear-gradient(135deg, #ff6a2b 0%, #f24c0c 60%, #ff5d1d 100%)",
    ink: "#140803",
    swatch: "#ff5714",
    material: "PVC",
  },
  "brushed-steel": {
    id: "brushed-steel",
    name: "Brushed Steel",
    surface:
      "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, rgba(0,0,0,0.035) 1px 3px), linear-gradient(135deg, #d9dadc 0%, #a9abaf 45%, #d4d5d8 70%, #9a9ca0 100%)",
    ink: "#18191b",
    swatch: "#b7b9bc",
    material: "Stainless steel",
  },
  "black-metal": {
    id: "black-metal",
    name: "Black Metal",
    surface:
      "repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0 1px, rgba(0,0,0,0.05) 1px 3px), linear-gradient(135deg, #2c2d30 0%, #111214 55%, #26272a 100%)",
    ink: "#d9c9a3",
    swatch: "#1f2022",
    material: "Stainless steel, PVD coated",
  },
  champagne: {
    id: "champagne",
    name: "Champagne Gold",
    surface:
      "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, rgba(0,0,0,0.03) 1px 3px), linear-gradient(135deg, #e8d7b0 0%, #c4a874 50%, #e2cfa2 75%, #b89a62 100%)",
    ink: "#2a2112",
    swatch: "#d4bd8a",
    material: "Stainless steel, PVD coated",
  },
  frost: {
    id: "frost",
    name: "Frosted Clear",
    surface:
      "linear-gradient(135deg, rgba(235,238,240,0.92) 0%, rgba(214,220,224,0.88) 100%)",
    ink: "#1a1c1e",
    swatch: "#dfe4e7",
    material: "Frosted PVC",
  },
  bamboo: {
    id: "bamboo",
    name: "Natural Bamboo",
    surface:
      "repeating-linear-gradient(100deg, rgba(120,80,30,0.07) 0 2px, transparent 2px 9px), linear-gradient(135deg, #e3c79a 0%, #cfae7a 60%, #dcbd8b 100%)",
    ink: "#3a2812",
    swatch: "#d6b886",
    material: "Bamboo veneer",
  },
};

export type Category = "everyday" | "metal" | "custom" | "teams" | "accessories";

export const categories: { id: Category; label: string }[] = [
  { id: "everyday", label: "Everyday" },
  { id: "metal", label: "Metal" },
  { id: "custom", label: "Custom" },
  { id: "teams", label: "Teams" },
  { id: "accessories", label: "Accessories" },
];

export type ProductForm = "card" | "fob";

export type Product = {
  slug: string;
  name: string;
  category: Category;
  form: ProductForm;
  /** Price in cents. SAMPLE value. */
  price: number;
  /** Number of physical items per unit sold (for packs). */
  unitsPerPack: number;
  tagline: string;
  description: string;
  highlights: string[];
  finishes: FinishId[];
  /** Whether customers can add text/logo to the physical card. */
  customizable: boolean;
  /** Whether a logo or design file can be uploaded. */
  acceptsLogo: boolean;
  /** Merchandising rank used for "Popular" sorting (lower is first). Placeholder until real sales data exists. */
  popularity: number;
  inStock: boolean;
  featured: boolean;
  specs: { label: string; value: string }[];
};

const commonSpecs = {
  chip: { label: "Chip", value: "NTAG 216 (888 bytes user memory)" },
  battery: { label: "Power", value: "None needed. Powered by the phone's NFC field." },
  range: { label: "Read range", value: "About 1 to 4 cm, depending on the phone" },
  compat: {
    label: "Compatibility",
    value: "NFC-enabled iPhone (XS and newer read tags in the background) and most NFC-enabled Android phones",
  },
};

export const products: Product[] = [
  {
    slug: "classic",
    name: "Classic NFC Card",
    category: "everyday",
    form: "card",
    price: 1999,
    unitsPerPack: 1,
    tagline: "The everyday smart card.",
    description:
      "A durable, standard-size PVC card with an embedded NFC chip. Tap it to any compatible phone to open your website, profile or contact page. Programmed by us before it ships, ready to use out of the box.",
    highlights: [
      "Standard wallet size",
      "Programmed with your destination before shipping",
      "Rewritable chip, can be locked on request",
    ],
    finishes: ["matte-black", "pearl-white", "signal"],
    customizable: true,
    acceptsLogo: false,
    popularity: 1,
    inStock: true,
    featured: true,
    specs: [
      { label: "Material", value: "Matte-laminated PVC" },
      { label: "Size", value: "85.6 × 54 mm (ISO ID-1), 0.8 mm thick" },
      commonSpecs.chip,
      commonSpecs.battery,
      commonSpecs.range,
      commonSpecs.compat,
      { label: "Personalization", value: "Name or short text, printed" },
    ],
  },
  {
    slug: "premium",
    name: "Premium NFC Card",
    category: "metal",
    form: "card",
    price: 2999,
    unitsPerPack: 1,
    tagline: "Stainless steel, laser-engraved.",
    description:
      "A weighty stainless steel card with a laser-engraved name and a precision-inlaid NFC module tuned to read reliably through metal. Built to be the last business card you hand out.",
    highlights: [
      "Stainless steel body with a brushed or PVD finish",
      "Laser-engraved name and title",
      "NFC inlay engineered for metal cards",
    ],
    finishes: ["brushed-steel", "black-metal", "champagne"],
    customizable: true,
    acceptsLogo: true,
    popularity: 2,
    inStock: true,
    featured: true,
    specs: [
      { label: "Material", value: "Stainless steel with NFC inlay" },
      { label: "Size", value: "85.6 × 54 mm, 0.8 mm thick, about 18 g" },
      commonSpecs.chip,
      commonSpecs.battery,
      { label: "Read range", value: "About 1 to 3 cm. Tap the inlay side to the top of the phone" },
      commonSpecs.compat,
      { label: "Personalization", value: "Laser engraving: name, title, simple logo" },
    ],
  },
  {
    slug: "custom",
    name: "Custom NFC Card",
    category: "custom",
    form: "card",
    price: 3499,
    unitsPerPack: 1,
    tagline: "Your design, edge to edge.",
    description:
      "Upload your logo or a full card design and we print it in full color on both sides. A proof is sent for approval before production, so what you see is what you get.",
    highlights: [
      "Full-color print, front and back",
      "Upload a logo or a print-ready design",
      "Digital proof before production",
    ],
    finishes: ["pearl-white", "matte-black", "frost"],
    customizable: true,
    acceptsLogo: true,
    popularity: 3,
    inStock: true,
    featured: true,
    specs: [
      { label: "Material", value: "PVC, matte or frosted laminate" },
      { label: "Size", value: "85.6 × 54 mm (ISO ID-1), 0.8 mm thick" },
      { label: "Print", value: "Full color CMYK, both sides" },
      { label: "Artwork", value: "PNG, JPG, SVG or PDF up to 10 MB" },
      commonSpecs.chip,
      commonSpecs.battery,
      commonSpecs.compat,
    ],
  },
  {
    slug: "team-pack",
    name: "Business Team Pack",
    category: "teams",
    form: "card",
    price: 9999,
    unitsPerPack: 5,
    tagline: "Five branded cards, one consistent look.",
    description:
      "Five custom-printed cards with your company branding, each programmed with its own destination. Send us the list of names and links after checkout. Need 25 or more? Request a quote for volume pricing.",
    highlights: [
      "5 custom cards per pack",
      "Individual names and destinations per card",
      "Volume pricing available from 25 cards",
    ],
    finishes: ["pearl-white", "matte-black", "frost"],
    customizable: true,
    acceptsLogo: true,
    popularity: 4,
    inStock: true,
    featured: true,
    specs: [
      { label: "Contents", value: "5 custom-printed NFC cards" },
      { label: "Material", value: "PVC, matte or frosted laminate" },
      { label: "Print", value: "Full color, both sides, shared design" },
      commonSpecs.chip,
      commonSpecs.compat,
      { label: "Per-card setup", value: "Names and destinations collected after checkout" },
    ],
  },
  {
    slug: "bamboo",
    name: "Bamboo NFC Card",
    category: "everyday",
    form: "card",
    price: 2499,
    unitsPerPack: 1,
    tagline: "Natural material, laser-etched.",
    description:
      "A lightweight card faced in natural bamboo veneer with your name laser-etched into the grain. Each card's grain is slightly different.",
    highlights: [
      "Bamboo veneer over a PVC core",
      "Laser-etched name",
      "Lightweight and wallet friendly",
    ],
    finishes: ["bamboo"],
    customizable: true,
    acceptsLogo: true,
    popularity: 5,
    inStock: true,
    featured: false,
    specs: [
      { label: "Material", value: "Bamboo veneer, PVC core" },
      { label: "Size", value: "85.6 × 54 mm, about 1 mm thick" },
      commonSpecs.chip,
      commonSpecs.battery,
      commonSpecs.compat,
      { label: "Personalization", value: "Laser etching: name, title, simple logo" },
    ],
  },
  {
    slug: "key-tag",
    name: "NFC Key Tag",
    category: "accessories",
    form: "fob",
    price: 1499,
    unitsPerPack: 1,
    tagline: "Your link, on your keys.",
    description:
      "A compact epoxy key tag with the same NFC chip as our cards. Handy for a menu, a review page or a Wi-Fi landing page at the front desk.",
    highlights: ["Water-resistant epoxy", "Fits any key ring", "Same chip as our cards"],
    finishes: ["matte-black", "pearl-white", "signal"],
    customizable: false,
    acceptsLogo: false,
    popularity: 6,
    inStock: true,
    featured: false,
    specs: [
      { label: "Material", value: "Epoxy over PVC, steel ring" },
      { label: "Size", value: "About 40 × 30 mm" },
      commonSpecs.chip,
      commonSpecs.battery,
      commonSpecs.compat,
    ],
  },
];
