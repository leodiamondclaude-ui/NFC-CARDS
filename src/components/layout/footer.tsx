import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { site } from "@/config/site";

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All cards" },
      { href: "/shop/essential-nfc-card", label: "Essential NFC Card" },
      { href: "/shop/premium-nfc-card", label: "Premium NFC Card" },
      { href: "/shop/custom-nfc-card", label: "Custom NFC Card" },
      { href: "/shop/business-pack", label: "Business Pack" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
      { href: "/orders", label: "Track an order" },
      { href: "/business", label: "For business" },
    ],
  },
  {
    title: "Policies",
    links: [
      { href: "/shipping", label: "Shipping policy" },
      { href: "/returns", label: "Returns policy" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-night text-paper">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo inverse />
          <p className="mt-4 text-sm leading-relaxed text-paper/60">{site.tagline}</p>
          <a href={`mailto:${site.contact.email}`} className="mt-6 inline-block text-sm text-paper/80 underline-offset-4 hover:underline">
            {site.contact.email}
          </a>
          {site.social.length > 0 && (
            <ul className="mt-4 flex gap-4 text-sm text-paper/70">
              {site.social.map((s) => (
                <li key={s.href}>
                  <a href={s.href} rel="noopener" className="hover:text-paper">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="text-sm font-medium text-paper">{col.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-paper/60 transition-colors hover:text-paper">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-paper/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CopyrightYear /> {site.name}. All rights reserved.
          </p>
          <p>NFC support varies by phone model and settings.</p>
        </div>
      </div>
    </footer>
  );
}

async function CopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}
