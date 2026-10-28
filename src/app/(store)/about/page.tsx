import type { Metadata } from "next";
import { site } from "@/config/site";
import { PageHero } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "About", description: `Why ${site.name} makes NFC business cards.`, alternates: { canonical: "/about" } };

const principles = [
  ["Useful, not gimmicky", "A card should make it easier to connect. That's the whole job, so we keep the experience simple on both sides of the tap."],
  ["Honest about the tech", "NFC is great, but it depends on the phone. We tell you what works, what doesn't, and what you can change later."],
  ["Built around you", "Your card points to a page you control, so you decide what people see and can update it as your work changes."],
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Introductions, without the friction."
        body={`${site.name} makes NFC business cards for people who meet people. Tap a card to a compatible phone and your details, links or portfolio open, with no typing required.`}
      />
      <section className="container-page grid gap-4 py-20 md:grid-cols-3">
        {principles.map(([t, b]) => (
          <div key={t} className="rounded-[var(--radius-card)] bg-card p-8 shadow-[0_0_0_1px_var(--line)]">
            <h2 className="text-lg font-semibold tracking-tight">{t}</h2>
            <p className="mt-3 leading-relaxed text-muted">{b}</p>
          </div>
        ))}
      </section>
      <section className="container-page pb-24 text-center">
        <ButtonLink href="/shop" size="lg">
          Shop the collection
        </ButtonLink>
      </section>
    </>
  );
}
