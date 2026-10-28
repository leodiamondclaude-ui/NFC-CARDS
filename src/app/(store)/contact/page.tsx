import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import { PageHero } from "@/components/ui/section";
import { ContactForm } from "@/components/forms/contact-form";
import { BuildingIcon, MailIcon, PackageIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Contact",
  description: `Questions about an order, a product or a team purchase? Contact ${site.name}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Get in touch." body="Questions about a product, an order or a team purchase? Send us a message." />
      <section className="container-page grid gap-12 py-20 lg:grid-cols-[1fr_1.5fr]">
        <div className="space-y-4">
          <a href={`mailto:${site.contact.email}`} className="block rounded-[var(--radius-card)] border border-line bg-card p-6 transition-colors hover:border-ink">
            <MailIcon className="text-accent" />
            <h2 className="mt-4 font-semibold">Orders and support</h2>
            <p className="mt-1 text-sm text-muted">{site.contact.email}</p>
          </a>
          <Link href="/business#quote" className="block rounded-[var(--radius-card)] border border-line bg-card p-6 transition-colors hover:border-ink">
            <BuildingIcon className="text-accent" />
            <h2 className="mt-4 font-semibold">Team and bulk orders</h2>
            <p className="mt-1 text-sm text-muted">Request a quote, or email {site.contact.salesEmail}</p>
          </Link>
          <Link href="/orders" className="block rounded-[var(--radius-card)] border border-line bg-card p-6 transition-colors hover:border-ink">
            <PackageIcon className="text-accent" />
            <h2 className="mt-4 font-semibold">Track an order</h2>
            <p className="mt-1 text-sm text-muted">Look up an order with its number and your email.</p>
          </Link>
        </div>
        <ContactForm />
      </section>
    </>
  );
}
