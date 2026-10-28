import "server-only";
import { headers } from "next/headers";

/**
 * Small fixed-window rate limiter kept in memory. It protects public
 * endpoints from casual abuse on a single server. On multi-instance or
 * serverless hosting, add a shared limiter (for example your host's WAF or
 * a Redis-backed limiter) as noted in the README.
 */

const buckets = new Map<string, { count: number; resetAt: number }>();

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function rateLimit(name: string, limit: number, windowMs: number): Promise<{ ok: boolean; retryAfter: number }> {
  const key = `${name}:${await clientIp()}`;
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 10_000) for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    return { ok: true, retryAfter: 0 };
  }
  bucket.count += 1;
  return bucket.count > limit ? { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) } : { ok: true, retryAfter: 0 };
}

export function tooManyRequests(retryAfter: number) {
  return Response.json(
    { error: "Too many requests. Please wait a moment and try again." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}
