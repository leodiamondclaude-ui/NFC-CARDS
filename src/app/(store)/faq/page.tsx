import type { Metadata } from "next";
import { faqs } from "@/config/content";
import { site } from "@/config/site";
import { PageHero } from "@/components/ui/section";
import { FaqList } from "@/components/home/faq-list";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about NFC business cards, phone compatibility, customization, shipping, returns and bulk orders.",
  alternates: { canonical: "/faq" },
};

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
      <div className="container-page max-w-4xl py-16">
        <FaqList items={faqs} />
      </div>
    </>
  );
}
