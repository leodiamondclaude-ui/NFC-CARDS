import { ViewTransition, type ReactNode } from "react";

/**
 * Used by template.tsx files, which re-mount on every navigation, so the old
 * page fades out and the new one rises in. The header and footer live in the
 * layout and stay put.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
