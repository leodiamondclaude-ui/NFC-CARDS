import Link from "next/link";
import { AdminBoundary, AdminHeader, Empty, fmtDate, Panel, StatusBadge, table } from "@/components/admin/ui";
import { formatMoney } from "@/lib/money";
import { revenueStatuses } from "@/lib/order-status";
import { requireAdmin } from "@/lib/server/admin-auth";
import { readCatalog } from "@/lib/server/catalog";
import { listInquiries } from "@/lib/server/inquiries";
import { listOrders } from "@/lib/server/orders";
import { stripeMode, hasEmail, hasSupabase } from "@/lib/server/env";

export const metadata = { title: "Overview" };

async function Overview() {
  await requireAdmin();
  const [orders, products, inquiries] = await Promise.all([listOrders(), readCatalog(), listInquiries()]);
  const paid = orders.filter((o) => revenueStatuses.includes(o.status) && o.payment_provider === "stripe");
  const revenue = paid.reduce((s, o) => s + (o.amount_paid ?? 0), 0);
  const toFulfill = orders.filter((o) => o.status === "paid" || o.status === "processing").length;
  const pendingPayment = orders.filter((o) => o.status === "pending_payment").length;
  const newInquiries = inquiries.filter((i) => i.status === "new").length;
  const mode = stripeMode();

  const stats = [
    { label: "Total orders", value: orders.length, href: "/admin/orders" },
    { label: "Revenue (paid orders)", value: formatMoney(revenue), href: "/admin/orders?status=paid" },
    { label: "To fulfill", value: toFulfill, href: "/admin/orders?status=paid" },
    { label: "Pending payment", value: pendingPayment, href: "/admin/orders?status=pending_payment" },
    { label: "Products", value: `${products.filter((p) => p.active).length} / ${products.length}`, href: "/admin/products", hint: "active / total" },
    { label: "New inquiries", value: newInquiries, href: "/admin/inquiries" },
  ];

  return (
    <>
      <AdminHeader title="Overview" description="Revenue counts only orders whose payment was confirmed by Stripe." />
      <div className="mb-6 flex flex-wrap gap-2 text-xs">
        <span className={`rounded-full px-3 py-1 ${mode === "live" || mode === "test" ? "bg-success/10 text-success" : "bg-paper text-ink-2 ring-1 ring-line"}`}>
          Payments: {mode === "live" ? "Stripe live" : mode === "test" ? "Stripe test mode" : mode === "dev" ? "Development (no payments)" : "Not configured"}
        </span>
        <span className={`rounded-full px-3 py-1 ${hasSupabase() ? "bg-success/10 text-success" : "bg-paper text-ink-2 ring-1 ring-line"}`}>
          Database: {hasSupabase() ? "Supabase" : "Local dev store (.data/)"}
        </span>
        <span className={`rounded-full px-3 py-1 ${hasEmail() ? "bg-success/10 text-success" : "bg-paper text-ink-2 ring-1 ring-line"}`}>
          Email: {hasEmail() ? "Resend" : "Not configured (emails are logged, not sent)"}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl border border-line bg-card p-5 transition-colors hover:border-line-strong">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">{s.value}</p>
            {s.hint && <p className="mt-1 text-xs text-muted">{s.hint}</p>}
          </Link>
        ))}
      </div>
      <Panel title="Recent orders" className="mt-8" actions={<Link href="/admin/orders" className="text-sm text-muted hover:text-ink">View all</Link>}>
        {orders.length === 0 ? (
          <Empty>No orders yet.</Empty>
        ) : (
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>Order</th>
                  <th className={table.th}>Customer</th>
                  <th className={table.th}>Date</th>
                  <th className={table.th}>Status</th>
                  <th className={`${table.th} text-right`}>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map((o) => (
                  <tr key={o.id} className="hover:bg-paper-2/60">
                    <td className={table.td}>
                      <Link href={`/admin/orders/${o.id}`} className="font-mono font-medium hover:underline">
                        {o.number}
                      </Link>
                    </td>
                    <td className={table.td}>{o.email}</td>
                    <td className={table.td}>{fmtDate(o.created_at)}</td>
                    <td className={table.td}>
                      <StatusBadge status={o.status} />
                    </td>
                    <td className={`${table.td} text-right tabular-nums`}>{formatMoney(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}

export default function AdminOverviewPage() {
  return (
    <AdminBoundary>
      <Overview />
    </AdminBoundary>
  );
}
