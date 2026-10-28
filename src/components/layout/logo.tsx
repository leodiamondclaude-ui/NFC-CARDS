import Link from "next/link";
import { site } from "@/config/site";

/** Text logo with a handshake mark. Change the name in src/config/site.ts. */
export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2" aria-label={`${site.name} home`}>
      <span
        className={`relative grid h-7 w-7 place-items-center rounded-[0.55rem] ${inverse ? "bg-paper text-ink" : "bg-ink text-paper"}`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="m11 17 2 2a1 1 0 1 0 3-3" />
          <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
          <path d="m21 3 1 11h-2" />
          <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
          <path d="M3 4h8" />
        </svg>
        <span className={`absolute -right-0.5 -top-0.5 h-[7px] w-[7px] rounded-full bg-accent ring-2 ${inverse ? "ring-night" : "ring-paper"} transition-transform duration-300 group-hover:scale-125`} />
      </span>
      <span className={`text-[0.95rem] font-semibold uppercase tracking-[0.2em] ${inverse ? "text-paper" : "text-ink"}`}>{site.name}</span>
    </Link>
  );
}
