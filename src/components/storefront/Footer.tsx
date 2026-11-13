import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, Logo, cx } from "@/components/shared";
import { categories } from "@/data/storefront";
import { site } from "@/data/site";
import { CONTAINER, NAV_FOCUS } from "./Section";
import { FooterCartLink } from "./FooterCartLink";

const link = "rounded-sm text-nav-muted transition-colors duration-150 hover:text-nav-ink hover:underline";

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="mz-label text-nav-ink">{title}</h2>
      <ul className="flex flex-col gap-2">{children}</ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer id="contact" className={cx("scroll-mt-40 bg-surface-nav text-nav-ink", NAV_FOCUS)}>
      <div className={cx(CONTAINER, "grid gap-10 py-12 lg:grid-cols-[1.3fr_2fr] lg:py-16")}>
        <div className="flex flex-col gap-4">
          <Logo height={40} />
          <address className="flex flex-col gap-2 not-italic text-nav-muted">
            <span className="flex items-start gap-2">
              <Icon name="map-pin" className="mt-0.5" />
              {site.address}
            </span>
            <a href={site.phoneHref} className={cx(link, "flex items-center gap-2")}>
              <Icon name="phone" /> {site.phone}
            </a>
            <a href={`mailto:${site.email}`} className={cx(link, "flex items-center gap-2")}>
              <Icon name="mail" /> {site.email}
            </a>
            {site.openingHours && (
              <span className="flex items-center gap-2">
                <Icon name="clock" /> {site.openingHours}
              </span>
            )}
            <a href={site.facebook} target="_blank" rel="noopener noreferrer" className={cx(link, "flex items-center gap-2")}>
              <Icon name="globe" /> Facebook
            </a>
          </address>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <Column title="Shop">
            {categories.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link href={`/shop?category=${c.id}`} className={link}>{c.name}</Link>
              </li>
            ))}
            <li><Link href="/shop" className={link}>All categories</Link></li>
            <li><Link href="/shop?offers=1" className={link}>Offers</Link></li>
          </Column>
          <Column title="Customers">
            <li><Link href="/register" className={link}>Create account</Link></li>
            <li><Link href="/login" className={link}>Sign in</Link></li>
            <li><Link href="/account" className={link}>My account</Link></li>
            <li><FooterCartLink className={link} /></li>
          </Column>
          <Column title="About">
            <li><Link href="/#branches" className={link}>Branches</Link></li>
            <li><Link href="/#tips" className={link}>Health tips</Link></li>
            <li><Link href="/#faq" className={link}>FAQ</Link></li>
            <li><Link href="/#membership" className={link}>Membership</Link></li>
          </Column>
        </div>
      </div>

      <div className={cx(CONTAINER, "flex flex-wrap items-center gap-2 pb-8")}>
        <span className="mr-2 mz-label text-nav-ink">We accept</span>
        {["Cash", "Card", "Bank transfer", "Cash on delivery"].map((p) => (
          <span key={p} className="rounded-pill border border-nav-muted px-3 py-1 mz-body-sm text-nav-ink">{p}</span>
        ))}
      </div>

      <div className="border-t border-nav-active">
        <div className={cx(CONTAINER, "flex flex-col gap-3 py-6 mz-body-sm text-nav-muted md:flex-row md:items-start md:justify-between")}>
          <div className="flex flex-col gap-1">
            <p>© 2026 Medizone Pharmacy. All rights reserved.</p>
            <p>Prototype built for the IS 3610 MIS group assignment. Not the live medizone.lk site. Product prices are samples. Product images are for illustration.</p>
          </div>
          <a href="#top" className={cx(link, "flex shrink-0 items-center gap-1.5 mz-label")}>
            <Icon name="arrow-up" size={16} /> Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
