import "server-only";
import { site } from "@/config/site";
import { formatMoney } from "@/lib/money";
import { env, hasEmail } from "@/lib/server/env";
import type { OrderRow } from "@/lib/server/orders";

/**
 * Transactional email through Resend (https://resend.com). Swap `deliver` for
 * another provider if you prefer. Callers get `{ ok: false }` unless the
 * provider accepted the message, so we never claim an email was sent when it
 * wasn't.
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
  return `<!doctype html><html><body style="margin:0;background:#f6f5f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0e0e10">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:20px;padding:40px">
<tr><td style="font-weight:600;letter-spacing:0.2em;font-size:14px">${esc(site.name)}</td></tr>
<tr><td style="padding-top:28px"><h1 style="margin:0;font-size:26px;letter-spacing:-0.02em">${esc(title)}</h1></td></tr>
<tr><td style="padding-top:16px;font-size:15px;line-height:1.6;color:#3a3a3f">${bodyHtml}</td></tr>
<tr><td style="padding-top:32px;font-size:12px;color:#6b6b72">Questions? Reply to this email or write to ${esc(site.contact.email)}.</td></tr>
</table></td></tr></table></body></html>`;
}

export const templates = {
  orderConfirmation(order: OrderRow) {
    const subject = `Order ${order.number} confirmed`;
    const rows = [
      ["Subtotal", formatMoney(order.subtotal)],
      ...(order.discount ? [["Discount", `−${formatMoney(order.discount)}`]] : []),
      ["Shipping", order.shipping ? formatMoney(order.shipping) : "Free"],
      ["Total paid", formatMoney(order.total)],
    ];
    const html = layout(
      "Thanks, your order is confirmed.",
      `<p>We've received payment for order <strong>${esc(order.number)}</strong>. We'll program and test your cards, then email you tracking details when they ship.</p>
<table role="presentation" width="100%" style="margin-top:20px;border-top:1px solid #e2e0d9">${rows
        .map(([k, v]) => `<tr><td style="padding:10px 0;color:#6b6b72">${k}</td><td align="right" style="padding:10px 0">${v}</td></tr>`)
        .join("")}</table>
<p style="margin-top:20px">Custom designs: we'll send a digital proof for approval before production.</p>`,
    );
    const text = `Order ${order.number} confirmed.\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nWe'll email tracking details when your cards ship.`;
    return { subject, html, text };
  },

  shippingConfirmation(order: OrderRow, tracking: { carrier: string; number: string; url?: string }) {
    const subject = `Order ${order.number} has shipped`;
    const link = tracking.url ? `<p><a href="${esc(tracking.url)}" style="color:#0e0e10">Track your package</a></p>` : "";
    const html = layout(
      "Your cards are on the way.",
      `<p>Order <strong>${esc(order.number)}</strong> shipped with ${esc(tracking.carrier)}. Tracking number: <strong>${esc(tracking.number)}</strong>.</p>${link}
<p>When it arrives, hold the card near the top of your phone to test it.</p>`,
    );
    return { subject, html, text: `Order ${order.number} shipped with ${tracking.carrier}. Tracking: ${tracking.number} ${tracking.url ?? ""}` };
  },

  setupInstructions(order: OrderRow) {
    const subject = `Getting started with your ${site.name} card`;
    const html = layout(
      "Your card is ready to tap.",
      `<ol style="padding-left:18px">
<li>Make sure NFC is on. iPhone XS and newer read cards automatically; on Android, check Settings → Connected devices → NFC.</li>
<li>Hold the card flat against the top back of the phone for a second.</li>
<li>The link opens in the browser, with no app required.</li>
</ol>
<p>Your card is unlocked unless you asked us to lock it, so you can rewrite it later with a free NFC writing app. If it points to a page you control, just update that page.</p>
<p style="color:#6b6b72">Order ${esc(order.number)}</p>`,
    );
    return {
      subject,
      html,
      text: "1. Turn on NFC. 2. Hold the card against the top back of the phone. 3. The link opens in the browser.",
    };
  },

  quoteReceived(inquiry: { name: string; company: string; quantity: number }) {
    const subject = `We received your quote request`;
    const html = layout(
      `Thanks, ${inquiry.name.split(" ")[0]}.`,
      `<p>We've received your request for about <strong>${inquiry.quantity}</strong> cards for ${esc(inquiry.company)}. Our team will reply with pricing and next steps within two business days.</p>`,
    );
    return { subject, html, text: `We received your request for ${inquiry.quantity} cards for ${inquiry.company}. We'll reply within two business days.` };
  },

  quoteInternal(inquiry: Record<string, unknown>) {
    const subject = `New bulk quote request: ${String(inquiry.company)} (${String(inquiry.quantity)} cards)`;
    const rows = Object.entries(inquiry)
      .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#6b6b72">${esc(k)}</td><td>${esc(String(v ?? ""))}</td></tr>`)
      .join("");
    return { subject, html: layout("New quote request", `<table>${rows}</table>`), text: JSON.stringify(inquiry, null, 2) };
  },

  passwordReset(link: string) {
    return {
      subject: `Reset your ${site.name} password`,
      html: layout("Reset your password", `<p><a href="${esc(link)}" style="color:#0e0e10">Choose a new password</a>. This link expires in one hour. If you didn't ask for this, you can ignore this email.</p>`),
      text: `Reset your password: ${link}`,
    };
  },
};

export function sendOrderConfirmation(order: OrderRow) {
  return deliver({ to: order.email, ...templates.orderConfirmation(order) });
}

export function sendQuoteEmails(inquiry: { name: string; email: string; company: string; quantity: number } & Record<string, unknown>) {
  return Promise.all([
    deliver({ to: inquiry.email, ...templates.quoteReceived(inquiry) }),
    env.salesInbox
      ? deliver({ to: env.salesInbox, replyTo: inquiry.email, ...templates.quoteInternal(inquiry) })
      : Promise.resolve<EmailResult>({ ok: false, reason: "SALES_INBOX not set" }),
  ]);
}
