import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminBoundary, AdminHeader, fmtDateTime, Panel, Pill, StatusBadge, table } from "@/components/admin/ui";
import { DownloadIcon } from "@/components/ui/icons";
import { formatMoney } from "@/lib/money";
import { adminNextStatuses } from "@/lib/order-status";
import { requireAdmin } from "@/lib/server/admin-auth";
import { getOrder, getOrderItems } from "@/lib/server/orders";
import { NotesControl, StatusControl, TrackingControl } from "./order-controls";

export const metadata = { title: "Order" };

const customizationLabels: Record<string, string> = {
  printedName: "Printed name",
  jobTitle: "Job title",
  company: "Company",
  profileUrl: "Card opens",
  logoName: "Logo file",
};

async function OrderDetail({ params }: { params: PageProps<"/admin/orders/[id]">["params"] }) {
  await requireAdmin();
  const { id } = await params;
  const order = /^[0-9a-f-]{36}$/.test(id) ? await getOrder(id) : null;
  if (!order) notFound();
  const items = await getOrderItems(order.id);
  const a = order.shipping_address;

  return (
    <>
      <AdminHeader
        back={{ href: "/admin/orders", label: "Orders" }}
        title={order.number}
        description={`Placed ${fmtDateTime(order.created_at)}`}
        actions={<StatusBadge status={order.status} />}
      />
      {order.payment_provider === "dev" && (
        <p className="mb-6 rounded-2xl border border-dashed border-line-strong bg-card p-4 text-sm">
          Development order: created without Stripe. No payment was taken and it can&apos;t be marked paid.
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Panel title="Items">
            <div className={table.wrap}>
              <table className={table.table}>
                <thead>
                  <tr>
                    <th className={table.th}>Product</th>
                    <th className={table.th}>Customization</th>
                    <th className={`${table.th} text-right`}>Qty</th>
                    <th className={`${table.th} text-right`}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.id}>
                      <td className={table.td}>
                        <span className="block font-medium">{i.product_name}</span>
                        <span className="text-muted">
                          {i.variant_name} · {i.sku}
                        </span>
                      </td>
                      <td className={table.td}>
                        {i.customization ? (
                          <dl className="space-y-1">
                            {Object.entries(i.customization)
                              .filter(([k]) => k !== "logoUploadId")
                              .map(([k, v]) => (
                                <div key={k}>
                                  <dt className="inline text-muted">{customizationLabels[k] ?? k}: </dt>
                                  <dd className="inline break-all">{v}</dd>
                                </div>
                              ))}
                            {i.customization.logoUploadId && (
                              <a
                                href={`/api/admin/uploads/${i.customization.logoUploadId}`}
                                className="mt-1 inline-flex items-center gap-1.5 text-accent hover:underline"
                              >
                                <DownloadIcon size={14} /> Download logo
                              </a>
                            )}
                          </dl>
                        ) : (
                          <span className="text-muted">None</span>
                        )}
                      </td>
                      <td className={`${table.td} text-right tabular-nums`}>{i.quantity}</td>
                      <td className={`${table.td} text-right tabular-nums`}>{formatMoney(i.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="space-y-1.5 px-5 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums">{formatMoney(order.subtotal)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Discount ({order.discount_code})</dt>
                  <dd className="tabular-nums">−{formatMoney(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Shipping ({order.shipping_method})</dt>
                <dd className="tabular-nums">{formatMoney(order.shipping)}</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatMoney(order.total)}</dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Tracking">
            <div className="p-5">
              <TrackingControl orderId={order.id} carrier={order.tracking_carrier} number={order.tracking_number} url={order.tracking_url} />
            </div>
          </Panel>

          <Panel title="Internal notes">
            <div className="p-5">
              <NotesControl orderId={order.id} notes={order.notes} />
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Fulfillment">
            <div className="p-5">
              <StatusControl orderId={order.id} next={adminNextStatuses(order.status)} />
            </div>
          </Panel>
          <Panel title="Payment">
            <dl className="space-y-2 p-5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Status</dt>
                <dd>{order.paid_at ? <Pill tone="success">Paid</Pill> : <Pill>Not paid</Pill>}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Provider</dt>
                <dd>{order.payment_provider === "dev" ? "Development" : "Stripe"}</dd>
              </div>
              {order.amount_paid !== null && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Amount paid</dt>
                  <dd className="tabular-nums">{formatMoney(order.amount_paid)}</dd>
                </div>
              )}
              {order.paid_at && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Paid at</dt>
                  <dd>{fmtDateTime(order.paid_at)}</dd>
                </div>
              )}
              {order.stripe_payment_intent && (
                <div>
                  <dt className="text-muted">Payment intent</dt>
                  <dd className="break-all font-mono text-xs">{order.stripe_payment_intent}</dd>
                </div>
              )}
            </dl>
          </Panel>
          <Panel title="Customer">
            <div className="space-y-1 p-5 text-sm">
              <p className="font-medium">{a?.name}</p>
              <p>
                <a href={`mailto:${order.email}`} className="text-accent hover:underline">
                  {order.email}
                </a>
              </p>
              {order.phone && <p>{order.phone}</p>}
              <Link href={`/admin/customers?q=${encodeURIComponent(order.email)}`} className="inline-block pt-1 text-muted hover:text-ink">
                View customer
              </Link>
            </div>
          </Panel>
          <Panel title="Ship to">
            <address className="p-5 text-sm not-italic leading-relaxed">
              {a?.name}
              <br />
              {a?.line1}
              {a?.line2 && (
                <>
                  <br />
                  {a.line2}
                </>
              )}
              <br />
              {a?.city}, {a?.region} {a?.postalCode}
              <br />
              {a?.country}
            </address>
          </Panel>
        </div>
      </div>
    </>
  );
}

export default function AdminOrderPage(props: PageProps<"/admin/orders/[id]">) {
  return (
    <AdminBoundary>
      <OrderDetail params={props.params} />
    </AdminBoundary>
  );
}
