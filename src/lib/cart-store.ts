"use client";

import { useSyncExternalStore } from "react";
import { limits } from "@/config/site";
import { cartLineSchema } from "@/lib/schemas";
import { lineKey, type CartLine } from "@/lib/pricing";

/**
 * Client cart persisted to localStorage. It holds product references and
 * configuration only; prices are always looked up from the catalog.
 */

const STORAGE_KEY = "tapform.cart.v1";

type State = { lines: CartLine[]; discountCode: string | null; lastAdded: { key: string; at: number } | null };

const EMPTY: State = { lines: [], discountCode: null, lastAdded: null };

let state: State = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function read(): State {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as { lines?: unknown[]; discountCode?: unknown };
    const lines = (parsed.lines ?? [])
      .map((l) => cartLineSchema.safeParse(l))
      .filter((r) => r.success)
      .map((r) => r.data as CartLine);
    return {
      lines,
      discountCode: typeof parsed.discountCode === "string" ? parsed.discountCode : null,
      lastAdded: null,
    };
  } catch {
    return EMPTY;
  }
}

function ensureHydrated() {
  if (!hydrated && typeof window !== "undefined") {
    hydrated = true;
    state = read();
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) {
        state = read();
        emit();
      }
    });
  }
}

function emit() {
  for (const l of listeners) l();
}

function set(next: Partial<State>) {
  state = { ...state, ...next };
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ lines: state.lines, discountCode: state.discountCode }),
    );
  } catch {
    // Storage may be unavailable (private mode); the cart still works for this tab.
  }
  emit();
}

function subscribe(listener: () => void) {
  ensureHydrated();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  ensureHydrated();
  return state;
}

function getServerSnapshot() {
  return EMPTY;
}

export const cart = {
  add(line: Omit<CartLine, "key">) {
    const key = lineKey(line);
    const existing = state.lines.find((l) => l.key === key);
    const lines = existing
      ? state.lines.map((l) =>
          l.key === key ? { ...l, quantity: Math.min(limits.maxQuantityPerLine, l.quantity + line.quantity) } : l,
        )
      : [...state.lines, { ...line, key }].slice(0, limits.maxLines);
    set({ lines, lastAdded: { key, at: Date.now() } });
  },
  setQuantity(key: string, quantity: number) {
    const q = Math.max(1, Math.min(limits.maxQuantityPerLine, Math.round(quantity)));
    set({ lines: state.lines.map((l) => (l.key === key ? { ...l, quantity: q } : l)) });
  },
  remove(key: string) {
    set({ lines: state.lines.filter((l) => l.key !== key) });
  },
  clear() {
    set({ lines: [], discountCode: null, lastAdded: null });
  },
  setDiscountCode(code: string | null) {
    set({ discountCode: code ? code.trim().toUpperCase() : null });
  },
  dismissToast() {
    set({ lastAdded: null });
  },
};

export function useCart() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useCartCount() {
  const { lines } = useCart();
  return lines.reduce((n, l) => n + l.quantity, 0);
}

/** True once the browser cart has loaded (false during server render and hydration). */
export function useCartReady() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
