import { adminOrUnauthorized } from "@/lib/server/admin-auth";
import { readCustomerUpload } from "@/lib/server/uploads";

/** Lets signed-in admins download a customer's logo. Always served as a download, never rendered inline. */
export async function GET(_request: Request, ctx: RouteContext<"/api/admin/uploads/[id]">) {
  const admin = await adminOrUnauthorized();
  if (admin instanceof Response) return admin;
  const { id } = await ctx.params;
  const file = await readCustomerUpload(id);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(file.bytes), {
    headers: {
      "Content-Type": file.type,
      "Content-Disposition": `attachment; filename="${id}"`,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'",
      "Cache-Control": "private, no-store",
    },
  });
}
