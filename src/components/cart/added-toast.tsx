"use client";

import Link from "next/link";
import { useEffect } from "react";
import { cart, useCart } from "@/lib/cart-store";
import { getProduct } from "@/lib/catalog";
import { CheckIcon, CloseIcon } from "@/components/ui/icons";

export function AddedToast() {
  const { lastAdded, lines } = useCart();
  const line = lastAdded ? lines.find((l) => l.key === lastAdded.key) : undefined;

  useEffect(() => {
    if (!lastAdded) return;
    const t = setTimeout(() => cart.dismissToast(), 5000);
    return () => clearTimeout(t);
  }, [lastAdded]);

  if (!lastAdded || !line) return null;
  const product = getProduct(line.slug);

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-ink p-3 pl-4 text-paper shadow-2xl animate-rise sm:left-auto sm:right-6 sm:bottom-6"
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-accent-ink">
        <CheckIcon size={16} />
      </span>
      <p className="min-w-0 flex-1 truncate text-sm">
        Added <span className="font-medium">{product?.name}</span> to your cart
      </p>
      <Link
        href="/cart"
        onClick={() => cart.dismissToast()}
        className="rounded-full bg-paper px-4 py-2 text-sm font-medium text-ink hover:bg-white"
      >
        View cart
      </Link>
      <button
        type="button"
        onClick={() => cart.dismissToast()}
        aria-label="Dismiss"
        className="grid h-8 w-8 place-items-center rounded-full text-paper/70 hover:text-paper"
      >
        <CloseIcon size={16} />
      </button>
    </div>
  );
}
