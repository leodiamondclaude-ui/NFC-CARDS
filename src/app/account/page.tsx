import type { Metadata } from "next";
import { site } from "@/config/site";
import { ButtonLink } from "@/components/ui/button";
import { UserIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

/**
 * Customer accounts are planned (Supabase Auth; see README "Next steps").
 * Until then checkout works as a guest and order updates arrive by email.
 */
export default function AccountPage() {
  return (
    <div className="container-page py-20 md:py-28">
      <div className="mx-auto max-w-md text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-paper-2">
          <UserIcon size={24} />
        </span>
        <h1 className="display mt-6 text-[2.2rem]">Accounts are coming soon</h1>
        <p className="mt-3 leading-relaxed text-muted">
          For now, check out as a guest. We email your receipt, shipping updates and card setup instructions. Need help
          with an order? Write to {site.contact.email}.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/shop">Shop cards</ButtonLink>
          <ButtonLink href="/how-it-works" variant="secondary">
            Card setup guide
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
