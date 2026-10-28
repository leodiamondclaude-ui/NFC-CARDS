import type { Metadata } from "next";
import { site } from "@/config/site";
import { LegalPage } from "@/components/ui/legal-page";

export const metadata: Metadata = { title: "Terms of Service", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service" intro={`The terms that apply when you shop with ${site.name}.`}>
      <h2>Orders</h2>
      <p>
        An order is accepted once payment is confirmed. We may cancel and refund an order if an item is unavailable or
        a price was listed in error.
      </p>
      <h2>Your content</h2>
      <p>
        You confirm you have the right to use any names, logos, artwork and links you submit, and that they don&apos;t
        infringe anyone else&apos;s rights. We may decline content that is unlawful or misleading.
      </p>
      <h2>Card destinations</h2>
      <p>
        Your card opens the destination you choose. We aren&apos;t responsible for third-party pages, and a fixed link
        can&apos;t be redirected unless the destination itself supports it or the card is rewritten.
      </p>
      <h2>Compatibility</h2>
      <p>
        NFC behavior varies by phone model, operating system and settings, so we can&apos;t guarantee a card works
        with every device.
      </p>
      <h2>Returns</h2>
      <p>See our returns policy for what can be returned and how.</p>
      <h2>Contact</h2>
      <p>Questions about these terms: {site.contact.email}.</p>
    </LegalPage>
  );
}
