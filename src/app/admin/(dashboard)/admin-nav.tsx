"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BagIcon, DashboardIcon, InboxIcon, PackageIcon, UsersIcon } from "@/components/ui/icons";

const items = [
  { href: "/admin", label: "Overview", icon: DashboardIcon },
  { href: "/admin/orders", label: "Orders", icon: BagIcon },
  { href: "/admin/products", label: "Products", icon: PackageIcon },
  { href: "/admin/customers", label: "Customers", icon: UsersIcon },
  { href: "/admin/inquiries", label: "Inquiries", icon: InboxIcon },
];

export function AdminNav() {
  return <NavLinks pathname={usePathname()} />;
}

/** Also rendered without a pathname as the prerendered fallback. */
export function NavLinks({ pathname }: { pathname?: string }) {
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto lg:flex-col">
      {items.map(({ href, label, icon: I }) => {
        const active = pathname !== undefined && (href === "/admin" ? pathname === href : pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${active ? "bg-ink text-paper" : "text-ink-2 hover:bg-paper-2 hover:text-ink"}`}
          >
            <I size={17} /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
