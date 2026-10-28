import { z } from "zod";
import { limits, shipping } from "@/config/site";
import { normalizeUrl } from "@/lib/destinations";

/** Shared validation schemas. The server re-validates everything it receives. */

const text = (max: number) => z.string().trim().max(max);
/** Plain text without control characters or angle brackets (rendered as text anyway; this keeps data clean). */
const plain = (max: number, label: string) =>
  text(max).refine((s) => !/[<>\u0000-\u001f]/.test(s), `${label} contains characters we can't print.`);

export const customizationSchema = z.object({
  printedName: plain(40, "Name").optional(),
  jobTitle: plain(40, "Job title").optional(),
  company: plain(60, "Company").optional(),
  profileUrl: text(2000)
    .refine((v) => !v || normalizeUrl(v) !== null, "Enter a valid web address, like yourname.com.")
    .optional(),
  logoUploadId: z
    .string()
    .regex(/^[a-f0-9]{32}\.(png|jpg|pdf)$/)
    .optional(),
  logoName: text(200).optional(),
});

export const cartLineSchema = z.object({
  key: z.string().max(4000),
  slug: z.string().max(80),
  variantId: z.string().max(80),
  quantity: z.number().int().min(1).max(limits.maxQuantityPerLine),
  customization: customizationSchema.optional(),
});

export const addressSchema = z.object({
  name: text(100).min(2, "Enter the recipient's name."),
  line1: text(200).min(3, "Enter a street address."),
  line2: text(200).optional(),
  city: text(100).min(2, "Enter a city."),
  region: text(100).min(2, "Enter a state or province."),
  postalCode: text(20).min(3, "Enter a postal code."),
  country: z.enum(shipping.countries),
});

export const contactSchema = z.object({
  email: z.email("Enter a valid email address.").max(200),
  phone: text(30)
    .refine((v) => !v || /^\+?[0-9 ()-]{6,20}$/.test(v), "Enter a valid phone number.")
    .optional(),
});

export const checkoutFormSchema = z.object({
  contact: contactSchema,
  address: addressSchema,
  shippingMethod: z.enum(["standard", "express"]),
});
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export const checkoutSchema = checkoutFormSchema.extend({
  discountCode: text(40).optional(),
  lines: z.array(cartLineSchema).min(1, "Your cart is empty.").max(limits.maxLines),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const inquiryTypes = [
  { id: "bulk", label: "Bulk order" },
  { id: "branding", label: "Custom branding" },
  { id: "team", label: "Team purchasing" },
  { id: "other", label: "Something else" },
] as const;

export const quoteSchema = z.object({
  name: plain(100, "Name").min(2, "Enter your name."),
  email: z.email("Enter a valid business email.").max(200),
  company: plain(120, "Company").min(1, "Enter your company name."),
  quantity: z.coerce
    .number({ error: "Enter an estimated quantity." })
    .int("Use a whole number.")
    .min(1, "Enter at least 1.")
    .max(100000, "For orders over 100,000 cards, tell us in the details."),
  inquiryType: z.enum(inquiryTypes.map((t) => t.id) as ["bulk", "branding", "team", "other"]),
  details: text(2000).min(10, "Tell us a little about your project (at least 10 characters)."),
  /** Honeypot field: real people leave it empty. */
  website: z.string().max(200).optional(),
});
export type QuoteInput = z.input<typeof quoteSchema>;

export const contactMessageSchema = z.object({
  name: plain(100, "Name").min(2, "Enter your name."),
  email: z.email("Enter a valid email address.").max(200),
  orderNumber: text(20).optional(),
  message: text(3000).min(10, "Write a message of at least 10 characters."),
  website: z.string().max(200).optional(),
});
export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

export const orderLookupSchema = z.object({
  number: text(20).regex(/^HS-[A-F0-9]{8}$/i, "Order numbers look like HS-1A2B3C4D."),
  email: z.email("Enter the email used at checkout."),
});
