import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Medizone",
  description: "Medizone information system prototype",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // data-theme drives the design tokens in tokens.css ("light" or "dark").
  return (
    <html lang="en" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
