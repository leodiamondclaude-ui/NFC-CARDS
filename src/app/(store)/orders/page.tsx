import type { Metadata } from "next";
import { PageHero } from "@/components/ui/section";
import { LookupForm } from "./lookup-form";

export const metadata: Metadata = { title: "Track an order", robots: { index: false } };

export default function OrdersPage() {
  return (
    <>
      <PageHero eyebrow="Orders" title="Track an order." body="Look up your order with its number and the email you used at checkout. No account needed." />
      <section className="container-page py-16">
        <LookupForm />
      </section>
    </>
  );
}
