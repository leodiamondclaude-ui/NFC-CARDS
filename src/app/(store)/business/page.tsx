import type { Metadata } from "next";
import { finishes } from "@/config/products";
import { site } from "@/config/site";
import { PageHero, SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { CardArt } from "@/components/card/card-art";
import { QuoteForm } from "@/components/forms/quote-form";
import { BadgeIcon, BuildingIcon, PackageIcon, RepeatIcon, SparkIcon, UsersIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "For Business",
  description: "NFC business cards for teams: bulk orders, custom branding and team purchasing. Request a quote.",
  alternates: { canonical: "/business" },
};

const features = [
  { icon: PackageIcon, title: "Bulk orders", body: "Order cards for your whole team in one go. Tell us your quantity and we'll reply with pricing options." },
  { icon: SparkIcon, title: "Custom branding", body: "Add your company name and logo so every card carries your brand. We review designs with you before production." },
  { icon: UsersIcon, title: "Team purchasing", body: "One point of contact and one order for everyone, with each person's details collected after purchase." },
  { icon: BadgeIcon, title: "Consistent look", body: "One approved design across the team, so every introduction looks the same." },
  { icon: RepeatIcon, title: "Easier staff changes", body: "Point cards at pages your company controls, so updates to those pages don't need new cards." },
  { icon: BuildingIcon, title: "Built for growing teams", body: "Start with a Business Pack and request a quote when you need more cards or custom work." },
];

export default function BusinessPage() {
  return (
    <>
      <PageHero
        eyebrow="For business"
        title="One Brand. Every Connection."
        body="Equip your team with professional NFC cards designed to make networking simple."
      />

      <section className="container-page py-20" aria-label="What we offer teams">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: I, title, body }) => (
            <div key={title} className="rounded-[var(--radius-card)] border border-line bg-card p-7">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent">
                <I size={20} />
              </span>
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
              eyebrow="Smaller team?"
              title="Start with the Business Pack."
              body="A pack of NFC cards with one shared design, ready to order online. For larger quantities or custom work, request a quote."
            />
            <ButtonLink href="/shop/business-pack" variant="inverse" size="lg" className="mt-8">
              View the Business Pack
            </ButtonLink>
          </div>
          <div className="relative mx-auto aspect-[4/3] w-full max-w-lg" aria-hidden="true">
            {(
              [
                ["Jordan Lee", "Account Executive", "left-[0%] top-[4%] rotate-[-9deg]", finishes.white],
                ["Sam Okafor", "Partnerships", "left-[18%] top-[24%] rotate-[-2deg]", finishes.metallic],
                ["Priya Shah", "Head of Sales", "left-[36%] top-[44%] rotate-[6deg]", finishes.black],
              ] as const
            ).map(([n, t, pos, f]) => (
              <div key={n} className={`absolute w-[60%] ${pos}`}>
                <CardArt finish={f} text={n} subtext={t} />
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
              body="Share a few details and we'll reply with pricing, timing and design next steps."
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
