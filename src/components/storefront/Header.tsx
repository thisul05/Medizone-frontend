"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon, Logo, cx } from "@/components/shared";
import { AccountMenu } from "./AccountMenu";
import { CartButton } from "./CartButton";
import { MainNav } from "./MainNav";
import { MobileMenu } from "./MobileMenu";
import { SearchBox } from "./SearchBox";
import { CONTAINER } from "./Section";

/** Sticky header (logo, search, account, cart) together with the menu row. */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={cx("sticky top-0 z-40 bg-surface-raised transition-shadow duration-150", scrolled && "shadow-1")}>
      <header className={cx(CONTAINER, "flex h-[72px] items-center gap-4 lg:gap-8")}>
        <Link href="/" aria-label="Medizone Pharmacy home" className="shrink-0 rounded-md">
          <Logo height={36} priority />
        </Link>
        <div className="hidden flex-1 md:block">
          <SearchBox />
        </div>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <div className="hidden lg:block">
            <AccountMenu />
          </div>
          <CartButton />
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-control-lg items-center gap-2 rounded-md px-3 mz-label text-primary-tint-ink transition-colors duration-150 hover:bg-primary-tint lg:hidden"
          >
            <Icon name={menuOpen ? "x" : "menu"} />
            <span className="sr-only sm:not-sr-only">Menu</span>
          </button>
        </div>
      </header>
      <MainNav />
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </div>
  );
}
