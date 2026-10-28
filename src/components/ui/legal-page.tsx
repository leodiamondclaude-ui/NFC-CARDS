import type { ReactNode } from "react";
import { site } from "@/config/site";
import { InfoIcon } from "@/components/ui/icons";

/**
 * Policy page shell. The policy text in src/app/{privacy,terms,shipping,returns}
 * is a starting template built from src/config/site.ts. Have it reviewed for
 * your business and jurisdiction, then set `site.legalName` to hide the notice.
 */
export function LegalPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow">Policies</p>
        <h1 className="display mt-4 text-[2.4rem] sm:text-[3rem]">{title}</h1>
        {intro && <p className="mt-5 text-lg leading-relaxed text-muted">{intro}</p>}
        {!site.legalName && (
          <p className="mt-8 flex gap-2.5 rounded-2xl border border-dashed border-line-strong bg-paper-2 p-4 text-sm leading-relaxed text-ink-2">
            <InfoIcon size={18} className="mt-0.5 shrink-0" />
            This policy is a template. The business details, legal entity and final terms still need to be confirmed and
            reviewed before launch.
          </p>
        )}
        <div className="prose-legal mt-10">{children}</div>
        <p className="mt-12 text-sm text-muted">
          {site.legalName ? `${site.name} is operated by ${site.legalName}.` : `${site.name} (legal entity to be confirmed).`} Questions:{" "}
          {site.contact.email}
        </p>
      </div>
    </div>
  );
}
