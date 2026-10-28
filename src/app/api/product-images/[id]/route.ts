import { readLocalProductImage } from "@/lib/server/uploads";

/** Serves product photos from local storage (development). Supabase serves them directly in production. */
export async function GET(_request: Request, ctx: RouteContext<"/api/product-images/[id]">) {
  const { id } = await ctx.params;
  const file = await readLocalProductImage(id);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(file.bytes), {
    headers: {
      "Content-Type": file.type,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
