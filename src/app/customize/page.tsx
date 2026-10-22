import type { Metadata } from "next";
import { getAllProducts } from "@/lib/catalog";
import { Configurator } from "@/components/shop/configurator";

export const metadata: Metadata = {
  title: "Design your card",
  description: "Choose a card style and finish, add your name or logo, and set what opens when someone taps.",
};

export default function CustomizePage() {
  const products = getAllProducts().filter((p) => p.form === "card" && p.unitsPerPack === 1);
  return (
    <div className="container-page py-10 md:py-14">
      <Configurator
        products={products}
        initialSlug="classic"
        allowProductChoice
        header={
          <div>
            <p className="eyebrow">Card customizer</p>
            <h1 className="display mt-3 text-[2.4rem] sm:text-[3rem]">Design your card.</h1>
            <p className="mt-4 leading-relaxed text-muted">
              Pick the physical card, then choose what it opens. We save your setup with your order and program the
              chip before shipping, so there&apos;s nothing to install.
            </p>
          </div>
        }
      />
    </div>
  );
}
