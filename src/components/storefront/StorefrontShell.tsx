import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { TopBar } from "./TopBar";

/** Top bar, sticky header and menu, page content and footer. Shared by / and /shop. */
export function StorefrontShell({ children }: { children: ReactNode }) {
  return (
    <div id="top" className="flex min-h-dvh flex-col bg-surface-page">
      <TopBar />
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
