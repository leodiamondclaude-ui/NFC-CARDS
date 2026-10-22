import type { ReactNode } from "react";

/**
 * Policy page shell. The policy text in src/app/{privacy,terms,shipping,returns}
 * is a starting template: have it reviewed for your jurisdiction before launch.
 */
export function LegalPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow">Policies</p>
        <h1 className="display mt-4 text-[2.4rem] sm:text-[3rem]">{title}</h1>
        {intro && <p className="mt-5 text-lg leading-relaxed text-muted">{intro}</p>}
        <div className="prose-legal mt-10">{children}</div>
      </div>
    </div>
  );
}
