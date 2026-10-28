"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/server/admin-auth";
import { inquiryStatuses, setInquiryStatus } from "@/lib/server/inquiries";

export async function updateInquiryStatus(formData: FormData) {
  await requireAdmin();
  const parsed = z.object({ id: z.uuid(), status: z.enum(inquiryStatuses) }).safeParse({ id: formData.get("id"), status: formData.get("status") });
  if (!parsed.success) return;
  await setInquiryStatus(parsed.data.id, parsed.data.status);
  revalidatePath("/admin/inquiries");
}
