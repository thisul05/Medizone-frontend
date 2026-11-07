import Link from "next/link";
import { Icon, cx } from "@/components/shared";
import { HeroCategoryGrid } from "./HeroCategoryGrid";
import { CONTAINER, NAV_FOCUS, OVERLINE } from "./Section";

const whiteFill =
  "inline-flex h-control-lg items-center justify-center gap-2 rounded-md bg-surface-raised px-5 text-label text-primary-tint-ink transition-colors duration-150 hover:bg-primary-tint";
const whiteOutline =
  "inline-flex h-control-lg items-center justify-center gap-2 rounded-md border border-nav-ink px-5 text-label text-nav-ink transition-colors duration-150 hover:bg-nav-active";
const sideLink = "inline-flex items-center gap-1.5 rounded-sm text-label text-link hover:underline";

/** Static hero: one navy main tile and two side tiles. */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="pt-6 pb-12 lg:pt-8 lg:pb-16">
      <div className={cx(CONTAINER, "grid gap-6 lg:grid-cols-3")}>
        <div className={cx("grid gap-8 rounded-lg bg-surface-nav p-6 text-nav-ink sm:p-10 lg:col-span-2 xl:grid-cols-[1fr_280px] xl:items-center", NAV_FOCUS)}>
          <div className="flex flex-col items-start gap-5">
            <p className={cx(OVERLINE, "text-nav-muted")}>Your local pharmacy, online</p>
            <h1 id="hero-title" className="text-[32px] leading-[38px] font-extrabold tracking-[-0.02em] sm:text-display">
              Everyday health essentials from pharmacists you trust
            </h1>
            <p className="text-body-lg text-nav-muted">
              Vitamins, skincare, mom and baby care and health devices, chosen by our pharmacists. Order online for
              islandwide delivery, or collect at one of our four branches in Piliyandala.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/shop" className={whiteFill}>
                Shop now <Icon name="arrow-right" />
              </Link>
              <Link href="#offers" className={whiteOutline}>
                See this week&apos;s offers
              </Link>
            </div>
          </div>

          <HeroCategoryGrid />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
          <div className="flex flex-col items-start justify-between gap-4 rounded-lg border border-line bg-surface-raised p-6 shadow-1">
            <span className="flex size-11 items-center justify-center rounded-pill bg-primary-tint text-primary-tint-ink">
              <Icon name="activity" />
            </span>
            <p className="text-h2">Health devices with warranty support</p>
            <Link href="/shop?category=devices" className={sideLink}>
              Shop devices <Icon name="arrow-right" size={16} />
            </Link>
          </div>
          <div className="flex flex-col items-start justify-between gap-4 rounded-lg bg-loyalty-bg p-6 text-loyalty-ink">
            <span className="flex size-11 items-center justify-center rounded-pill bg-surface-raised">
              <Icon name="gift" />
            </span>
            <p className="text-h3">
              Earn points every time you shop. 1 point for every Rs. 100, and regular customers save 3% or 5%.
            </p>
            <Link href="/register" className="inline-flex items-center gap-1.5 rounded-sm text-label text-loyalty-ink underline underline-offset-2">
              Create account <Icon name="arrow-right" size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
