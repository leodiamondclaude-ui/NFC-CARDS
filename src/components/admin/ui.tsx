import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { statusLabels, type OrderStatus } from "@/lib/order-status";

export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

const tone: Record<OrderStatus, string> = {
  pending_payment: "bg-paper-2 text-ink-2",
  paid: "bg-accent-soft text-accent",
  processing: "bg-[#fff4e0] text-[#8a5a00]",
  shipped: "bg-[#e6f4ff] text-[#0b5cad]",
  delivered: "bg-success/10 text-success",
  canceled: "bg-paper-2 text-muted line-through decoration-1",
  refunded: "bg-danger/10 text-danger",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${tone[status]}`}>{statusLabels[status]}</span>;
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "accent" | "success" | "danger" }) {
  const t = { neutral: "bg-paper-2 text-ink-2", accent: "bg-accent-soft text-accent", success: "bg-success/10 text-success", danger: "bg-danger/10 text-danger" }[tone];
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${t}`}>{children}</span>;
}

export function AdminHeader({ title, description, actions, back }: { title: string; description?: ReactNode; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back && (
          <Link href={back.href} className="mb-2 inline-block text-sm text-muted hover:text-ink">
            ← {back.label}
          </Link>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, children, className = "", actions }: { title?: string; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={`rounded-2xl border border-line bg-card ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
          <h2 className="text-sm font-semibold">{title}</h2>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="px-5 py-12 text-center text-sm text-muted">{children}</p>;
}

/** Table styles shared by admin lists. */
export const table = {
  wrap: "overflow-x-auto",
  table: "w-full min-w-[40rem] text-left text-sm",
  th: "border-b border-line px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted",
  td: "border-b border-line px-5 py-3.5 align-top",
};

export function AdminLoading() {
  return (
    <div aria-label="Loading" className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-paper-2" />
      <div className="h-64 animate-pulse rounded-2xl bg-paper-2" />
    </div>
  );
}

/** Every admin page renders its content inside this boundary; the content itself calls requireAdmin(). */
export function AdminBoundary({ children }: { children: ReactNode }) {
  return <Suspense fallback={<AdminLoading />}>{children}</Suspense>;
}

export function SearchBar({ placeholder, defaultValue, children }: { placeholder: string; defaultValue?: string; children?: ReactNode }) {
  return (
    <form className="mb-5 flex flex-col gap-2 sm:flex-row" role="search">
      <label htmlFor="admin-q" className="sr-only">
        Search
      </label>
      <input id="admin-q" name="q" defaultValue={defaultValue} placeholder={placeholder} className="field max-w-md py-2 text-sm" />
      {children}
      <button type="submit" className="h-10 rounded-full bg-ink px-5 text-sm font-medium text-paper">
        Search
      </button>
    </form>
  );
}
