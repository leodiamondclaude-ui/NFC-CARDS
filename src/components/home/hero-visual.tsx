import { finishes } from "@/config/products";
import { CardArt } from "@/components/card/card-art";
import { PhonePreview } from "@/components/card/phone-preview";

export function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-[1/1] w-full max-w-[34rem]">
      {/* Soft halo */}
      <div
        aria-hidden="true"
        className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,87,20,0.16),transparent_62%)]"
      />
      <div className="absolute right-[6%] top-[0%] w-[42%] animate-rise [animation-delay:150ms]">
        <PhonePreview />
      </div>
      {/* Tap ripples where the card meets the phone */}
      <div aria-hidden="true" className="absolute left-[50%] top-[58%] h-24 w-24 -translate-x-1/2 -translate-y-1/2">
        <span className="absolute inset-0 rounded-full border border-accent/60 animate-ripple" />
        <span className="absolute inset-0 rounded-full border border-accent/40 animate-ripple [animation-delay:800ms]" />
        <span className="absolute inset-0 rounded-full border border-accent/30 animate-ripple [animation-delay:1600ms]" />
      </div>
      <div className="absolute bottom-[4%] left-[0%] w-[58%] animate-float [--r:-8deg]">
        <CardArt
          finish={finishes["matte-black"]}
          view="front"
          text="Alex Rivera"
          subtext="Founder, Rivera Studio"
          className="animate-rise [animation-delay:300ms]"
        />
      </div>
    </div>
  );
}
