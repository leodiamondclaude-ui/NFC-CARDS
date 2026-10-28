import { PageTransition } from "@/components/motion/page-transition";

/** Animates between pages inside this section (e.g. the shop and a product). */
export default function SectionTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
