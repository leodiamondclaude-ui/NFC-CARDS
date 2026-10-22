import type { Metadata } from "next";
import { site } from "@/config/site";
import { LegalPage } from "@/components/ui/legal-page";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" intro={`How ${site.name} collects and uses your information.`}>
      <h2>What we collect</h2>
      <ul>
        <li>Order details: your email, shipping address, items and card configuration.</li>
        <li>Card content: the text, artwork and destination you choose, so we can produce and program your card.</li>
        <li>Quote requests: the details you send through the business form.</li>
      </ul>
      <h2>Payments</h2>
      <p>
        Payments are processed by Stripe. Your card number and security code go directly to Stripe and are never
        stored on our servers.
      </p>
      <h2>Uploaded artwork</h2>
      <p>
        Logos and design files are stored privately and are only accessible to our production team for fulfilling
        your order. They are never published.
      </p>
      <h2>How we use it</h2>
      <p>
        We use your information to make, program and ship your order, to send order and shipping emails, and to
        answer your questions. We don&apos;t sell your personal information.
      </p>
      <h2>Your cart</h2>
      <p>Your cart is saved in your browser&apos;s local storage so it&apos;s still there when you come back.</p>
      <h2>Contact</h2>
      <p>For privacy requests, including access or deletion, email {site.contact.email}.</p>
    </LegalPage>
  );
}
