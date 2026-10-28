import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = { title: "Cart", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="container-page py-12 md:py-16">
      <h1 className="display mb-10 text-[2.4rem] sm:text-[3rem]">Your cart</h1>
      <CartView />
    </div>
  );
}
