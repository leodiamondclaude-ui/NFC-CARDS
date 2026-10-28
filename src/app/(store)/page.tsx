import Link from "next/link";
import { benefits, faqs, testimonials, useCases } from "@/config/content";
import { finishes } from "@/config/products";
import { getCatalog } from "@/lib/server/catalog";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section";
import { HeroVisual } from "@/components/home/hero-visual";
import { Steps } from "@/components/home/steps";
import { FaqList } from "@/components/home/faq-list";
import { TapIllustration } from "@/components/home/tap-illustration";
import { ProductCard } from "@/components/shop/product-card";
import { CardArt } from "@/components/card/card-art";
import { Reveal } from "@/components/motion/reveal";
import {
  ArrowRightIcon,
  BadgeIcon,
  BriefcaseIcon,
  BuildingIcon,
  CameraIcon,
  CheckIcon,
  HandshakeIcon,
  HomeIcon,
  InfoIcon,
  LeafIcon,
  QuoteIcon,
  RepeatIcon,
  RocketIcon,
  StoreIcon,
  TapIcon,
} from "@/components/ui/icons";

const benefitIcons: Record<string, typeof TapIcon> = {
  sharing: TapIcon,
  reusable: RepeatIcon,
  professional: BadgeIcon,
  paper: LeafIcon,
};

const useCaseIcons: Record<string, typeof TapIcon> = {
  entrepreneurs: RocketIcon,
  sales: HandshakeIcon,
  "real-estate": HomeIcon,
  creators: CameraIcon,
  "small-business": StoreIcon,
};

