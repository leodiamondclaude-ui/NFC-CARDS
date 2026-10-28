import { contactMessageSchema } from "@/lib/schemas";
import { notifyContactMessage } from "@/lib/server/email";
import { saveContactMessage } from "@/lib/server/inquiries";
import { rateLimit, tooManyRequests } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  const limit = await rateLimit("contact", 5, 10 * 60_000);
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const parsed = contactMessageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Please check the form.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  if (parsed.data.website) return Response.json({ ok: true });

  try {
    const saved = await saveContactMessage(parsed.data);
    await notifyContactMessage({ ...parsed.data, id: saved.id });
  } catch (error) {
    console.error("[contact] could not save message", error);
    return Response.json({ error: "We couldn't send your message. Please email us instead." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
