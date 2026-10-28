import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { getCatalog } from "@/lib/server/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/shop", "/how-it-works", "/business", "/faq", "/about", "/contact", "/shipping", "/returns", "/privacy", "/terms"];
  const products = await getCatalog();
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 })),
    ...products.map((p) => ({ url: `${site.url}/shop/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
