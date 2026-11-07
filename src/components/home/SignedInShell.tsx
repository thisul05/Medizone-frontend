import type { ReactNode } from "react";
import { StaffTopBar } from "@/components/shared";

/** Top bar plus a centred content column for signed-in pages. */
export function SignedInShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface-page">
      <StaffTopBar />
      <main id="main" className="mx-auto max-w-content px-4 py-8 lg:px-8 lg:py-12">
        {children}
      </main>
    </div>
  );
}
