import { AdminBoundary, AdminHeader, Empty, fmtDateTime, Panel, Pill } from "@/components/admin/ui";
import { inquiryTypes } from "@/lib/schemas";
import { requireAdmin } from "@/lib/server/admin-auth";
import { inquiryStatuses, listContactMessages, listInquiries } from "@/lib/server/inquiries";
import { updateInquiryStatus } from "./actions";

export const metadata = { title: "Inquiries" };

const typeLabel = Object.fromEntries(inquiryTypes.map((t) => [t.id, t.label]));

async function Inquiries({ searchParams }: { searchParams: PageProps<"/admin/inquiries">["searchParams"] }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = typeof sp.status === "string" && (inquiryStatuses as readonly string[]).includes(sp.status) ? sp.status : "";
  const [inquiries, messages] = await Promise.all([listInquiries(), listContactMessages()]);
  const shown = status ? inquiries.filter((i) => i.status === status) : inquiries;

  return (
    <>
      <AdminHeader title="Inquiries" description="Quote requests from the For Business page, and contact form messages." />
      <form className="mb-5 flex gap-2">
        <label htmlFor="inq-status" className="sr-only">
          Status
        </label>
        <select id="inq-status" name="status" defaultValue={status} className="field max-w-[12rem] py-2 text-sm">
          <option value="">All statuses</option>
          {inquiryStatuses.map((s) => (
            <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <button type="submit" className="h-10 rounded-full bg-ink px-5 text-sm font-medium text-paper">
          Filter
        </button>
      </form>

      <Panel title={`Quote requests (${shown.length})`}>
        {shown.length === 0 ? (
          <Empty>{inquiries.length ? "No requests with this status." : "No quote requests yet."}</Empty>
        ) : (
          <ul className="divide-y divide-line">
            {shown.map((i) => (
              <li key={i.id} className="px-5 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {i.company} <span className="font-normal text-muted">· {i.name}</span>
                    </p>
                    <p className="text-sm text-muted">
                      <a href={`mailto:${i.email}`} className="hover:text-ink">
                        {i.email}
                      </a>{" "}
                      · {fmtDateTime(i.created_at)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Pill tone="accent">{typeLabel[i.inquiry_type] ?? i.inquiry_type}</Pill>
                      <Pill>~{i.quantity.toLocaleString()} cards</Pill>
                    </div>
                  </div>
                  <form action={updateInquiryStatus} className="flex shrink-0 gap-2">
                    <input type="hidden" name="id" value={i.id} />
                    <label htmlFor={`st-${i.id}`} className="sr-only">
                      Status
                    </label>
                    <select id={`st-${i.id}`} name="status" defaultValue={i.status} className="field py-1.5 text-sm">
                      {inquiryStatuses.map((s) => (
                        <option key={s} value={s}>
                          {s[0].toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="rounded-full border border-line-strong px-3 text-sm hover:border-ink">
                      Save
                    </button>
                  </form>
                </div>
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer text-muted hover:text-ink">Project details</summary>
                  <p className="mt-2 whitespace-pre-wrap rounded-xl bg-paper-2 p-3 leading-relaxed">{i.details}</p>
                </details>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title={`Contact messages (${messages.length})`} className="mt-8">
        {messages.length === 0 ? (
          <Empty>No messages yet.</Empty>
        ) : (
          <ul className="divide-y divide-line">
            {messages.map((m) => (
              <li key={m.id} className="px-5 py-4 text-sm">
                <p className="font-medium">
                  {m.name}{" "}
                  <a href={`mailto:${m.email}`} className="font-normal text-muted hover:text-ink">
                    {m.email}
                  </a>
                </p>
                <p className="text-muted">
                  {fmtDateTime(m.created_at)}
                  {m.order_number && ` · Order ${m.order_number}`}
                </p>
                <p className="mt-2 whitespace-pre-wrap leading-relaxed">{m.message}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}

export default function AdminInquiriesPage(props: PageProps<"/admin/inquiries">) {
  return (
    <AdminBoundary>
      <Inquiries searchParams={props.searchParams} />
    </AdminBoundary>
  );
}
