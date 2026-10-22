import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import { PageHero } from "@/components/ui/section";
import { MailIcon, BuildingIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Get in touch." body="We usually reply within one business day." />
      <section className="container-page grid gap-4 py-20 md:grid-cols-2">
        <a href={`mailto:${site.contact.email}`} className="group rounded-[var(--radius-card)] bg-card p-8 shadow-[0_0_0_1px_var(--line)] transition-shadow hover:shadow-[0_0_0_1px_var(--ink)]">
          <MailIcon className="text-accent" />
          <h2 className="mt-6 text-lg font-semibold">Orders and support</h2>
          <p className="mt-2 text-muted">{site.contact.email}</p>
        </a>
        <Link href="/business#quote" className="rounded-[var(--radius-card)] bg-card p-8 shadow-[0_0_0_1px_var(--line)] transition-shadow hover:shadow-[0_0_0_1px_var(--ink)]">
          <BuildingIcon className="text-accent" />
          <h2 className="mt-6 text-lg font-semibold">Team and bulk orders</h2>
          <p className="mt-2 text-muted">Request a quote, or email {site.contact.salesEmail}</p>
        </Link>
      </section>
    </>
  );
}
