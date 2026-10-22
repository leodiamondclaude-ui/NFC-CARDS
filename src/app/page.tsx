import Link from "next/link";
import { faqs, useCases } from "@/config/content";
import { finishes } from "@/config/products";
import { getFeaturedProducts } from "@/lib/catalog";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section";
import { HeroVisual } from "@/components/home/hero-visual";
import { Steps } from "@/components/home/steps";
import { FaqList } from "@/components/home/faq-list";
import { ProductCard } from "@/components/shop/product-card";
import { CardArt } from "@/components/card/card-art";
import {
  ArrowRightIcon,
  BuildingIcon,
  CameraIcon,
  HandshakeIcon,
  HomeIcon,
  PhoneIcon,
  RepeatIcon,
  SparkIcon,
  StoreIcon,
  TapIcon,
  TicketIcon,
  CheckIcon,
} from "@/components/ui/icons";

const benefits = [
  {
    icon: TapIcon,
    title: "Instant sharing",
    body: "Share your digital identity with a tap. No typing, no app on their side.",
  },
  {
    icon: SparkIcon,
    title: "Fully customizable",
    body: "Choose the material, finish and branding, plus where every tap should go.",
  },
  {
    icon: RepeatIcon,
    title: "Reusable",
    body: "Point your card to a page you control and update that page any time, without replacing the card.",
  },
  {
    icon: PhoneIcon,
    title: "Simple setup",
    body: "We program your card before it ships. It works with NFC-enabled smartphones.",
  },
];

