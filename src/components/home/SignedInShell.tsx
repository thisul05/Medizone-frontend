import type { ReactNode } from "react";
import { StaffTopBar } from "@/components/shared";

/** Top bar plus a full-width fluid content column for signed-in pages. */
export function SignedInShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface-page">
      <StaffTopBar />
      <main id="main" className="w-full px-4 py-8 sm:px-6 lg:px-8 lg:py-12 xl:px-10">
        {children}
      </main>
    </div>
  );
}
