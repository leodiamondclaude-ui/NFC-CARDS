import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Logo } from "@/components/layout/logo";
import { LockIcon } from "@/components/ui/icons";
import { getAdmin } from "@/lib/server/admin-auth";
import { hasAdmin } from "@/lib/server/env";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

async function LoginContent() {
  await connection();
  if (await getAdmin()) redirect("/admin");
  if (!hasAdmin()) {
    return (
      <div className="space-y-3 text-sm leading-relaxed text-ink-2">
        <p className="font-medium text-ink">Admin access isn&apos;t configured.</p>
        <p>
          There is no default account. Set <code className="font-mono text-xs">ADMIN_EMAIL</code>,{" "}
          <code className="font-mono text-xs">ADMIN_PASSWORD_HASH</code> and{" "}
          <code className="font-mono text-xs">ADMIN_SESSION_SECRET</code> in your environment. Run{" "}
          <code className="font-mono text-xs">npm run admin:hash</code> to create the hash and secret, then restart the server.
        </p>
      </div>
    );
  }
  return <LoginForm />;
}

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-line bg-card p-7">
          <h1 className="flex items-center gap-2 text-lg font-semibold">
            <LockIcon size={18} /> Admin sign in
          </h1>
          <div className="mt-6">
            <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-paper-2" />}>
              <LoginContent />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