export default async function HomePage() {
  const catalog = await getCatalog();
  const featured = catalog.filter((p) => p.featured).sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container-page grid items-center gap-12 pb-20 pt-14 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:pb-28">
          <div className="max-w-xl">
            <p className="eyebrow animate-rise">NFC business cards</p>
            <h1 className="display mt-5 text-[2.9rem] animate-rise [animation-delay:60ms] sm:text-[4.2rem] lg:text-[4.6rem]">
              Your First Impression.
              <br />
              <span className="text-accent">One Tap Away.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-2 animate-rise [animation-delay:120ms]">
              Meet the smarter business card. Share your contact information, social profiles, and professional identity
              with a single tap.
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
              {["No app needed to receive", "No battery or charging", "Works as a printed card too"].map((t) => (
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
      <section aria-labelledby="benefits" className="border-y border-line bg-paper-2">
        <h2 id="benefits" className="sr-only">
          Benefits
        </h2>
        <Reveal className="container-page grid divide-line sm:grid-cols-2 lg:grid-cols-4 lg:divide-x">
          {benefits.map(({ id, title, body }) => {
            const I = benefitIcons[id];
            return (
              <div key={id} data-reveal-item className="px-2 py-7 sm:py-10 lg:px-8 lg:first:pl-0 lg:last:pr-0">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-paper text-accent shadow-[0_0_0_1px_var(--line)]">
                  <I size={20} />
                </span>
                <h3 className="mt-5 text-[1.05rem] font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
              </div>
            );
          })}
        </Reveal>
      </section>

      {/* Featured products */}
      <section className="container-page py-24" aria-labelledby="featured">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            id="featured"
            eyebrow="Shop"
            title="Find the card that fits."
            body="From an everyday card to fully custom designs and packs for your team."
          />
          <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline underline-offset-4">
            Shop all cards <ArrowRightIcon size={16} />
          </Link>
        </div>
        <Reveal className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={90}>
          {featured.map((p) => (
            <div key={p.slug} data-reveal-item className="grid">
              <ProductCard product={p} />
            </div>
          ))}
        </Reveal>
      </section>

      {/* How it works */}
      <section className="bg-night py-24 text-paper" aria-labelledby="how">
        <div className="container-page">
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <SectionHeading
              id="how"
              inverse
              eyebrow="How it works"
              title="Three steps to your first tap."
              body="No app is needed for the person you share with. A compatible phone opens your page in its browser."
            />
            <TapIllustration className="max-w-[22rem]" />
          </div>
          <Reveal className="mt-12">
            <Steps inverse />
          </Reveal>
          <p className="mt-6 flex max-w-3xl gap-2.5 text-sm leading-relaxed text-paper/60">
            <InfoIcon size={18} className="mt-0.5 shrink-0" />
            NFC support varies by phone. Most recent iPhones and many Android phones can read NFC cards, but some models
            need NFC switched on in settings, and some phones don&apos;t support it at all.
          </p>
          <Link href="/how-it-works" className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-paper hover:underline underline-offset-4">
            Learn more about setup <ArrowRightIcon size={16} />
          </Link>
        </div>
      </section>

      {/* Use cases */}
      <section className="container-page py-24" aria-labelledby="use-cases">
        <SectionHeading id="use-cases" eyebrow="Who it's for" title="Made for People Who Make Connections." />
        <Reveal className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {useCases.map((u) => {
            const I = useCaseIcons[u.id] ?? BriefcaseIcon;
            return (
              <div key={u.id} data-reveal-item className="flex flex-col rounded-[var(--radius-card)] border border-line bg-card p-6 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-line-strong">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent">
                  <I size={20} />
                </span>
                <h3 className="mt-8 font-semibold tracking-tight">{u.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{u.body}</p>
              </div>
            );
          })}
        </Reveal>
      </section>

      {/* Business */}
      <section className="container-page pb-24" aria-labelledby="business">
        <Reveal className="grid overflow-hidden rounded-[1.75rem] border border-line bg-paper-2 lg:grid-cols-2">
          <div className="p-8 md:p-14">
            <p className="eyebrow flex items-center gap-2">
              <BuildingIcon size={14} /> For business
            </p>
            <h2 id="business" className="display mt-4 text-[2.1rem] sm:text-[2.6rem]">
              One Brand. Every Connection.
            </h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
              Equip your team with professional NFC cards designed to make networking simple.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {["Bulk orders for teams of any size", "Custom branding with your logo", "Team purchasing, one point of contact", "Consistent cards across your staff"].map((t) => (
                <li key={t} className="flex items-start gap-2 text-[0.95rem]">
                  <CheckIcon size={18} className="mt-0.5 shrink-0 text-accent" /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/business#quote">Request a Quote</ButtonLink>
              <ButtonLink href="/shop/business-pack" variant="secondary">
                View the Business Pack
              </ButtonLink>
            </div>
          </div>
          <div className="relative min-h-[22rem] bg-[linear-gradient(160deg,#eef0f7,#e2e5ef)]" aria-hidden="true">
            <div className="absolute left-[12%] top-[16%] w-[52%] rotate-[-10deg]">
              <CardArt finish={finishes.white} text="Jordan Lee" subtext="Account Executive" />
            </div>
            <div className="absolute left-[26%] top-[32%] w-[52%] rotate-[-3deg]">
              <CardArt finish={finishes.metallic} text="Sam Okafor" subtext="Partnerships" />
            </div>
            <div className="absolute left-[40%] top-[48%] w-[52%] rotate-[5deg]">
              <CardArt finish={finishes.black} text="Priya Shah" subtext="Head of Sales" />
            </div>
          </div>
        </Reveal>
      </section>

      {/* Testimonials: placeholders only, clearly labeled. */}
      <section className="container-page pb-24" aria-labelledby="testimonials">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <SectionHeading id="testimonials" eyebrow="Customer stories" title="What customers say." />
          {testimonials.isSample && (
            <p className="inline-flex items-center gap-2 self-start rounded-full bg-paper-2 px-3 py-1.5 text-xs font-medium text-ink-2 md:self-auto">
              <InfoIcon size={14} /> Sample placeholders, not real reviews
            </p>
          )}
        </div>
        <Reveal as="ul" className="mt-10 grid gap-4 md:grid-cols-3">
          {testimonials.items.map((t, i) => (
            <li key={i} data-reveal-item className={`flex flex-col rounded-[var(--radius-card)] border border-line bg-card p-7 ${testimonials.isSample ? "border-dashed" : ""}`}>
              <QuoteIcon size={22} className="text-accent" />
              <p className={`mt-5 flex-1 leading-relaxed ${testimonials.isSample ? "text-muted italic" : "text-ink-2"}`}>{t.quote}</p>
              <p className="mt-6 text-sm font-medium">{t.name}</p>
              <p className="text-sm text-muted">{t.role}</p>
            </li>
          ))}
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="container-page grid gap-12 pb-24 lg:grid-cols-[1fr_2fr]" aria-labelledby="faq">
        <div>
          <SectionHeading id="faq" eyebrow="FAQ" title="Questions, answered." />
          <Link href="/faq" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium hover:underline underline-offset-4">
            All questions <ArrowRightIcon size={16} />
          </Link>
        </div>
        <Reveal>
          <FaqList items={faqs.slice(0, 6)} />
        </Reveal>
      </section>

      {/* Closing CTA */}
      <section className="container-page pb-24">
        <Reveal className="rounded-[1.75rem] bg-ink px-8 py-16 text-center text-paper md:py-20">
          <h2 className="display mx-auto max-w-2xl text-[2.3rem] sm:text-[3.2rem]">Make every introduction count.</h2>
          <p className="mx-auto mt-4 max-w-lg text-paper/65">Choose your card, set up your profile, and start sharing with a tap.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/shop" size="lg" variant="accent">
              Shop NFC Cards
            </ButtonLink>
            <ButtonLink href="/business#quote" size="lg" variant="inverse">
              Request a Quote
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
