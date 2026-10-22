import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
  inverse = false,
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
  align?: "left" | "center";
  inverse?: boolean;
  id?: string;
}) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && <p className={`eyebrow ${inverse ? "!text-paper/50" : ""}`}>{eyebrow}</p>}
      <h2 id={id} className={`display mt-3 text-[2.1rem] sm:text-[2.75rem] ${inverse ? "text-paper" : ""}`}>
        {title}
      </h2>
      {body && <p className={`mt-4 text-lg leading-relaxed ${inverse ? "text-paper/65" : "text-muted"}`}>{body}</p>}
    </div>
  );
}

export function PageHero({ eyebrow, title, body }: { eyebrow: string; title: ReactNode; body?: ReactNode }) {
  return (
    <section className="border-b border-line">
      <div className="container-page py-16 md:py-24">
        <p className="eyebrow animate-rise">{eyebrow}</p>
        <h1 className="display mt-4 max-w-3xl text-[2.6rem] animate-rise sm:text-[3.75rem]">{title}</h1>
        {body && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted animate-rise">{body}</p>}
      </div>
    </section>
  );
}
