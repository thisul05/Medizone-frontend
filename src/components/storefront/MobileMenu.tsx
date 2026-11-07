"use client";

import Link from "next/link";
import { ButtonLink, Icon, useToast } from "@/components/shared";
import { categories } from "@/data/storefront";
import { useAuth } from "@/lib/auth";
import { NAV_LINKS } from "./nav-links";
import { SearchBox } from "./SearchBox";
import { CONTAINER } from "./Section";

const linkClass = "flex items-center gap-3 rounded-md px-3 py-2.5 text-body text-ink transition-colors duration-150 hover:bg-surface-hover";

/** The panel opened by the menu button under 1024px. */
export function MobileMenu({ onClose }: { onClose: () => void }) {
  const { user, ready, signOut } = useAuth();
  const toast = useToast();

  return (
    <div id="mobile-menu" className="max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-line bg-surface-raised lg:hidden">
      <div className={`${CONTAINER} flex flex-col gap-6 py-4`}>
        <div className="md:hidden">
          <SearchBox onDone={onClose} />
        </div>

        <nav aria-label="Main">
          <ul className="flex flex-col">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkClass} onClick={onClose}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-2">
          <h2 className="px-3 text-label text-ink-muted">Shop by category</h2>
          <ul className="grid sm:grid-cols-2">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/shop?category=${c.id}`} className={linkClass} onClick={onClose}>
                  <Icon name={c.icon} className="text-ink-subtle" />
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2 border-t border-line pt-4">
          {ready && user ? (
            <>
              <p className="px-3 text-label">Signed in as {user.name}</p>
              <Link href="/home" className={linkClass} onClick={onClose}>
                <Icon name="home" /> Go to home
              </Link>
              <Link href="/profile" className={linkClass} onClick={onClose}>
                <Icon name="user" /> Profile
              </Link>
              <button
                type="button"
                className={linkClass}
                onClick={() => {
                  signOut();
                  toast({ tone: "info", title: "You're signed out" });
                  onClose();
                }}
              >
                <Icon name="logout" /> Sign out
              </button>
            </>
          ) : (
            <>
              <ButtonLink href="/login" block size="lg" onClick={onClose}>Sign in</ButtonLink>
              <ButtonLink href="/register" block size="lg" variant="secondary" onClick={onClose}>Create account</ButtonLink>
              <p className="text-center text-body-sm text-ink-muted">Members earn loyalty points</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
