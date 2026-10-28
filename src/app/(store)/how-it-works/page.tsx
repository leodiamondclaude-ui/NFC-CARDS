import type { Metadata } from "next";
import { finishes } from "@/config/products";
import { PageHero, SectionHeading } from "@/components/ui/section";
import { Steps } from "@/components/home/steps";
import { ButtonLink } from "@/components/ui/button";
import { CardArt } from "@/components/card/card-art";
import { PhonePreview } from "@/components/card/phone-preview";
import { CheckIcon, InfoIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "How It Works",
  description: "How NFC business cards work, how setup works, which phones support NFC, and how to keep your details up to date.",
  alternates: { canonical: "/how-it-works" },
};

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="Choose. Set up. Tap and share."
        body="Each card has a small NFC chip that stores a web address. Hold it near a compatible phone and the phone opens that page, with no app needed on their side."
      />

      <section className="container-page py-20">
        <Steps />
        <p className="mt-6 flex max-w-3xl gap-2.5 text-sm leading-relaxed text-muted">
          <InfoIcon size={18} className="mt-0.5 shrink-0" />
          Setup depends on the product you choose. Each product page lists what&apos;s included and what we need from you.
        </p>
      </section>

      <section className="border-y border-line bg-card">
        <div className="container-page grid items-center gap-14 py-20 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Tapping" title="Where to tap." />
            <ul className="mt-8 space-y-5 text-ink-2">
              <li>
                <p className="font-medium text-ink">iPhone</p>
                <p className="mt-1 leading-relaxed">
                  Hold the card near the top back edge of the phone, by the camera. Recent iPhones read NFC cards while the
                  screen is on and unlocked. Some older models need the NFC reader opened from Control Center, and the oldest
                  models can&apos;t read cards at all.
                </p>
              </li>
              <li>
                <p className="font-medium text-ink">Android</p>
                <p className="mt-1 leading-relaxed">
                  Hold the card near the middle or top of the back of the phone, depending on the model. If nothing
                  happens, check that NFC is on in Settings. The phone needs to be unlocked.
                </p>
              </li>
              <li>
                <p className="font-medium text-ink">If a phone can&apos;t read it</p>
                <p className="mt-1 leading-relaxed">
                  Some phones don&apos;t have NFC, or have it switched off. Keep your name and details printed on the card
                  so it still works as a regular business card.
                </p>
              </li>
            </ul>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <div className="absolute right-[10%] top-0 w-[48%]">
              <PhonePreview />
            </div>
            <div className="absolute bottom-[8%] left-0 w-[64%] rotate-[-10deg]">
              <CardArt finish={finishes.black} text="Alex Rivera" subtext="Founder" />
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-20" aria-labelledby="fixed-vs-dynamic">
        <SectionHeading
          id="fixed-vs-dynamic"
          eyebrow="Changing your destination"
          title="Fixed links and editable pages."
          body="The chip stores a web address. What you can change later depends on where that address points."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="rounded-[var(--radius-card)] bg-card p-8 shadow-[0_0_0_1px_var(--line)]">
            <p className="eyebrow">Option A</p>
            <h3 className="mt-3 text-xl font-semibold tracking-tight">A fixed destination</h3>
            <p className="mt-3 leading-relaxed text-muted">
              The card opens one specific address, like <span className="font-mono text-sm text-ink">instagram.com/yourname</span>.
              To send people somewhere else, the card itself has to be rewritten, which depends on the card and how
              it was set up.
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              {["Simple, nothing else to maintain", "Best when the link won't change"].map((t) => (
                <li key={t} className="flex gap-2">
                  <CheckIcon size={16} className="mt-0.5 text-accent" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[var(--radius-card)] bg-ink p-8 text-paper">
            <p className="eyebrow !text-paper/50">Option B</p>
            <h3 className="mt-3 text-xl font-semibold tracking-tight">A page you can edit</h3>
            <p className="mt-3 leading-relaxed text-paper/65">
              The card opens a page you control, such as your website, a link-in-bio page or a hosted digital
              business card. The link on the chip stays the same; you update the page whenever you like.
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              {["Update details without touching the card", "Best for job changes, promotions and new links"].map((t) => (
                <li key={t} className="flex gap-2">
                  <CheckIcon size={16} className="mt-0.5 text-accent" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted">
          A fixed link can&apos;t be redirected on its own. If the page it points to goes away, the card stops being
          useful until it&apos;s rewritten. That&apos;s why we recommend pointing to a page you own.
        </p>
      </section>

      <section className="container-page pb-24">
        <div className="grid gap-8 rounded-[1.75rem] bg-paper-2 p-8 shadow-[0_0_0_1px_var(--line)] md:grid-cols-3 md:p-12">
          {[
            ["No battery", "Cards are passive. The phone's NFC field powers the chip for the moment it's read, so there's nothing to charge or replace."],
            ["Setup", "How your card is set up depends on the product. Each product page explains what's included and what we need from you."],
            ["Privacy", "The chip only shares what's written on it, and only when someone deliberately taps it within a few centimeters."],
          ].map(([t, b]) => (
            <div key={t}>
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{b}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/shop" size="lg">
            Shop NFC Cards
          </ButtonLink>
          <ButtonLink href="/faq" size="lg" variant="secondary">
            Read the FAQ
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
