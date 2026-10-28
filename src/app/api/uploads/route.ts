import { limits } from "@/config/site";
import { rateLimit, tooManyRequests } from "@/lib/server/rate-limit";
import { storeCustomerUpload } from "@/lib/server/uploads";

/** Accepts one logo file and returns an opaque id. No public URL is ever returned. */
export async function POST(request: Request) {
  const limit = await rateLimit("uploads", 20, 10 * 60_000);
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > limits.upload.maxBytes + 64 * 1024) {
    return Response.json({ error: `Use a ${limits.upload.label} file.` }, { status: 413 });
  }
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file received." }, { status: 400 });

  const result = await storeCustomerUpload(file);
  if (!result.ok) return Response.json({ error: result.error }, { status: result.status });
  return Response.json({ id: result.id });
}