const useCaseIcons: Record<string, typeof TapIcon> = {
  networking: HandshakeIcon,
  "real-estate": HomeIcon,
  social: CameraIcon,
  "small-business": StoreIcon,
  events: TicketIcon,
};

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container-page grid items-center gap-12 pb-20 pt-14 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:pb-28">
          <div className="max-w-xl">
            <p className="eyebrow animate-rise">Programmable NFC cards</p>
            <h1 className="display mt-5 text-[3.1rem] animate-rise [animation-delay:60ms] sm:text-[4.4rem] lg:text-[5rem]">
              One tap.
              <br />
              <span className="text-muted">Endless possibilities.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-2 animate-rise [animation-delay:120ms]">
              Meet the smarter business card. Share your contact information, social profiles, and digital
              experiences with a single tap.
            </p>
            <div className="mt-9 flex flex-col gap-3 animate-rise [animation-delay:180ms] sm:flex-row">
              <ButtonLink href="/shop" size="lg">
                Shop NFC Cards
              </ButtonLink>
              <ButtonLink href="/how-it-works" size="lg" variant="secondary">
                See How It Works
              </ButtonLink>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted animate-rise [animation-delay:240ms]">
              {["No app needed to receive", "No battery", "Programmed before shipping"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <CheckIcon size={15} className="text-accent" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* Benefits */}
      <section aria-labelledby="benefits" className="border-y border-line bg-card">
        <h2 id="benefits" className="sr-only">
          Benefits
        </h2>
        <div className="container-page grid divide-line sm:grid-cols-2 lg:grid-cols-4 lg:divide-x">
          {benefits.map(({ icon: I, title, body }) => (
            <div key={title} className="px-2 py-6 sm:py-10 lg:px-8 lg:first:pl-0 lg:last:pr-0">
              <I size={22} className="text-accent" />
              <h3 className="mt-5 text-[1.05rem] font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="container-page py-24" aria-labelledby="featured">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            id="featured"
            eyebrow="The collection"
            title="Cards made to be handed over."
            body="Four ways to start, from an everyday card to branded packs for your whole team."
          />
          <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline underline-offset-4">
            Shop all products <ArrowRightIcon size={16} />
          </Link>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-night py-24 text-paper" aria-labelledby="how">
        <div className="container-page">
          <SectionHeading
            id="how"
            inverse
            eyebrow="How it works"
            title="Three steps from checkout to first tap."
          />
          <div className="mt-12">
            <Steps inverse />
          </div>
          <div className="mt-8 grid gap-4 rounded-[var(--radius-card)] bg-night-2 p-6 text-sm leading-relaxed text-paper/65 shadow-[0_0_0_1px_rgba(255,255,255,0.07)] md:grid-cols-3">
            <p>
              <span className="font-medium text-paper">Compatibility depends on the phone.</span> Most recent iPhones
              and Android phones read NFC. Some Android models need NFC switched on in Settings.
            </p>
            <p>
              <span className="font-medium text-paper">No batteries.</span> NFC cards are passive. The phone powers the
              chip for the instant it&apos;s read.
            </p>
            <p>
              <span className="font-medium text-paper">Programming varies by card type.</span> We program yours before
              shipping. Unlocked cards can be rewritten later with a compatible phone.
            </p>
          </div>
          <Link
            href="/how-it-works"
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-paper hover:underline underline-offset-4"
          >
            Learn more about setup <ArrowRightIcon size={16} />
          </Link>
        </div>
      </section>

      {/* Use cases */}
      <section className="container-page py-24" aria-labelledby="use-cases">
        <SectionHeading id="use-cases" eyebrow="Use cases" title="Wherever you meet people." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {useCases.map((u) => {
            const I = useCaseIcons[u.id];
            return (
              <div key={u.id} className="flex flex-col rounded-[var(--radius-card)] bg-card p-6 shadow-[0_0_0_1px_var(--line)]">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-paper-2">
                  <I size={20} />
                </span>
                <h3 className="mt-10 font-semibold tracking-tight">{u.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{u.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Business */}
      <section className="container-page pb-24" aria-labelledby="business">
        <div className="grid overflow-hidden rounded-[1.75rem] bg-paper-2 shadow-[0_0_0_1px_var(--line)] lg:grid-cols-2">
          <div className="p-8 md:p-14">
            <p className="eyebrow flex items-center gap-2">
              <BuildingIcon size={14} /> Business solutions
            </p>
            <h2 id="business" className="display mt-4 text-[2.1rem] sm:text-[2.6rem]">
              Your whole team, on brand.
            </h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
              Branded NFC cards for sales teams, agencies and events, with each card set up for the person carrying it.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {["Custom logos and brand colors", "Team orders, one checkout", "Bulk pricing from 25 cards", "Consistent employee branding"].map(
                (t) => (
                  <li key={t} className="flex items-start gap-2 text-[0.95rem]">
                    <CheckIcon size={18} className="mt-0.5 shrink-0 text-accent" /> {t}
                  </li>
                ),
              )}
            </ul>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/business#quote">Request a quote</ButtonLink>
              <ButtonLink href="/shop/team-pack" variant="secondary">
                Shop the Team Pack
              </ButtonLink>
            </div>
          </div>
          <div className="relative min-h-[22rem] bg-[linear-gradient(160deg,#e9e6de,#dcd8ce)]" aria-hidden="true">
            <div className="absolute left-[12%] top-[16%] w-[52%] rotate-[-10deg]">
              <CardArt finish={finishes["pearl-white"]} text="Jordan Lee" subtext="Account Executive" />
            </div>
            <div className="absolute left-[26%] top-[32%] w-[52%] rotate-[-3deg]">
              <CardArt finish={finishes.frost} text="Sam Okafor" subtext="Partnerships" />
            </div>
            <div className="absolute left-[40%] top-[48%] w-[52%] rotate-[5deg]">
              <CardArt finish={finishes["matte-black"]} text="Priya Shah" subtext="Head of Sales" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page grid gap-12 pb-24 lg:grid-cols-[1fr_2fr]" aria-labelledby="faq">
        <div>
          <SectionHeading id="faq" eyebrow="FAQ" title="Good questions." />
          <Link href="/faq" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium hover:underline underline-offset-4">
            All questions <ArrowRightIcon size={16} />
          </Link>
        </div>
        <FaqList items={faqs.slice(0, 7)} />
      </section>

      {/* Closing CTA */}
      <section className="container-page pb-24">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-ink px-8 py-16 text-center text-paper md:py-20">
          <h2 className="display mx-auto max-w-2xl text-[2.3rem] sm:text-[3.2rem]">Make your first impression in one tap.</h2>
          <p className="mx-auto mt-4 max-w-lg text-paper/65">Design your card in a couple of minutes. We program it and ship it ready to use.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/customize" size="lg" variant="accent">
              Design your card
            </ButtonLink>
            <ButtonLink href="/shop" size="lg" variant="inverse">
              Browse the shop
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
