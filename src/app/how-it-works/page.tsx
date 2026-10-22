import type { Metadata } from "next";
import { finishes } from "@/config/products";
import { PageHero, SectionHeading } from "@/components/ui/section";
import { Steps } from "@/components/home/steps";
import { ButtonLink } from "@/components/ui/button";
import { CardArt } from "@/components/card/card-art";
import { PhonePreview } from "@/components/card/phone-preview";
import { CheckIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "How it works",
  description: "How NFC cards work, which phones support them, and the difference between fixed links and editable pages.",
};

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="A link you can hand to someone."
        body="Each card has a tiny NFC chip that stores a link or contact record. Hold it near a phone and the phone opens it. That's all there is to it."
      />

      <section className="container-page py-20">
        <Steps />
      </section>

      <section className="border-y border-line bg-card">
        <div className="container-page grid items-center gap-14 py-20 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Tapping" title="Where to tap." />
            <ul className="mt-8 space-y-5 text-ink-2">
              <li>
                <p className="font-medium text-ink">iPhone</p>
                <p className="mt-1 leading-relaxed">
                  Hold the card near the top back edge of the phone, by the camera. iPhone XS and newer read cards
                  automatically while the screen is on. iPhone 7 through X use the NFC Tag Reader in Control Center.
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
              <CardArt finish={finishes["brushed-steel"]} text="Alex Rivera" subtext="Founder" />
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-20" aria-labelledby="fixed-vs-dynamic">
        <SectionHeading
          id="fixed-vs-dynamic"
          eyebrow="Changing your destination"
          title="Fixed links and editable pages."
          body="The chip stores whatever we write to it. What you can change later depends on where that link points."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="rounded-[var(--radius-card)] bg-card p-8 shadow-[0_0_0_1px_var(--line)]">
            <p className="eyebrow">Option A</p>
            <h3 className="mt-3 text-xl font-semibold tracking-tight">A fixed destination</h3>
            <p className="mt-3 leading-relaxed text-muted">
              The card opens one specific address, like <span className="font-mono text-sm text-ink">instagram.com/yourname</span>.
              To send people somewhere else, the card has to be rewritten with an NFC app (possible as long as it
              isn&apos;t locked).
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
            ["Programming", "We program and test your card before it ships. Unlocked cards can be rewritten later with a free NFC app on a compatible phone. Locking is permanent."],
            ["Privacy", "The chip only shares what's written on it, and only when someone deliberately taps it within a few centimeters."],
          ].map(([t, b]) => (
            <div key={t}>
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{b}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/customize" size="lg">
            Design your card
          </ButtonLink>
          <ButtonLink href="/faq" size="lg" variant="secondary">
            Read the FAQ
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
