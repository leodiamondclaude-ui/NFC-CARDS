import Link from "next/link";
import { site } from "@/config/site";

/** Text logo with a tap mark. Change the name in src/config/site.ts. */
export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2" aria-label={`${site.name} home`}>
      <span
        className={`relative grid h-7 w-7 place-items-center rounded-[0.55rem] ${inverse ? "bg-paper text-ink" : "bg-ink text-paper"}`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
          <path d="M7 9.5a5 5 0 0 1 0 5" />
          <path d="M11 7a8.5 8.5 0 0 1 0 10" />
        </svg>
        <span className="absolute right-[5px] top-1/2 h-[5px] w-[5px] -translate-y-1/2 rounded-full bg-accent transition-transform duration-300 group-hover:scale-125" />
      </span>
      <span className={`text-[0.95rem] font-semibold tracking-[0.2em] ${inverse ? "text-paper" : "text-ink"}`}>{site.name}</span>
    </Link>
  );
}
