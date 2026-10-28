import { AdminBoundary, AdminHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/server/admin-auth";
import { ProductForm } from "../product-form";

export const metadata = { title: "New product" };

async function NewProduct() {
  await requireAdmin();
  return (
    <>
      <AdminHeader back={{ href: "/admin/products", label: "Products" }} title="New product" description="You can add photos after creating the product." />
      <div className="max-w-3xl">
        <ProductForm />
      </div>
    </>
  );
}

export default function NewProductPage() {
  return (
    <AdminBoundary>
      <NewProduct />
    </AdminBoundary>
  );
}
