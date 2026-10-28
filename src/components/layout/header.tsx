import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { CartButton, MobileMenu } from "@/components/layout/header-client";
import { ButtonLink } from "@/components/ui/button";

export const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/business", label: "For Business" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/80 backdrop-blur-xl backdrop-saturate-150">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-full px-3.5 py-2 text-[0.92rem] text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <ButtonLink href="/shop" size="sm" className="hidden sm:inline-flex">
            Shop Cards
          </ButtonLink>
          <CartButton />
          <MobileMenu links={navLinks} />
        </div>
      </div>
    </header>
  );
}
