import type { Metadata } from "next";
import { faqs } from "@/config/content";
import { site } from "@/config/site";
import { PageHero } from "@/components/ui/section";
import { FaqList } from "@/components/home/faq-list";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about NFC, phone compatibility, programming, reprogramming, shipping, returns and bulk orders.",
};

const groups = ["NFC basics", "Setup", "Orders"] as const;

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHero eyebrow="FAQ" title="Questions, answered." body={`Can't find what you need? Email ${site.contact.email}.`} />
      <div className="container-page space-y-16 py-16">
        {groups.map((g) => (
          <section key={g} className="grid gap-6 lg:grid-cols-[1fr_2.5fr]">
            <h2 className="text-xl font-semibold tracking-tight">{g}</h2>
            <FaqList items={faqs.filter((f) => f.group === g)} />
          </section>
        ))}
      </div>
    </>
  );
}
