import "server-only";
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { env, hasAdmin } from "@/lib/server/env";

/**
 * Admin authentication.
 *
 * There is no default account. An administrator is configured with
 * ADMIN_EMAIL, ADMIN_PASSWORD_HASH (created with `npm run admin:hash`) and
 * ADMIN_SESSION_SECRET. A successful sign-in sets an HttpOnly, signed,
 * expiring session cookie. Every admin page, server action and admin route
 * calls requireAdmin() on the server; nothing relies on hidden UI.
 */

const COOKIE = "handshake_admin";
const SESSION_HOURS = 8;

function sign(payload: string) {
  return createHmac("sha256", env.adminSessionSecret!).update(payload).digest("base64url");
}

/** Verifies a password against an `scrypt:<salt>:<hash>` string. */
export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, Buffer.from(salt, "hex"), expected.length);
  return expected.length > 0 && timingSafeEqual(actual, expected);
}

export function checkCredentials(email: string, password: string): boolean {
  if (!hasAdmin()) return false;
  const emailOk = email.trim().toLowerCase() === env.adminEmail;
  // Always run the hash check so timing doesn't reveal whether the email matched.
  const passwordOk = verifyPassword(password, env.adminPasswordHash!);
  return emailOk && passwordOk;
}

export function createSessionToken(email: string, now = Date.now()): string {
  const payload = Buffer.from(JSON.stringify({ email, exp: now + SESSION_HOURS * 3600_000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined, now = Date.now()): { email: string } | null {
  if (!token || !hasAdmin()) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { email: string; exp: number };
    if (data.exp < now || data.email !== env.adminEmail) return null;
    return { email: data.email };
  } catch {
    return null;
  }
}

export async function startAdminSession(email: string) {
  (await cookies()).set(COOKIE, createSessionToken(email.trim().toLowerCase()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function endAdminSession() {
  (await cookies()).delete(COOKIE);
}

export async function getAdmin(): Promise<{ email: string } | null> {
  // Always a request-time check: never prerendered or cached.
  await connection();
  return readSessionToken((await cookies()).get(COOKIE)?.value);
}

/** Use at the top of every admin page and server action. Redirects to sign-in when not authorized. */
export async function requireAdmin(): Promise<{ email: string }> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** For admin route handlers: returns a 401 response when not authorized. */
export async function adminOrUnauthorized(): Promise<{ email: string } | Response> {
  const admin = await getAdmin();
  return admin ?? Response.json({ error: "Not authorized." }, { status: 401 });
}
