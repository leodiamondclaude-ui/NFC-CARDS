import Link from "next/link";
import { AdminBoundary, AdminHeader, Empty, fmtDate, Panel, SearchBar, StatusBadge, table } from "@/components/admin/ui";
import { formatMoney } from "@/lib/money";
import { orderStatuses, statusLabels } from "@/lib/order-status";
import { requireAdmin } from "@/lib/server/admin-auth";
import { listOrders } from "@/lib/server/orders";

export const metadata = { title: "Orders" };

async function Orders({ searchParams }: { searchParams: PageProps<"/admin/orders">["searchParams"] }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const status = typeof sp.status === "string" && (orderStatuses as readonly string[]).includes(sp.status) ? sp.status : "";
  const all = await listOrders();
  const orders = all.filter(
    (o) =>
      (!status || o.status === status) &&
      (!q || o.number.toLowerCase().includes(q) || o.email.includes(q) || o.shipping_address?.name?.toLowerCase().includes(q)),
  );

  return (
    <>
      <AdminHeader title="Orders" description={`${orders.length} of ${all.length} orders`} />
      <SearchBar placeholder="Order number, email or name" defaultValue={q}>
        <label htmlFor="status-filter" className="sr-only">
          Status
        </label>
        <select id="status-filter" name="status" defaultValue={status} className="field max-w-[12rem] py-2 text-sm">
          <option value="">All statuses</option>
          {orderStatuses.map((s) => (
            <option key={s} value={s}>
              {statusLabels[s]}
            </option>
          ))}
        </select>
      </SearchBar>
      {(q || status) && (
        <Link href="/admin/orders" className="-mt-2 mb-4 inline-block text-sm text-muted hover:text-ink">
          Clear filters
        </Link>
      )}
      <Panel>
        {orders.length === 0 ? (
          <Empty>{all.length ? "No orders match these filters." : "No orders yet."}</Empty>
        ) : (
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>Order</th>
                  <th className={table.th}>Customer</th>
                  <th className={table.th}>Date</th>
                  <th className={table.th}>Status</th>
                  <th className={table.th}>Payment</th>
                  <th className={`${table.th} text-right`}>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-paper-2/60">
                    <td className={table.td}>
                      <Link href={`/admin/orders/${o.id}`} className="font-mono font-medium hover:underline">
                        {o.number}
                      </Link>
                    </td>
                    <td className={table.td}>
                      <span className="block">{o.shipping_address?.name}</span>
                      <span className="text-muted">{o.email}</span>
                    </td>
                    <td className={table.td}>{fmtDate(o.created_at)}</td>
                    <td className={table.td}>
                      <StatusBadge status={o.status} />
                    </td>
                    <td className={`${table.td} text-muted`}>{o.payment_provider === "dev" ? "Dev (unpaid)" : o.paid_at ? "Stripe, paid" : "Stripe"}</td>
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

export default function AdminOrdersPage(props: PageProps<"/admin/orders">) {
  return (
    <AdminBoundary>
      <Orders searchParams={props.searchParams} />
    </AdminBoundary>
  );
}
