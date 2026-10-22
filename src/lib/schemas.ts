import { z } from "zod";
import { limits, shipping } from "@/config/site";
import { socialPlatforms } from "@/lib/destinations";

/** Server-side input schemas. Never trust shapes or prices from the client. */

const text = (max: number) => z.string().trim().max(max);

export const destinationSchema = z.discriminatedUnion("type", [
  z.object({ type: z.enum(["website", "business-card", "link-in-bio"]), url: text(2000) }),
  z.object({
    type: z.literal("social"),
    platform: z.enum(Object.keys(socialPlatforms) as [keyof typeof socialPlatforms]),
    handle: text(60),
  }),
  z.object({
    type: z.literal("contact"),
    name: text(80),
    phone: text(20).optional(),
    email: text(120).optional(),
    company: text(80).optional(),
  }),
]);

export const cartLineSchema = z.object({
  key: z.string().max(4000),
  slug: z.string().max(60),
  finishId: z.string().max(60),
  quantity: z.number().int().min(1).max(limits.maxQuantityPerLine),
  customization: z
    .object({
      text: text(40).optional(),
      subtext: text(40).optional(),
      uploadId: z
        .string()
        .regex(/^[a-f0-9]{32}\.(png|jpg|svg|pdf)$/)
        .optional(),
      uploadName: text(200).optional(),
    })
    .optional(),
  destination: destinationSchema.optional(),
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

export const checkoutSchema = z.object({
  email: z.email("Enter a valid email address.").max(200),
  address: addressSchema,
  shippingMethod: z.enum(["standard", "express"]),
  discountCode: text(40).optional(),
  lines: z.array(cartLineSchema).min(1, "Your cart is empty.").max(limits.maxLines),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const quoteSchema = z.object({
  name: text(100).min(2, "Enter your name."),
  email: z.email("Enter a valid email address.").max(200),
  company: text(120).min(1, "Enter your company name."),
  quantity: z.coerce.number().int().min(10, "Bulk orders start at 10 cards.").max(100000),
  timeline: z.enum(["asap", "month", "quarter", "exploring"]),
  message: text(2000).optional(),
});
