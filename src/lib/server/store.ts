import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { env, hasSupabase } from "@/lib/server/env";

/**
 * Minimal persistence layer.
 *
 * - With SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set, rows go to Postgres
 *   through Supabase's REST API (schema in supabase/migrations).
 * - Otherwise rows go to JSON files under LOCAL_DATA_DIR (default `.data/`)
 *   so the whole flow can be exercised locally. That directory is git-ignored
 *   and is not suitable for production or serverless hosting.
 */

type Row = Record<string, unknown> & { id: string };

async function supabase(pathname: string, init: RequestInit = {}) {
  const res = await fetch(`${env.supabaseUrl}/rest/v1/${pathname}`, {
    ...init,
    headers: {
      apikey: env.supabaseServiceRoleKey!,
      Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...init.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Supabase ${init.method ?? "GET"} ${pathname} failed: ${res.status} ${await res.text()}`);
  return res.status === 204 ? [] : ((await res.json()) as Row[]);
}

const localPath = (table: string) => path.join(process.cwd(), env.dataDir, `${table}.json`);

async function readLocal(table: string): Promise<Row[]> {
  try {
    return JSON.parse(await readFile(localPath(table), "utf8")) as Row[];
  } catch {
    return [];
  }
}

async function writeLocal(table: string, rows: Row[]) {
  await mkdir(path.dirname(localPath(table)), { recursive: true });
  await writeFile(localPath(table), JSON.stringify(rows, null, 2));
}

let warned = false;
function warnLocal() {
  if (!warned && process.env.NODE_ENV === "production") {
    warned = true;
    console.warn("[store] Supabase is not configured; using local JSON files. Configure Supabase before launch.");
  }
}

export async function insert<T extends Row>(table: string, row: T): Promise<T> {
  if (hasSupabase()) return (await supabase(table, { method: "POST", body: JSON.stringify(row) }))[0] as T;
  warnLocal();
  const rows = await readLocal(table);
  rows.push(row);
  await writeLocal(table, rows);
  return row;
}

export async function insertMany<T extends Row>(table: string, rows: T[]): Promise<void> {
  if (!rows.length) return;
  if (hasSupabase()) {
    await supabase(table, { method: "POST", body: JSON.stringify(rows) });
    return;
  }
  const existing = await readLocal(table);
  await writeLocal(table, [...existing, ...rows]);
}

export async function update<T extends Row>(table: string, id: string, patch: Partial<T>): Promise<T | null> {
  if (hasSupabase()) {
    const rows = await supabase(`${table}?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    return (rows[0] as T) ?? null;
  }
  const rows = await readLocal(table);
  const i = rows.findIndex((r) => r.id === id);
  if (i === -1) return null;
  rows[i] = { ...rows[i], ...patch };
  await writeLocal(table, rows);
  return rows[i] as T;
}

export async function findBy<T extends Row>(table: string, column: string, value: string): Promise<T | null> {
  if (hasSupabase()) {
    const rows = await supabase(`${table}?${column}=eq.${encodeURIComponent(value)}&limit=1`);
    return (rows[0] as T) ?? null;
  }
  const rows = await readLocal(table);
  return (rows.find((r) => r[column] === value) as T) ?? null;
}
