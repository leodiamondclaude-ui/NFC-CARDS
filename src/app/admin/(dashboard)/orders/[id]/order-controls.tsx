"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { statusLabels, type OrderStatus } from "@/lib/order-status";
import { saveNotes, saveTracking, updateStatus, type ActionState } from "../actions";

function Result({ state }: { state: ActionState }) {
  if (!state.message) return null;
  return (
    <p role={state.ok ? "status" : "alert"} className={`text-sm ${state.ok ? "text-success" : "text-danger"}`}>
      {state.message}
    </p>
  );
}

export function StatusControl({ orderId, next }: { orderId: string; next: OrderStatus[] }) {
  const [state, action, pending] = useActionState(updateStatus.bind(null, orderId), {});
  if (!next.length) return <p className="text-sm text-muted">This order is in a final state.</p>;
  return (
    <form action={action} className="space-y-3">
      <label htmlFor="status" className="block text-sm font-medium">
        Change status
      </label>
      <div className="flex gap-2">
        <select id="status" name="status" className="field py-2 text-sm">
          {next.map((s) => (
            <option key={s} value={s}>
              {statusLabels[s]}
            </option>
          ))}
        </select>
        <Button type="submit" size="sm" className="h-auto" disabled={pending}>
          Update
        </Button>
      </div>
      <p className="text-xs text-muted">Orders become Paid only through a verified Stripe payment.</p>
      <Result state={state} />
    </form>
  );
}

export function TrackingControl({ orderId, carrier, number, url }: { orderId: string; carrier: string | null; number: string | null; url: string | null }) {
  const [state, action, pending] = useActionState(saveTracking.bind(null, orderId), {});
  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="carrier" className="mb-1 block text-sm font-medium">
            Carrier
          </label>
          <input id="carrier" name="carrier" defaultValue={carrier ?? ""} className="field py-2 text-sm" placeholder="USPS" />
        </div>
        <div>
          <label htmlFor="tracking" className="mb-1 block text-sm font-medium">
            Tracking number
          </label>
          <input id="tracking" name="number" defaultValue={number ?? ""} className="field py-2 font-mono text-sm" />
        </div>
      </div>
      <div>
        <label htmlFor="tracking-url" className="mb-1 block text-sm font-medium">
          Tracking link <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="tracking-url" name="url" type="url" defaultValue={url ?? ""} className="field py-2 text-sm" placeholder="https://" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="notify" className="accent-[var(--accent)]" /> Email tracking details to the customer
      </label>
      <Button type="submit" size="sm" disabled={pending}>
        Save tracking
      </Button>
      <Result state={state} />
    </form>
  );
}

export function NotesControl({ orderId, notes }: { orderId: string; notes: string | null }) {
  const [state, action, pending] = useActionState(saveNotes.bind(null, orderId), {});
  return (
    <form action={action} className="space-y-3">
      <label htmlFor="notes" className="sr-only">
        Internal notes
      </label>
      <textarea id="notes" name="notes" rows={4} defaultValue={notes ?? ""} className="field text-sm" placeholder="Visible to admins only" />
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        Save notes
      </Button>
      <Result state={state} />
    </form>
  );
}
