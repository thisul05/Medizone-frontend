import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, Logo, type IconName } from "@/components/shared";

interface AuthShellProps {
  /** Panel heading. Styled large, but not an h1: the card holds the page's only h1. */
  heading: string;
  subline?: string;
  points: { icon: IconName; text: string }[];
  /** Bottom of the panel. Defaults to a short "Medizone Pharmacy" line. */
  footer?: ReactNode;
  children: ReactNode;
}

/** Navy brand panel on the left (desktop only) and the form card on the right. */
export function AuthShell({ heading, subline, points, footer, children }: AuthShellProps) {
  return (
    <div className="flex min-h-dvh bg-surface-page">
      <aside className="hidden w-[44%] max-w-[600px] flex-col justify-between gap-10 bg-surface-nav p-12 text-nav-ink lg:flex mz-on-nav">
        <Link href="/" className="self-start rounded-md" aria-label="Medizone Pharmacy home">
          <Logo height={44} priority />
        </Link>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="mz-display text-nav-ink">{heading}</p>
            {subline && <p className="mz-body-lg text-nav-muted">{subline}</p>}
          </div>
          <ul className="flex flex-col gap-4">
            {points.map((p) => (
              <li key={p.text} className="flex items-center gap-3 mz-body-lg text-nav-ink">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-nav-active">
                  <Icon name={p.icon} />
                </span>
                {p.text}
              </li>
            ))}
          </ul>
        </div>
        {footer ?? <p className="mz-body-sm text-nav-muted">Medizone Pharmacy · Piliyandala · Since 2018</p>}
      </aside>

      <main id="main" className="flex flex-1 flex-col items-center px-4 py-8 sm:py-12 lg:justify-center">
        <div className="mb-6 flex w-full max-w-[440px] items-center justify-between lg:hidden">
          <Link href="/" aria-label="Medizone Pharmacy home" className="rounded-md">
            <Logo height={32} priority />
          </Link>
        </div>
        <div className="w-full max-w-[440px] rounded-lg border border-line bg-surface-raised p-5 shadow-1 sm:p-8">{children}</div>
        <Link href="/" className="mt-6 flex items-center gap-1.5 rounded-md mz-label text-link hover:underline">
          <Icon name="arrow-left" size={16} />
          Back to the shop
        </Link>
      </main>
    </div>
  );
}
