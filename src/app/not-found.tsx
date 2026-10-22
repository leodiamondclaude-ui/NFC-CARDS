import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page py-28 text-center">
      <p className="eyebrow">404</p>
      <h1 className="display mt-4 text-[2.6rem] sm:text-[3.4rem]">Nothing to tap here.</h1>
      <p className="mx-auto mt-4 max-w-md text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
        <ButtonLink href="/">Go home</ButtonLink>
        <ButtonLink href="/shop" variant="secondary">
          Shop cards
        </ButtonLink>
      </div>
    </div>
  );
}
