import "server-only";
import { site } from "@/config/site";
import { formatMoney } from "@/lib/money";
import { env, hasEmail } from "@/lib/server/env";
import type { OrderRow } from "@/lib/server/orders";

/**
 * Transactional email through Resend (https://resend.com). Swap `deliver`
 * for another provider if you prefer. Callers get `{ ok: false }` unless the
 * provider accepted the message, so the app never claims an email was sent
 * when it wasn't.
 */

export type EmailResult = { ok: true; id: string } | { ok: false; reason: string };

type Email = { to: string; subject: string; html: string; text: string; replyTo?: string };

async function deliver(email: Email): Promise<EmailResult> {
  if (!hasEmail()) return { ok: false, reason: "email provider not configured" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.emailFrom,
        to: [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text,
        reply_to: email.replyTo,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok || !data.id) return { ok: false, reason: data.message ?? `provider returned ${res.status}` };
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "network error" };
  }
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function layout(title: string, bodyHtml: string) {
  return `<!doctype html><html><body style="margin:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0b0b0f">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;padding:40px;border:1px solid #e6e6ea">
<tr><td style="font-weight:700;letter-spacing:0.18em;font-size:14px">${esc(site.name)}</td></tr>
<tr><td style="padding-top:28px"><h1 style="margin:0;font-size:24px;letter-spacing:-0.02em">${esc(title)}</h1></td></tr>
<tr><td style="padding-top:16px;font-size:15px;line-height:1.6;color:#3c3c43">${bodyHtml}</td></tr>
<tr><td style="padding-top:32px;font-size:12px;color:#6e6e76">Questions? Reply to this email or write to ${esc(site.contact.email)}.</td></tr>
</table></td></tr></table></body></html>`;
}

export const templates = {
  orderConfirmation(order: OrderRow) {
    const rows = [
      ["Subtotal", formatMoney(order.subtotal)],
      ...(order.discount ? [["Discount", `−${formatMoney(order.discount)}`]] : []),
      ["Shipping", order.shipping ? formatMoney(order.shipping) : "Free"],
      ["Total paid", formatMoney(order.total)],
    ];
    return {
      subject: `Order ${order.number} confirmed`,
      html: layout(
        "Thanks, your order is confirmed.",
        `<p>We've received payment for order <strong>${esc(order.number)}</strong>. We'll prepare and set up your cards, then email you when they ship.</p>
<table role="presentation" width="100%" style="margin-top:20px;border-top:1px solid #e6e6ea">${rows
          .map(([k, v]) => `<tr><td style="padding:10px 0;color:#6e6e76">${k}</td><td align="right" style="padding:10px 0">${v}</td></tr>`)
          .join("")}</table>
<p style="margin-top:20px">You can check your order status any time at ${esc(site.url)}/orders with your order number and email.</p>`,
      ),
      text: `Order ${order.number} confirmed.\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}`,
    };
  },

  shippingConfirmation(order: OrderRow) {
    const link = order.tracking_url ? `<p><a href="${esc(order.tracking_url)}" style="color:#3355ff">Track your package</a></p>` : "";
    return {
      subject: `Order ${order.number} has shipped`,
      html: layout(
        "Your cards are on the way.",
        `<p>Order <strong>${esc(order.number)}</strong> shipped${order.tracking_carrier ? ` with ${esc(order.tracking_carrier)}` : ""}.${
          order.tracking_number ? ` Tracking number: <strong>${esc(order.tracking_number)}</strong>.` : ""
        }</p>${link}<p>When it arrives, hold the card near the top of your phone to test it.</p>`,
      ),
      text: `Order ${order.number} shipped. ${order.tracking_carrier ?? ""} ${order.tracking_number ?? ""} ${order.tracking_url ?? ""}`,
    };
  },

  quoteReceived(inquiry: { name: string; company: string; quantity: number }) {
    return {
      subject: "We received your quote request",
      html: layout(
        `Thanks, ${esc(inquiry.name.split(" ")[0])}.`,
        `<p>We've received your request for about <strong>${inquiry.quantity}</strong> cards for ${esc(inquiry.company)}. We'll reply with pricing and next steps.</p>`,
      ),
      text: `We received your request for ${inquiry.quantity} cards for ${inquiry.company}.`,
    };
  },

  internal(title: string, data: Record<string, unknown>) {
    const rows = Object.entries(data)
      .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#6e6e76;vertical-align:top">${esc(k)}</td><td>${esc(String(v ?? ""))}</td></tr>`)
      .join("");
    return { subject: title, html: layout(title, `<table>${rows}</table>`), text: JSON.stringify(data, null, 2) };
  },
};

export function sendOrderConfirmation(order: OrderRow) {
  return deliver({ to: order.email, ...templates.orderConfirmation(order) });
}

export function sendShippingConfirmation(order: OrderRow) {
  return deliver({ to: order.email, ...templates.shippingConfirmation(order) });
}

export async function sendQuoteEmails(inquiry: { name: string; email: string; company: string; quantity: number } & Record<string, unknown>) {
  const [customer] = await Promise.all([
    deliver({ to: inquiry.email, ...templates.quoteReceived(inquiry) }),
    env.salesInbox
      ? deliver({ to: env.salesInbox, replyTo: inquiry.email, ...templates.internal(`Quote request: ${inquiry.company}`, inquiry) })
      : Promise.resolve<EmailResult>({ ok: false, reason: "SALES_INBOX not set" }),
  ]);
  return customer;
}

export function notifyContactMessage(message: { email: string } & Record<string, unknown>) {
  if (!env.salesInbox) return Promise.resolve<EmailResult>({ ok: false, reason: "SALES_INBOX not set" });
  return deliver({ to: env.salesInbox, replyTo: message.email, ...templates.internal("New contact message", message) });
}
