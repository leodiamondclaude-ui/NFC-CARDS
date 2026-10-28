/**
 * Validation for the web address a card opens. The browser never writes to
 * the physical card; the address is saved with the order and programmed
 * during fulfillment.
 */

/** Returns a normalized http(s) URL, or null if the input isn't a usable public web address. */
export function normalizeUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw || raw.length > 2000) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.username || url.password) return null;
  // Require a real-looking hostname with a TLD (rejects localhost and bare IPs).
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(url.hostname)) return null;
  return url.toString();
}
