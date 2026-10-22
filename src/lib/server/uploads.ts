import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { limits } from "@/config/site";
import { env, hasSupabase } from "@/lib/server/env";

/**
 * Private storage for customer artwork. Files are never written to /public
 * and never get a public URL. In production they go to a private Supabase
 * Storage bucket; staff access them with short-lived signed URLs.
 */

/** Detects the real file type from its first bytes rather than trusting the browser. */
export function sniffType(bytes: Uint8Array): string | null {
  const starts = (sig: number[]) => sig.every((b, i) => bytes[i] === b);
  if (starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (starts([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (starts([0x25, 0x50, 0x44, 0x46, 0x2d])) return "application/pdf";
  const head = new TextDecoder().decode(bytes.slice(0, 1024)).trimStart().toLowerCase();
  if ((head.startsWith("<?xml") || head.startsWith("<svg") || head.startsWith("<!--")) && head.includes("<svg"))
    return "image/svg+xml";
  return null;
}

export type UploadResult = { ok: true; id: string } | { ok: false; status: number; error: string };

export async function storeUpload(file: File): Promise<UploadResult> {
  if (file.size === 0) return { ok: false, status: 400, error: "The file is empty." };
  if (file.size > limits.upload.maxBytes)
    return { ok: false, status: 413, error: `Files must be under ${limits.upload.maxBytes / 1024 / 1024} MB.` };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffType(bytes);
  const ext = type ? limits.upload.types[type] : undefined;
  if (!type || !ext) return { ok: false, status: 415, error: "Use a PNG, JPG, SVG or PDF file." };

  const id = `${randomBytes(16).toString("hex")}.${ext}`;

  if (hasSupabase()) {
    const res = await fetch(`${env.supabaseUrl}/storage/v1/object/${env.uploadsBucket}/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
        "Content-Type": type,
        "x-upsert": "false",
      },
      body: bytes,
    });
    if (!res.ok) {
      console.error("[uploads] Supabase storage error", res.status, await res.text());
      return { ok: false, status: 502, error: "Upload failed. Please try again." };
    }
    return { ok: true, id };
  }

  const dir = path.join(process.cwd(), env.dataDir, "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, id), bytes);
  return { ok: true, id };
}
