import type { Metadata } from "next";
import { Figtree, IBM_Plex_Mono } from "next/font/google";
import type { CSSProperties } from "react";
import { RouteGuard, ToastProvider } from "@/components/shared";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import "./globals.css";

const figtree = Figtree({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

// Point the style guide's font tokens (tokens.css) at the self-hosted fonts, keeping the guide's fallback stack.
const fontTokens = {
  "--mz-font-sans": `${figtree.style.fontFamily}, "Noto Sans Sinhala", "Noto Sans Tamil", system-ui, sans-serif`,
  "--mz-font-mono": `${plexMono.style.fontFamily}, ui-monospace, Menlo, monospace`,
} as CSSProperties;

export const metadata: Metadata = {
  title: { default: "Medizone Pharmacy", template: "%s · Medizone Pharmacy" },
  description: "Medizone Pharmacy, Piliyandala. Information system prototype for the IS 3610 group assignment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" style={fontTokens}>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-surface-raised focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-tint-ink focus:shadow-2"
        >
          Skip to content
        </a>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <RouteGuard>{children}</RouteGuard>
              <CartDrawer />
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
