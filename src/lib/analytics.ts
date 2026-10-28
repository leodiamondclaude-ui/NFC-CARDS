"use client";

/**
 * Marketing event hub. Components call track(); integrations (Google
 * Analytics, Meta Pixel, email or abandoned-cart tools) subscribe in
 * src/components/marketing/analytics.tsx. Nothing is sent unless an
 * integration is configured and the visitor has given consent.
 */

export type MarketingEvent =
  | { name: "view_item"; slug: string; price: number }
  | { name: "add_to_cart"; slug: string; variantId: string; quantity: number }
  | { name: "begin_checkout"; value: number; items: number }
  | { name: "generate_lead"; kind: "quote" | "contact" };

type Sink = (event: MarketingEvent) => void;
const sinks = new Set<Sink>();

export function addSink(sink: Sink) {
  sinks.add(sink);
  return () => {
    sinks.delete(sink);
  };
}

export function track(event: MarketingEvent) {
  for (const sink of sinks) {
    try {
      sink(event);
    } catch {
      // Analytics must never break the store.
    }
  }
}

const CONSENT_KEY = "tapcard.consent.v1";
export type Consent = "granted" | "denied" | null;

export function readConsent(): Consent {
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

const consentListeners = new Set<() => void>();
let consentOverride: Consent = null;

export function writeConsent(value: Exclude<Consent, null>) {
  consentOverride = value;
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Ignore storage failures; the choice still applies for this visit.
  }
  consentListeners.forEach((l) => l());
}

/** For useSyncExternalStore: "unknown" during server render and hydration. */
export const consentStore = {
  subscribe(listener: () => void) {
    consentListeners.add(listener);
    return () => {
      consentListeners.delete(listener);
    };
  },
  get: (): Consent => consentOverride ?? readConsent(),
  getServer: (): Consent | "unknown" => "unknown",
};
