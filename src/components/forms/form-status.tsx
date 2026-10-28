import { AlertIcon, CheckIcon } from "@/components/ui/icons";

export type FormState = { state: "idle" } | { state: "success"; message: string } | { state: "error"; message: string };

/** Shared success / error banner for public forms. */
export function FormStatus({ status }: { status: FormState }) {
  if (status.state === "idle") return null;
  const ok = status.state === "success";
  return (
    <div role={ok ? "status" : "alert"} className={`flex gap-3 rounded-2xl p-4 text-sm leading-relaxed ${ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
      {ok ? <CheckIcon size={18} className="mt-0.5 shrink-0" /> : <AlertIcon size={18} className="mt-0.5 shrink-0" />}
      <p>{status.message}</p>
    </div>
  );
}

/** Posts JSON and maps the API's response to a form state. */
export async function postForm(url: string, body: unknown): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; message: string }> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (res.ok) return { ok: true, data };
    if (res.status === 429) return { ok: false, message: "Too many submissions. Please wait a few minutes and try again." };
    return { ok: false, message: typeof data.error === "string" ? data.error : "Something went wrong. Please try again." };
  } catch {
    return { ok: false, message: "We couldn't reach the server. Check your connection and try again." };
  }
}
