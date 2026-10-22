import type { Faq } from "@/config/content";
import { ChevronDownIcon } from "@/components/ui/icons";

/** Native <details> accordion: accessible and works without JavaScript. */
export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((f) => (
        <details key={f.q} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-[1.05rem] font-medium [&::-webkit-details-marker]:hidden">
            {f.q}
            <ChevronDownIcon className="shrink-0 text-muted transition-transform duration-300 group-open:rotate-180" />
          </summary>
          <p className="max-w-3xl pb-6 leading-relaxed text-ink-2">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
