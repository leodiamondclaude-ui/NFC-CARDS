"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useState } from "react";
import { BagIcon, CloseIcon, MenuIcon } from "@/components/ui/icons";
import { useCartCount } from "@/lib/cart-store";

export function CartButton() {
  const count = useCartCount();
  return (
    <Link
      href="/cart"
      aria-label={count ? `Cart, ${count} item${count === 1 ? "" : "s"}` : "Cart, empty"}
      className="relative grid h-10 w-10 place-items-center rounded-full text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
    >
      <BagIcon />
      {count > 0 && (
        <span key={count} className="animate-[pop_350ms_var(--ease-out-soft)] absolute right-0.5 top-0.5 grid h-[1.15rem] min-w-[1.15rem] place-items-center rounded-full bg-accent px-1 text-[0.68rem] font-semibold text-accent-ink tabular-nums">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

export function MobileMenu({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  // Links close the menu on click. This also closes it when the page is
  // hidden by navigation (Activity keeps state otherwise).
  // Close when this route is hidden by navigation (Activity keeps state otherwise).
  useLayoutEffect(() => () => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
        className="grid h-10 w-10 place-items-center rounded-full text-ink-2 hover:bg-paper-2 hover:text-ink"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>
      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-16 z-40 bg-paper animate-[rise_300ms_var(--ease-out-soft)_both]">
          <nav aria-label="Mobile" className="container-page flex flex-col pt-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="border-b border-line py-4 text-2xl font-medium tracking-tight"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/shop" className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-ink text-paper" onClick={() => setOpen(false)}>
              Shop Cards
            </Link>
            <Link href="/orders" className="py-4 text-center text-sm text-muted" onClick={() => setOpen(false)}>
              Track an order
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
