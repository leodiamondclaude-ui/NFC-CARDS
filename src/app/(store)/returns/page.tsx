import type { Metadata } from "next";
import { shipping, site } from "@/config/site";
import { LegalPage } from "@/components/ui/legal-page";

export const metadata: Metadata = { title: "Returns Policy", alternates: { canonical: "/returns" } };

export default function ReturnsPage() {
  return (
    <LegalPage title="Returns and refunds" intro="What you can return, and how.">
      <h2>Standard cards</h2>
      <p>
        Unused, non-personalized cards can be returned within {shipping.returnsWindowDays} days of
        delivery for a refund of the item price.
      </p>
      <h2>Personalized and custom cards</h2>
      <p>
        Cards printed with your name, logo or design are made to order, so we can&apos;t accept returns for
        a change of mind. If a card arrives damaged, has a production defect, or doesn&apos;t read on a compatible
        phone, contact us and we&apos;ll replace or refund it.
      </p>
      <h2>How to start a return</h2>
      <p>
        Email {site.contact.email} with your order number and a short description. We&apos;ll reply with return
        instructions. Refunds go back to the original payment method once we receive the item.
      </p>
      <h2>Compatibility</h2>
      <p>
        NFC support depends on the phone. If your card works on other compatible phones but not on a particular
        device, that isn&apos;t a defect, but contact us and we&apos;ll help troubleshoot.
      </p>
    </LegalPage>
  );
}
