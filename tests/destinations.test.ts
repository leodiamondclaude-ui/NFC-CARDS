import { describe, expect, it } from "vitest";
import { describeDestination, normalizeUrl, validateDestination } from "@/lib/destinations";

describe("normalizeUrl", () => {
  it("adds https and accepts normal addresses", () => {
    expect(normalizeUrl("example.com/me")).toBe("https://example.com/me");
    expect(normalizeUrl("http://sub.example.co.uk")).toBe("http://sub.example.co.uk/");
  });
  it("rejects unsafe or malformed input", () => {
    for (const bad of ["", "javascript:alert(1)", "data:text/html,hi", "localhost", "https://user:pw@example.com", "not a url", "ftp://example.com"]) {
      expect(normalizeUrl(bad)).toBeNull();
    }
  });
});

describe("validateDestination", () => {
  it("validates each preset", () => {
    expect(validateDestination({ type: "website", url: "example.com" })).toEqual({});
    expect(validateDestination({ type: "website", url: "nope" }).url).toBeTruthy();
    expect(validateDestination({ type: "social", platform: "instagram", handle: "@alex.rivera" })).toEqual({});
    expect(validateDestination({ type: "social", platform: "instagram", handle: "bad handle!" }).handle).toBeTruthy();
    expect(validateDestination({ type: "contact", name: "Alex", email: "a@b.co" })).toEqual({});
    expect(validateDestination({ type: "contact", name: "Alex" }).email).toBeTruthy();
    expect(validateDestination({ type: "contact", name: "Alex", phone: "abc" }).phone).toBeTruthy();
  });
  it("builds social URLs", () => {
    expect(describeDestination({ type: "social", platform: "tiktok", handle: "@alex" })).toBe("https://www.tiktok.com/@alex");
  });
});
