import Link from "next/link";
import { AdminBoundary, AdminHeader, Empty, Panel, Pill, table } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons";
import { priceLabel } from "@/lib/catalog";
import { requireAdmin } from "@/lib/server/admin-auth";
import { readCatalog } from "@/lib/server/catalog";
import { toggleProductActive } from "./actions";

export const metadata = { title: "Products" };

async function Products() {
  await requireAdmin();
  const products = await readCatalog();
  return (
    <>
      <AdminHeader
        title="Products"
        description="Changes appear in the store as soon as you save. Prices here are what checkout charges."
        actions={
          <ButtonLink href="/admin/products/new" size="sm">
            <PlusIcon size={15} /> New product
          </ButtonLink>
        }
      />
      <Panel>
        {products.length === 0 ? (
          <Empty>No products yet.</Empty>
        ) : (
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>Product</th>
                  <th className={table.th}>Price</th>
                  <th className={table.th}>Variants and stock</th>
                  <th className={table.th}>Status</th>
                  <th className={table.th}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className={table.td}>
                      <Link href={`/admin/products/${p.id}`} className="font-medium hover:underline">
                        {p.name}
                      </Link>
                      <span className="block font-mono text-xs text-muted">/{p.slug}</span>
                    </td>
                    <td className={`${table.td} tabular-nums`}>{priceLabel(p)}</td>
                    <td className={table.td}>
                      <ul className="space-y-0.5">
                        {p.variants.map((v) => (
                          <li key={v.id} className={v.available ? "" : "text-muted line-through"}>
                            {v.name} <span className="text-muted">· {v.inventory === null ? "not tracked" : `${v.inventory} in stock`}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className={table.td}>
                      <div className="flex flex-wrap gap-1">
                        {p.active ? <Pill tone="success">In store</Pill> : <Pill>Hidden</Pill>}
                        {p.featured && <Pill tone="accent">Featured</Pill>}
                      </div>
                    </td>
                    <td className={`${table.td} text-right`}>
                      <form action={toggleProductActive}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="text-sm text-muted hover:text-ink">
                          {p.active ? "Mark unavailable" : "Make available"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}

export default function AdminProductsPage() {
  return (
    <AdminBoundary>
      <Products />
    </AdminBoundary>
  );
}
