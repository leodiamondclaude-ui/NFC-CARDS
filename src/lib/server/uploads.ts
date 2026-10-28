import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { limits } from "@/config/site";
import { env, hasSupabase } from "@/lib/server/env";

/**
 * File storage.
 *
 * Customer logos go to private storage (a private Supabase bucket, or
 * `.data/uploads` locally). They never get a public URL; admins download
 * them through an authenticated route that serves them as attachments.
 *
 * Product photos go to public storage (a public Supabase bucket, or
 * `.data/product-images` served by /api/product-images).
 *
 * File types are detected from the bytes, not from the name or the browser's
 * claim, and SVG/HTML are never accepted, so uploads can't run as code.
 */

/** Detects the real file type from its first bytes. */
export function sniffType(bytes: Uint8Array): string | null {
  const starts = (sig: number[], offset = 0) => sig.every((b, i) => bytes[offset + i] === b);
  if (starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (starts([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (starts([0x25, 0x50, 0x44, 0x46, 0x2d])) return "application/pdf";
  if (starts([0x52, 0x49, 0x46, 0x46]) && starts([0x57, 0x45, 0x42, 0x50], 8)) return "image/webp";
  return null;
}

export type StoredFile = { ok: true; id: string; type: string } | { ok: false; status: number; error: string };

type Validated = { ok: true; bytes: Uint8Array<ArrayBuffer>; type: string; ext: string } | { ok: false; error: string; status: number };

async function validate(file: File, allowed: Record<string, string>, maxBytes: number): Promise<Validated> {
  if (file.size === 0) return { ok: false, error: "The file is empty.", status: 400 };
  if (file.size > maxBytes) return { ok: false, error: `Files must be under ${maxBytes / 1024 / 1024} MB.`, status: 413 };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffType(bytes);
  const ext = type ? allowed[type] : undefined;
  if (!type || !ext) return { ok: false, error: `Use a ${Object.values(allowed).join(", ").toUpperCase()} file.`, status: 415 };
  return { ok: true, bytes, type, ext };
}

async function putObject(bucket: string, dir: string, id: string, bytes: Uint8Array<ArrayBuffer>, type: string) {
  if (hasSupabase()) {
    const res = await fetch(`${env.supabaseUrl}/storage/v1/object/${bucket}/${id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.supabaseServiceRoleKey}`, "Content-Type": type, "x-upsert": "false" },
      body: bytes,
    });
    if (!res.ok) throw new Error(`storage ${res.status}: ${await res.text()}`);
    return;
  }
  const folder = path.join(/*turbopackIgnore: true*/ process.cwd(), env.dataDir, dir);
  await mkdir(folder, { recursive: true });
  await writeFile(path.join(/*turbopackIgnore: true*/ folder, id), bytes);
}

export async function storeCustomerUpload(file: File): Promise<StoredFile> {
  const v = await validate(file, limits.upload.types, limits.upload.maxBytes);
  if (!v.ok) return { ok: false, status: v.status, error: v.error };
  const id = `${randomBytes(16).toString("hex")}.${v.ext}`;
  try {
    await putObject(env.uploadsBucket, "uploads", id, v.bytes, v.type);
  } catch (e) {
    console.error("[uploads] store failed", e);
    return { ok: false, status: 502, error: "Upload failed. Please try again." };
  }
  return { ok: true, id, type: v.type };
}

const UPLOAD_ID = /^[a-f0-9]{32}\.(png|jpg|pdf|webp)$/;
const typeByExt: Record<string, string> = { png: "image/png", jpg: "image/jpeg", pdf: "application/pdf", webp: "image/webp" };

/** Reads a private customer upload. Callers must have checked admin authorization. */
export async function readCustomerUpload(id: string): Promise<{ bytes: Uint8Array; type: string } | null> {
  if (!UPLOAD_ID.test(id)) return null;
  const type = typeByExt[id.split(".")[1]];
  if (hasSupabase()) {
    const res = await fetch(`${env.supabaseUrl}/storage/v1/object/authenticated/${env.uploadsBucket}/${id}`, {
      headers: { Authorization: `Bearer ${env.supabaseServiceRoleKey}` },
    });
    return res.ok ? { bytes: new Uint8Array(await res.arrayBuffer()), type } : null;
  }
  try {
    return { bytes: await readFile(path.join(/*turbopackIgnore: true*/ process.cwd(), env.dataDir, "uploads", id)), type };
  } catch {
    return null;
  }
}

export async function storeProductImage(file: File): Promise<{ ok: true; id: string; url: string } | { ok: false; error: string }> {
  const v = await validate(file, limits.productImage.types, limits.productImage.maxBytes);
  if (!v.ok) return { ok: false, error: v.error };
  const id = `${randomBytes(16).toString("hex")}.${v.ext}`;
  try {
    await putObject(env.productImagesBucket, "product-images", id, v.bytes, v.type);
  } catch (e) {
    console.error("[product-images] store failed", e);
    return { ok: false, error: "Upload failed. Please try again." };
  }
  const url = hasSupabase()
    ? `${env.supabaseUrl}/storage/v1/object/public/${env.productImagesBucket}/${id}`
    : `/api/product-images/${id}`;
  return { ok: true, id, url };
}

export async function readLocalProductImage(id: string) {
  if (!UPLOAD_ID.test(id) || id.endsWith(".pdf")) return null;
  try {
    return { bytes: await readFile(path.join(/*turbopackIgnore: true*/ process.cwd(), env.dataDir, "product-images", id)), type: typeByExt[id.split(".")[1]] };
  } catch {
    return null;
  }
}

export async function deleteProductImageFile(storagePath: string) {
  if (!UPLOAD_ID.test(storagePath)) return;
  if (hasSupabase()) {
    await fetch(`${env.supabaseUrl}/storage/v1/object/${env.productImagesBucket}/${storagePath}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${env.supabaseServiceRoleKey}` },
    });
    return;
  }
  await unlink(path.join(/*turbopackIgnore: true*/ process.cwd(), env.dataDir, "product-images", storagePath)).catch(() => undefined);
}
