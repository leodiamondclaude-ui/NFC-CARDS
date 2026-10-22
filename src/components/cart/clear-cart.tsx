"use client";

import { useEffect } from "react";
import { cart } from "@/lib/cart-store";

/** Empties the browser cart once an order exists for this checkout. */
export function ClearCart() {
  useEffect(() => cart.clear(), []);
  return null;
}
