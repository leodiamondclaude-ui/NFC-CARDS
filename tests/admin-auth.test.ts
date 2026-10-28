import { randomBytes, scryptSync } from "node:crypto";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

import { env } from "@/lib/server/env";
import { checkCredentials, createSessionToken, readSessionToken, verifyPassword } from "@/lib/server/admin-auth";

const salt = randomBytes(16);
const hash = `scrypt:${salt.toString("hex")}:${scryptSync("correct horse battery", salt, 64).toString("hex")}`;

beforeAll(() => {
  env.adminEmail = "owner@example.com";
  env.adminPasswordHash = hash;
  env.adminSessionSecret = "s".repeat(48);
});

describe("admin auth", () => {
  it("verifies scrypt passwords", () => {
    expect(verifyPassword("correct horse battery", hash)).toBe(true);
    expect(verifyPassword("wrong password", hash)).toBe(false);
    expect(verifyPassword("anything", "plain-text")).toBe(false);
  });

  it("requires both the configured email and password", () => {
    expect(checkCredentials("Owner@Example.com ", "correct horse battery")).toBe(true);
    expect(checkCredentials("someone@example.com", "correct horse battery")).toBe(false);
    expect(checkCredentials("owner@example.com", "nope")).toBe(false);
  });

  it("accepts its own session tokens and rejects forged or expired ones", () => {
    const now = Date.now();
    const token = createSessionToken("owner@example.com", now);
    expect(readSessionToken(token, now)).toEqual({ email: "owner@example.com" });
    expect(readSessionToken(token, now + 9 * 3600_000)).toBeNull();
    const [payload] = token.split(".");
    expect(readSessionToken(`${payload}.forged`, now)).toBeNull();
    const other = Buffer.from(JSON.stringify({ email: "owner@example.com", exp: now + 1e9 })).toString("base64url");
    expect(readSessionToken(`${other}.${token.split(".")[1]}`, now)).toBeNull();
    expect(readSessionToken(undefined, now)).toBeNull();
  });

  it("refuses everything when admin isn't configured", () => {
    const saved = env.adminSessionSecret;
    env.adminSessionSecret = "too-short";
    expect(checkCredentials("owner@example.com", "correct horse battery")).toBe(false);
    env.adminSessionSecret = saved;
  });
});
