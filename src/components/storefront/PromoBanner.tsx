import { ButtonLink, Icon, cx, type IconName } from "@/components/shared";
import { CONTAINER, OVERLINE } from "./Section";

const ICONS: IconName[] = ["sparkles", "droplets", "leaf"];

export function PromoBanner() {
  return (
    <section aria-labelledby="promo-title" className="py-12 lg:py-16">
      <div className={CONTAINER}>
        <div className="flex flex-col gap-8 rounded-lg bg-primary-tint p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-xl flex-col items-start gap-4">
            <p className={cx(OVERLINE, "text-primary-tint-ink")}>Beauty and skincare</p>
            <h2 id="promo-title" className="mz-h1 text-primary-tint-ink">Care for your hair and skin from within</h2>
            <p className="mz-body-lg text-ink-muted">
              Supplements, shampoos and daily lotions, with advice from our pharmacists when you need it.
            </p>
            <ButtonLink href="/shop?category=skincare" iconRight="arrow-right">
              Shop beauty and skincare
            </ButtonLink>
          </div>
          <div aria-hidden className="flex gap-4">
            {ICONS.map((name) => (
              <span key={name} className="flex size-20 items-center justify-center rounded-pill bg-surface-raised text-primary-tint-ink shadow-1 sm:size-24">
                <Icon name={name} size={40} strokeWidth={1.5} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
