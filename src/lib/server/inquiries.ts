import "server-only";
import { randomUUID } from "node:crypto";
import type { z } from "zod";
import type { contactMessageSchema, quoteSchema } from "@/lib/schemas";
import { insert, list, update, type Row } from "@/lib/server/store";

export const inquiryStatuses = ["new", "contacted", "quoted", "won", "closed"] as const;
export type InquiryStatus = (typeof inquiryStatuses)[number];

export type InquiryRow = Row & {
  name: string;
  email: string;
  company: string;
  quantity: number;
  inquiry_type: string;
  details: string;
  status: InquiryStatus;
  created_at: string;
};

export type ContactMessageRow = Row & {
  name: string;
  email: string;
  order_number: string | null;
  message: string;
  created_at: string;
};

export function saveInquiry(data: z.output<typeof quoteSchema>) {
  return insert<InquiryRow>("bulk_inquiries", {
    id: randomUUID(),
    name: data.name,
    email: data.email.toLowerCase(),
    company: data.company,
    quantity: data.quantity,
    inquiry_type: data.inquiryType,
    details: data.details,
    status: "new",
    created_at: new Date().toISOString(),
  });
}

export function saveContactMessage(data: z.output<typeof contactMessageSchema>) {
  return insert<ContactMessageRow>("contact_messages", {
    id: randomUUID(),
    name: data.name,
    email: data.email.toLowerCase(),
    order_number: data.orderNumber || null,
    message: data.message,
    created_at: new Date().toISOString(),
  });
}

export const listInquiries = () => list<InquiryRow>("bulk_inquiries", { order: { column: "created_at" } });
export const listContactMessages = () => list<ContactMessageRow>("contact_messages", { order: { column: "created_at" } });
export const setInquiryStatus = (id: string, status: InquiryStatus) => update<InquiryRow>("bulk_inquiries", id, { status });
