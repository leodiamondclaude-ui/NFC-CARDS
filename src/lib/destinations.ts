/**
 * NFC destination presets: what the card opens when tapped.
 *
 * We program the chip during fulfillment. The browser never writes to the
 * physical card; the customer's choice is saved as part of the order
 * specification.
 */

export type DestinationType = "website" | "business-card" | "social" | "link-in-bio" | "contact";

export const socialPlatforms = {
  instagram: { label: "Instagram", base: "https://instagram.com/" },
  linkedin: { label: "LinkedIn", base: "https://www.linkedin.com/in/" },
  tiktok: { label: "TikTok", base: "https://www.tiktok.com/@" },
  x: { label: "X", base: "https://x.com/" },
  youtube: { label: "YouTube", base: "https://www.youtube.com/@" },
} as const;

export type SocialPlatform = keyof typeof socialPlatforms;

export type Destination =
  | { type: "website" | "business-card" | "link-in-bio"; url: string }
  | { type: "social"; platform: SocialPlatform; handle: string }
  | {
      type: "contact";
      name: string;
      phone?: string;
      email?: string;
      company?: string;
    };

export const destinationPresets: {
  type: DestinationType;
  label: string;
  hint: string;
}[] = [
  {
    type: "website",
    label: "Website",
    hint: "Open any web page, such as your site, booking page or portfolio.",
  },
  {
    type: "business-card",
    label: "Digital business card",
    hint: "Link to a hosted digital business card. Edit that page any time and your card stays the same.",
  },
  {
    type: "social",
    label: "Social profile",
    hint: "Send people straight to your Instagram, LinkedIn, TikTok, X or YouTube.",
  },
  {
    type: "link-in-bio",
    label: "Link-in-bio page",
    hint: "Point to your link-in-bio page so one tap reaches all your links.",
  },
  {
    type: "contact",
    label: "Contact information",
    hint: "Stores a contact record on the chip. Android saves it directly; iPhones handle contact records inconsistently, so a digital business card link is more reliable for mixed audiences.",
  },
];

const HANDLE_RE = /^[A-Za-z0-9._-]{1,60}$/;
const PHONE_RE = /^\+?[0-9 ()-]{6,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Returns a normalized https URL, or null if the input isn't a usable web address. */
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
  // Require a real-looking hostname with a TLD.
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(url.hostname)) return null;
  return url.toString();
}

export type DestinationErrors = Partial<Record<string, string>>;

/** Validates a destination and returns field errors (empty object when valid). */
export function validateDestination(d: Destination): DestinationErrors {
  const errors: DestinationErrors = {};
  switch (d.type) {
    case "website":
    case "business-card":
    case "link-in-bio":
      if (!normalizeUrl(d.url)) errors.url = "Enter a valid web address, like example.com/you.";
      break;
    case "social":
      if (!(d.platform in socialPlatforms)) errors.platform = "Choose a platform.";
      if (!HANDLE_RE.test(d.handle.replace(/^@/, "")))
        errors.handle = "Use letters, numbers, dots, dashes or underscores.";
      break;
    case "contact":
      if (!d.name.trim() || d.name.length > 80) errors.name = "Enter a name (up to 80 characters).";
      if (!d.phone && !d.email) errors.email = "Add an email or a phone number.";
      if (d.email && !EMAIL_RE.test(d.email)) errors.email = "Enter a valid email address.";
      if (d.phone && !PHONE_RE.test(d.phone)) errors.phone = "Enter a valid phone number.";
      if (d.company && d.company.length > 80) errors.company = "Keep the company under 80 characters.";
      break;
  }
  return errors;
}

/** The value that gets encoded on the chip, for review screens and fulfillment. */
export function describeDestination(d: Destination): string {
  switch (d.type) {
    case "website":
    case "business-card":
    case "link-in-bio":
      return normalizeUrl(d.url) ?? d.url;
    case "social":
      return socialPlatforms[d.platform].base + d.handle.replace(/^@/, "");
    case "contact":
      return [d.name, d.company, d.email, d.phone].filter(Boolean).join(" · ");
  }
}

export function destinationLabel(type: DestinationType): string {
  return destinationPresets.find((p) => p.type === type)?.label ?? type;
}
