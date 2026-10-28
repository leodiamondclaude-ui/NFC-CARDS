import { quoteSchema } from "@/lib/schemas";
import { sendQuoteEmails } from "@/lib/server/email";
import { saveInquiry } from "@/lib/server/inquiries";
import { rateLimit, tooManyRequests } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  const limit = await rateLimit("quote", 5, 10 * 60_000);
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const parsed = quoteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Please check the form.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  // Honeypot filled in: pretend success without storing anything.
  if (parsed.data.website) return Response.json({ ok: true, emailed: false });

  let inquiry;
  try {
    inquiry = await saveInquiry(parsed.data);
  } catch (error) {
    console.error("[quote] could not save inquiry", error);
    return Response.json({ error: "We couldn't save your request. Please email us instead." }, { status: 500 });
  }
  const email = await sendQuoteEmails({ ...parsed.data, id: inquiry.id });
  return Response.json({ ok: true, emailed: email.ok });
}
