"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page py-28 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="display mt-4 text-[2.4rem]">We hit a snag loading this page.</h1>
      <p className="mx-auto mt-4 max-w-md text-muted">Please try again. If it keeps happening, contact us and we&apos;ll help.</p>
      <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
        <Button onClick={() => retry()}>Try again</Button>
        <ButtonLink href="/" variant="secondary">
          Go home
        </ButtonLink>
      </div>
    </div>
  );
}
