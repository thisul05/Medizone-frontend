import { Icon, cx } from "@/components/shared";
import { site } from "@/data/site";
import { CONTAINER, NAV_FOCUS } from "./Section";

const item = "flex items-center gap-1.5 rounded-sm text-nav-ink hover:underline";

export function TopBar() {
  return (
    <div className={cx("bg-surface-nav text-body-sm text-nav-muted", NAV_FOCUS)}>
      <div className={cx(CONTAINER, "flex min-h-10 items-center justify-between gap-4 py-2")}>
        <p className="hidden lg:block">
          Pharmacist-run since {site.established} · Quality, internationally recognised products · Safe payments
        </p>
        <ul className="flex w-full flex-wrap items-center justify-between gap-x-5 gap-y-1 lg:w-auto lg:justify-end">
          <li>
            <a href={site.phoneHref} className={item}>
              <Icon name="phone" size={16} />
              {site.phone}
            </a>
          </li>
          <li className="hidden md:block">
            <a href={`mailto:${site.email}`} className={item}>
              <Icon name="mail" size={16} />
              {site.email}
            </a>
          </li>
          {site.openingHours && (
            <li className="hidden items-center gap-1.5 md:flex">
              <Icon name="clock" size={16} />
              {site.openingHours}
            </li>
          )}
          {site.whatsapp && (
            <li className="hidden md:block">
              <a href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`} className={item} rel="noopener noreferrer" target="_blank">
                <Icon name="message" size={16} />
                WhatsApp
              </a>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
