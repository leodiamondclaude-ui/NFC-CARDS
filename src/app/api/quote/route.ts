import { randomUUID } from "node:crypto";
import { quoteSchema } from "@/lib/schemas";
import { insert } from "@/lib/server/store";
import { sendQuoteEmails } from "@/lib/server/email";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Please check the form.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const inquiry = { id: randomUUID(), ...parsed.data, status: "new", created_at: new Date().toISOString() };
  try {
    await insert("bulk_inquiries", inquiry);
  } catch (error) {
    console.error("[quote] could not save inquiry", error);
    return Response.json({ error: "We couldn't save your request. Please email us instead." }, { status: 500 });
  }

  const [customer] = await sendQuoteEmails(inquiry);
  return Response.json({ ok: true, confirmationEmailSent: customer.ok });
}
