"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Product } from "@/lib/types";

/**
 * Gives client components (cart, product cards) the active catalog so they
 * can show prices and validate options. The server still reprices every
 * order from its own copy of the catalog.
 */
const CatalogContext = createContext<Product[]>([]);

export function CatalogProvider({ products, children }: { products: Product[]; children: ReactNode }) {
  return <CatalogContext value={products}>{children}</CatalogContext>;
}

export function useCatalog() {
  return useContext(CatalogContext);
}
