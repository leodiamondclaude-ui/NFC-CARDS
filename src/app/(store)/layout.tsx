import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AddedToast } from "@/components/cart/added-toast";
import { Analytics } from "@/components/marketing/analytics";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <AddedToast />
      <Analytics />
    </>
  );
}
