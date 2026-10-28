import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminBoundary, AdminHeader, Panel, Pill } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/server/admin-auth";
import { readCatalog } from "@/lib/server/catalog";
import { ProductForm } from "../product-form";
import { ImageManager } from "./image-manager";

export const metadata = { title: "Edit product" };

async function EditProduct({ params, searchParams }: PageProps<"/admin/products/[id]">) {
  await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const product = (await readCatalog()).find((p) => p.id === id);
  if (!product) notFound();
  return (
    <>
      <AdminHeader
        back={{ href: "/admin/products", label: "Products" }}
        title={product.name}
        description={
          <>
            {product.active ? <Pill tone="success">In store</Pill> : <Pill>Hidden</Pill>}{" "}
            {product.active && (
              <Link href={`/shop/${product.slug}`} className="ml-1 hover:text-ink">
                View in store →
              </Link>
            )}
          </>
        }
      />
      {sp.created && <p className="mb-6 rounded-2xl bg-success/10 p-4 text-sm text-success">Product created. Add photos on the right.</p>}
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <ProductForm product={product} />
        <Panel title="Photos" className="h-fit">
          <div className="p-5">
            <ImageManager productId={product.id} images={product.images} />
          </div>
        </Panel>
      </div>
    </>
  );
}

export default function EditProductPage(props: PageProps<"/admin/products/[id]">) {
  return (
    <AdminBoundary>
      <EditProduct {...props} />
    </AdminBoundary>
  );
}
