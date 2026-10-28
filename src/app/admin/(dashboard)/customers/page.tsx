import Link from "next/link";
import { AdminBoundary, AdminHeader, Empty, fmtDate, Panel, SearchBar, table } from "@/components/admin/ui";
import { formatMoney } from "@/lib/money";
import { revenueStatuses } from "@/lib/order-status";
import { requireAdmin } from "@/lib/server/admin-auth";
import { listCustomers, listOrders } from "@/lib/server/orders";

export const metadata = { title: "Customers" };

async function Customers({ searchParams }: { searchParams: PageProps<"/admin/customers">["searchParams"] }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const [customers, orders] = await Promise.all([listCustomers(), listOrders()]);
  const rows = customers
    .filter((c) => !q || c.email.includes(q) || c.name.toLowerCase().includes(q))
    .map((c) => {
      const theirs = orders.filter((o) => o.customer_id === c.id);
      const paid = theirs.filter((o) => revenueStatuses.includes(o.status) && o.paid_at);
      return { ...c, orders: theirs, spent: paid.reduce((s, o) => s + (o.amount_paid ?? 0), 0), last: theirs[0]?.created_at };
    });

  return (
    <>
      <AdminHeader title="Customers" description="Created automatically from checkout. Guest checkout stays available." />
      <SearchBar placeholder="Name or email" defaultValue={q} />
      <Panel>
        {rows.length === 0 ? (
          <Empty>{customers.length ? "No customers match that search." : "No customers yet."}</Empty>
        ) : (
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>Customer</th>
                  <th className={table.th}>Phone</th>
                  <th className={`${table.th} text-right`}>Orders</th>
                  <th className={`${table.th} text-right`}>Paid total</th>
                  <th className={table.th}>Last order</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td className={table.td}>
                      <span className="block font-medium">{c.name}</span>
                      <a href={`mailto:${c.email}`} className="text-muted hover:text-ink">
                        {c.email}
                      </a>
                    </td>
                    <td className={`${table.td} text-muted`}>{c.phone ?? "—"}</td>
                    <td className={`${table.td} text-right tabular-nums`}>
                      <Link href={`/admin/orders?q=${encodeURIComponent(c.email)}`} className="hover:underline">
                        {c.orders.length}
                      </Link>
                    </td>
                    <td className={`${table.td} text-right tabular-nums`}>{formatMoney(c.spent)}</td>
                    <td className={table.td}>{c.last ? fmtDate(c.last) : "—"}</td>
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

export default function AdminCustomersPage(props: PageProps<"/admin/customers">) {
  return (
    <AdminBoundary>
      <Customers searchParams={props.searchParams} />
    </AdminBoundary>
  );
}
