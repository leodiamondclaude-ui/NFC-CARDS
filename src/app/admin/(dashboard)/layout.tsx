import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { LogOutIcon } from "@/components/ui/icons";
import { logout } from "../actions";
import { Suspense } from "react";
import { AdminNav, NavLinks } from "./admin-nav";

/**
 * Admin shell. It holds no data: every page and server action under it
 * checks the admin session on the server with requireAdmin().
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="border-b border-line bg-card lg:sticky lg:top-0 lg:h-dvh lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col gap-4 p-4 lg:p-5">
          <div className="flex items-center justify-between gap-3">
            <Logo />
            <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[0.7rem] font-medium uppercase tracking-wide text-muted">Admin</span>
          </div>
          <Suspense fallback={<NavLinks />}>
            <AdminNav />
          </Suspense>
          <div className="mt-auto hidden flex-col gap-1 border-t border-line pt-4 text-sm lg:flex">
            <Link href="/" className="rounded-xl px-3 py-2 text-ink-2 hover:bg-paper-2">
              View store
            </Link>
            <form action={logout}>
              <button type="submit" className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-ink-2 hover:bg-paper-2">
                <LogOutIcon size={17} /> Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">{children}</div>
        <form action={logout} className="mx-auto mt-10 max-w-6xl lg:hidden">
          <button type="submit" className="flex items-center gap-2 text-sm text-muted">
            <LogOutIcon size={16} /> Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
