import type { Metadata } from "next";
import { shipping, site } from "@/config/site";
import { formatMoney } from "@/lib/money";
import { LegalPage } from "@/components/ui/legal-page";

export const metadata: Metadata = { title: "Shipping policy" };

const countryNames: Record<string, string> = { US: "the United States", CA: "Canada" };

export default function ShippingPage() {
  return (
    <LegalPage title="Shipping policy" intro="How long production and delivery take, and what shipping costs.">
      <h2>Where we ship</h2>
      <p>We currently ship to {shipping.countries.map((c) => countryNames[c] ?? c).join(" and ")}.</p>

      <h2>Production time</h2>
      <p>
        Every card is programmed and tested before it ships. Standard cards are produced in{" "}
        {shipping.productionDays.standard[0]}–{shipping.productionDays.standard[1]} business days. Custom and
        personalized cards take {shipping.productionDays.custom[0]}–{shipping.productionDays.custom[1]} business days
        after you approve the digital proof.
      </p>

      <h2>Shipping methods</h2>
      <ul>
        {shipping.methods.map((m) => (
          <li key={m.id}>
            <strong>{m.label}</strong>: {formatMoney(m.price)}
            {m.freeOver !== undefined ? `, free on orders of ${formatMoney(m.freeOver)} or more after discounts` : ""}.
            Usually {m.transitDays[0]}–{m.transitDays[1]} business days in transit.
          </li>
        ))}
      </ul>
      <p>Delivery estimates are not guarantees. Carrier delays can happen, especially around holidays.</p>

      <h2>Tracking</h2>
      <p>We email a tracking link when your order ships.</p>

      <h2>Problems with delivery</h2>
      <p>
        If your package is lost or arrives damaged, email {site.contact.email} with your order number and we&apos;ll
        make it right.
      </p>
    </LegalPage>
  );
}
