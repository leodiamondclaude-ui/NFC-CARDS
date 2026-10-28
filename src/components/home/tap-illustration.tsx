import { finishes } from "@/config/products";
import { CardArt } from "@/components/card/card-art";
import { PhonePreview } from "@/components/card/phone-preview";

/** Card meeting the top of a phone: the "tap" moment, used in How It Works. */
export function TapIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={`relative mx-auto aspect-[5/4] w-full max-w-[26rem] ${className}`} aria-hidden="true">
      <div className="absolute left-[30%] top-[6%] w-[38%]">
        <PhonePreview />
      </div>
      <div className="absolute left-[46%] top-[14%] h-20 w-20 -translate-x-1/2">
        <span className="absolute inset-0 rounded-full border border-accent/60 animate-ripple" />
        <span className="absolute inset-0 rounded-full border border-accent/35 animate-ripple [animation-delay:900ms]" />
      </div>
      <div className="absolute left-[4%] top-[2%] w-[52%] rotate-[-14deg]">
        <CardArt finish={finishes.black} text="Alex Rivera" subtext="Founder, Rivera Studio" />
      </div>
    </div>
  );
}
