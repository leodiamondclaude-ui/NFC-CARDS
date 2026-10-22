import type { CSSProperties } from "react";
import type { Finish } from "@/config/products";
import { site } from "@/config/site";

/**
 * Renders a product mockup in pure CSS so every finish and personalization
 * previews instantly and stays crisp at any size. Swap for photography later
 * by passing product images instead.
 */

export type CardView = "front" | "back" | "angled" | "edge";

type Props = {
  finish: Finish;
  view?: CardView;
  form?: "card" | "fob";
  text?: string;
  subtext?: string;
  /** Object URL for a local logo preview (never a stored upload URL). */
  logoUrl?: string;
  className?: string;
  style?: CSSProperties;
  shadow?: boolean;
};

export function NfcGlyph({ color, className = "" }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" aria-hidden="true">
      <path d="M8 8.5a5 5 0 0 1 0 7" opacity="0.55" />
      <path d="M11.5 6a8.5 8.5 0 0 1 0 12" opacity="0.8" />
      <path d="M15 3.5a12 12 0 0 1 0 17" />
    </svg>
  );
}

export function BrandMark({ color, className = "" }: { color: string; className?: string }) {
  return (
    <span className={`font-semibold tracking-[0.18em] ${className}`} style={{ color }}>
      {site.name}
    </span>
  );
}

export function CardArt({
  finish,
  view = "front",
  form = "card",
  text,
  subtext,
  logoUrl,
  className = "",
  style,
  shadow = true,
}: Props) {
  if (form === "fob") return <FobArt finish={finish} text={text} className={className} style={style} shadow={shadow} />;

  const angled = view === "angled" || view === "edge";
  const isBack = view === "back";
  const isMetal = finish.material.toLowerCase().includes("steel");

  return (
    <div
      className={`relative w-full ${className}`}
      style={{ perspective: angled ? "1400px" : undefined, ...style }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: "85.6 / 54",
          borderRadius: "6.2% / 9.8%",
          background: finish.surface,
          containerType: "inline-size",
          transform:
            view === "angled"
              ? "rotateX(14deg) rotateY(-24deg) rotateZ(4deg)"
              : view === "edge"
                ? "rotateX(64deg) rotateZ(-28deg)"
                : undefined,
          transformStyle: "preserve-3d",
          boxShadow: shadow
            ? `0 1px 0 rgba(255,255,255,${isMetal ? 0.5 : 0.25}) inset, 0 0 0 1px rgba(0,0,0,0.06), 0 30px 60px -24px rgba(12,12,14,0.45), 0 12px 24px -12px rgba(12,12,14,0.25)`
            : "0 0 0 1px rgba(0,0,0,0.06)",
        }}
      >
        {/* Sheen */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(115deg, transparent 30%, rgba(255,255,255,${isMetal ? 0.28 : 0.12}) 46%, transparent 60%)`,
          }}
        />

        {isBack ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-[3cqw]">
            <NfcGlyph color={finish.ink} className="w-[11cqw] rotate-[-90deg] opacity-80" />
            <span className="text-[3.4cqw] tracking-[0.25em] uppercase opacity-70" style={{ color: finish.ink }}>
              Tap to connect
            </span>
            <BrandMark color={finish.ink} className="absolute bottom-[6cqw] text-[3cqw] opacity-50" />
          </div>
        ) : (
          <>
            <div className="absolute left-[7cqw] top-[7cqw] flex h-[10cqw] items-center">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
                <img src={logoUrl} alt="" className="h-full max-w-[34cqw] object-contain object-left" />
              ) : (
                <BrandMark color={finish.ink} className="text-[3.6cqw]" />
              )}
            </div>
            <NfcGlyph color={finish.ink} className="absolute right-[6cqw] top-[6cqw] w-[9cqw] opacity-80" />
            <div className="absolute bottom-[7cqw] left-[7cqw] right-[7cqw]" style={{ color: finish.ink }}>
              <div className="truncate text-[6.4cqw] font-semibold leading-tight tracking-[-0.02em]">
                {text || "Your Name"}
              </div>
              <div className="mt-[1cqw] truncate text-[3.6cqw] opacity-70">{subtext || "Title or company"}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FobArt({
  finish,
  text,
  className,
  style,
  shadow,
}: {
  finish: Finish;
  text?: string;
  className: string;
  style?: CSSProperties;
  shadow: boolean;
}) {
  return (
    <div className={`relative mx-auto w-[62%] ${className}`} style={style}>
      <div
        className="relative w-full"
        style={{
          aspectRatio: "30 / 40",
          borderRadius: "28%",
          background: finish.surface,
          containerType: "inline-size",
          boxShadow: shadow
            ? "0 1px 0 rgba(255,255,255,0.35) inset, 0 0 0 1px rgba(0,0,0,0.06), 0 28px 50px -22px rgba(12,12,14,0.45)"
            : undefined,
        }}
      >
        <div className="absolute left-1/2 top-[9cqw] h-[16cqw] w-[16cqw] -translate-x-1/2 rounded-full bg-paper shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]" />
        <div className="absolute inset-x-0 bottom-[16cqw] flex flex-col items-center gap-[5cqw]">
          <NfcGlyph color={finish.ink} className="w-[26cqw] rotate-[-90deg] opacity-80" />
          <span className="text-[8cqw] font-semibold tracking-[0.18em]" style={{ color: finish.ink }}>
            {text || site.name}
          </span>
        </div>
      </div>
    </div>
  );
}
