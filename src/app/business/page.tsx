import type { Metadata } from "next";
import { finishes } from "@/config/products";
import { site } from "@/config/site";
import { PageHero, SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { CardArt } from "@/components/card/card-art";
import { QuoteForm } from "@/components/business/quote-form";
import { BuildingIcon, RepeatIcon, ShieldIcon, SparkIcon, TicketIcon, HandshakeIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Business solutions",
  description: "Branded NFC cards for teams: custom logos, bulk pricing, per-employee setup and consistent branding.",
};

const features = [
  { icon: SparkIcon, title: "Custom logos", body: "Your logo, colors and layout, printed or engraved. We send a digital proof before production." },
  { icon: BuildingIcon, title: "Team orders", body: "Order for everyone at once. Send us a list of names and destinations and we set up each card." },
  { icon: TicketIcon, title: "Bulk pricing", body: "Volume pricing from 25 cards, with better rates as quantities grow. Ask for a quote." },
  { icon: HandshakeIcon, title: "Consistent branding", body: "One approved design across the team, so every introduction looks the same." },
  { icon: RepeatIcon, title: "Easy staff changes", body: "Point cards at pages your company controls, so updates don't require new cards." },
  { icon: ShieldIcon, title: "Quality checked", body: "Every card is programmed and tested with a phone before it leaves us." },
];

export default function BusinessPage() {
  return (
    <>
      <PageHero
        eyebrow="Business solutions"
        title="Branded NFC cards for your whole team."
        body="From a five-person sales team to a conference crew, we make custom cards that look consistent and are set up for each person who carries one."
      />

      <section className="container-page py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: I, title, body }) => (
            <div key={title} className="rounded-[var(--radius-card)] bg-card p-7 shadow-[0_0_0_1px_var(--line)]">
              <I size={22} className="text-accent" />
              <h2 className="mt-6 text-lg font-semibold tracking-tight">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-night text-paper">
        <div className="container-page grid items-center gap-12 py-20 lg:grid-cols-2">
          <div>
            <SectionHeading
              inverse
              eyebrow="Small team?"
              title="Start with the Team Pack."
              body="Five custom cards with one shared design, each programmed with its own destination. Order online today and send names after checkout."
            />
            <ButtonLink href="/shop/team-pack" variant="inverse" size="lg" className="mt-8">
              Shop the Team Pack
            </ButtonLink>
          </div>
          <div className="relative mx-auto aspect-[4/3] w-full max-w-lg" aria-hidden="true">
            {[
              ["Jordan Lee", "Account Executive", "left-[0%] top-[4%] rotate-[-9deg]"],
              ["Sam Okafor", "Partnerships", "left-[18%] top-[24%] rotate-[-2deg]"],
              ["Priya Shah", "Head of Sales", "left-[36%] top-[44%] rotate-[6deg]"],
            ].map(([n, t, pos]) => (
              <div key={n} className={`absolute w-[60%] ${pos}`}>
                <CardArt finish={finishes["black-metal"]} text={n} subtext={t} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="quote" className="container-page scroll-mt-24 py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionHeading
              eyebrow="Request a quote"
              title="Tell us about your team."
              body="Share a few details and we'll reply with pricing, lead times and design next steps."
            />
            <p className="mt-6 text-sm text-muted">
              Prefer email? Write to{" "}
              <a className="underline underline-offset-4 hover:text-ink" href={`mailto:${site.contact.salesEmail}`}>
                {site.contact.salesEmail}
              </a>
              .
            </p>
          </div>
          <QuoteForm />
        </div>
      </section>
    </>
  );
}
