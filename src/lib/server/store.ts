import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { env, hasSupabase } from "@/lib/server/env";

/**
 * Minimal persistence layer with two backends:
 *
 * - Supabase (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY): rows go to Postgres
 *   through Supabase's REST API, using the schema in supabase/migrations.
 *   The service-role key is only ever read on the server.
 * - Local JSON files under LOCAL_DATA_DIR (default `.data/`) so the whole app
 *   works on a laptop with no accounts. Not suitable for production.
 */

export type Row = { id: string } & Record<string, unknown>;

type ListOptions = {
  eq?: Record<string, string | number | boolean>;
  order?: { column: string; ascending?: boolean };
  limit?: number;
};

async function supabase<T>(pathname: string, init: RequestInit = {}): Promise<T> {
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
  if (!res.ok) throw new Error(`Supabase ${init.method ?? "GET"} ${pathname.split("?")[0]} failed: ${res.status} ${await res.text()}`);
  return (res.status === 204 ? [] : await res.json()) as T;
}

const localPath = (table: string) => path.join(/*turbopackIgnore: true*/ process.cwd(), env.dataDir, `${table}.json`);

async function readLocal<T extends Row>(table: string): Promise<T[]> {
  try {
    return JSON.parse(await readFile(localPath(table), "utf8")) as T[];
  } catch {
    return [];
  }
}

// Serialize local writes per table so concurrent requests don't clobber each other.
const queues = new Map<string, Promise<unknown>>();
function withLock<T>(table: string, fn: () => Promise<T>): Promise<T> {
  const prev = queues.get(table) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  queues.set(table, next.catch(() => undefined));
  return next;
}

async function writeLocal(table: string, rows: Row[]) {
  const file = localPath(table);
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(rows, null, 2));
  await rename(tmp, file);
}

function q(value: string | number | boolean) {
  return encodeURIComponent(String(value));
}

export async function list<T extends Row>(table: string, opts: ListOptions = {}): Promise<T[]> {
  if (hasSupabase()) {
    const params = Object.entries(opts.eq ?? {}).map(([k, v]) => `${k}=eq.${q(v)}`);
    if (opts.order) params.push(`order=${opts.order.column}.${opts.order.ascending ? "asc" : "desc"}`);
    if (opts.limit) params.push(`limit=${opts.limit}`);
    return supabase<T[]>(`${table}?select=*${params.length ? `&${params.join("&")}` : ""}`);
  }
  let rows = await readLocal<T>(table);
  for (const [k, v] of Object.entries(opts.eq ?? {})) rows = rows.filter((r) => r[k] === v);
  if (opts.order) {
    const { column, ascending } = opts.order;
    rows = [...rows].sort((a, b) => {
      const x = a[column] as string | number;
      const y = b[column] as string | number;
      return (x < y ? -1 : x > y ? 1 : 0) * (ascending ? 1 : -1);
    });
  }
  return opts.limit ? rows.slice(0, opts.limit) : rows;
}

export async function findBy<T extends Row>(table: string, column: string, value: string): Promise<T | null> {
  return (await list<T>(table, { eq: { [column]: value }, limit: 1 }))[0] ?? null;
}

export async function insert<T extends Row>(table: string, row: T): Promise<T> {
  if (hasSupabase()) return (await supabase<T[]>(table, { method: "POST", body: JSON.stringify(row) }))[0];
  return withLock(table, async () => {
    const rows = await readLocal(table);
    if (rows.some((r) => r.id === row.id)) throw new Error(`Duplicate id in ${table}`);
    rows.push(row);
    await writeLocal(table, rows);
    return row;
  });
}

export async function insertMany<T extends Row>(table: string, rows: T[]): Promise<void> {
  if (!rows.length) return;
  if (hasSupabase()) {
    await supabase(table, { method: "POST", body: JSON.stringify(rows) });
    return;
  }
  await withLock(table, async () => writeLocal(table, [...(await readLocal(table)), ...rows]));
}

export async function update<T extends Row>(table: string, id: string, patch: Partial<T>): Promise<T | null> {
  if (hasSupabase()) {
    const rows = await supabase<T[]>(`${table}?id=eq.${q(id)}`, { method: "PATCH", body: JSON.stringify(patch) });
    return rows[0] ?? null;
  }
  return withLock(table, async () => {
    const rows = await readLocal(table);
    const i = rows.findIndex((r) => r.id === id);
    if (i === -1) return null;
    rows[i] = { ...rows[i], ...patch, id };
    await writeLocal(table, rows);
    return rows[i] as T;
  });
}

/**
 * Updates a row only if `column` currently equals `expected`. Returns the
 * updated row, or null if the condition didn't hold. Used to make payment
 * and status transitions safe against concurrent or duplicate events.
 */
export async function updateWhere<T extends Row>(
  table: string,
  id: string,
  column: string,
  expected: string,
  patch: Partial<T>,
): Promise<T | null> {
  if (hasSupabase()) {
    const rows = await supabase<T[]>(`${table}?id=eq.${q(id)}&${column}=eq.${q(expected)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    return rows[0] ?? null;
  }
  return withLock(table, async () => {
    const rows = await readLocal(table);
    const i = rows.findIndex((r) => r.id === id && r[column] === expected);
    if (i === -1) return null;
    rows[i] = { ...rows[i], ...patch, id };
    await writeLocal(table, rows);
    return rows[i] as T;
  });
}

export async function remove(table: string, id: string): Promise<void> {
  if (hasSupabase()) {
    await supabase(`${table}?id=eq.${q(id)}`, { method: "DELETE" });
    return;
  }
  await withLock(table, async () => writeLocal(table, (await readLocal(table)).filter((r) => r.id !== id)));
}

/** Inserts a row unless one with the same id exists. Returns false for duplicates. */
export async function insertOnce<T extends Row>(table: string, row: T): Promise<boolean> {
  if (hasSupabase()) {
    const rows = await supabase<T[]>(`${table}?on_conflict=id`, {
      method: "POST",
      body: JSON.stringify(row),
      headers: { Prefer: "return=representation,resolution=ignore-duplicates" },
    });
    return rows.length > 0;
  }
  return withLock(table, async () => {
    const rows = await readLocal(table);
    if (rows.some((r) => r.id === row.id)) return false;
    rows.push(row);
    await writeLocal(table, rows);
    return true;
  });
}
