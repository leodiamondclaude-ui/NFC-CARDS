"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { checkCredentials, endAdminSession, startAdminSession } from "@/lib/server/admin-auth";
import { rateLimit } from "@/lib/server/rate-limit";

export type LoginState = { error?: string; email?: string };

const loginSchema = z.object({ email: z.string().trim().max(200), password: z.string().min(1).max(200) });

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const limit = await rateLimit("admin-login", 5, 15 * 60_000);
  if (!limit.ok) return { error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfter / 60)} minutes.`, email };
  const parsed = loginSchema.safeParse({ email, password: formData.get("password") });
  if (!parsed.success || !checkCredentials(parsed.data.email, parsed.data.password)) {
    return { error: "That email and password don't match.", email };
  }
  await startAdminSession(parsed.data.email);
  redirect("/admin");
}

export async function logout() {
  await endAdminSession();
  redirect("/admin/login");
}
