import { limits } from "@/config/site";
import { storeUpload } from "@/lib/server/uploads";

/** Accepts one artwork file and returns an opaque id. No public URL is ever returned. */
export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > limits.upload.maxBytes + 64 * 1024) {
    return Response.json({ error: "Files must be under 10 MB." }, { status: 413 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Invalid upload." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file received." }, { status: 400 });

  const result = await storeUpload(file);
  if (!result.ok) return Response.json({ error: result.error }, { status: result.status });
  return Response.json({ id: result.id });
}
