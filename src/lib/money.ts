import { site } from "@/config/site";

const formatter = new Intl.NumberFormat(site.locale, {
  style: "currency",
  currency: site.currency.toUpperCase(),
});

/** Formats an amount in cents. */
export function formatMoney(cents: number): string {
  return formatter.format(cents / 100);
}
