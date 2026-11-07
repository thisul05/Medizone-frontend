import type { ReactNode } from "react";
import { Icon, cx, type IconName } from "@/components/shared";
import { site } from "@/data/site";
import { CONTAINER } from "./Section";

const ITEMS: { icon: IconName; title: string; text: ReactNode }[] = [
  { icon: "bag", title: "Order online", text: "Browse and order any time" },
  { icon: "truck", title: "Islandwide delivery", text: "Or collect from a branch near you" },
  { icon: "card", title: "Safe payments", text: "Cash, card, bank transfer or cash on delivery" },
  {
    icon: "stethoscope",
    title: "Pharmacist support",
    text: (
      <a href={site.phoneHref} className="text-link hover:underline">
        {site.phone}
      </a>
    ),
  },
];

export function ServiceHighlights() {
  return (
    <section aria-labelledby="services-title" className="pb-12 lg:pb-16">
      <h2 id="services-title" className="sr-only">Our services</h2>
      <ul className={cx(CONTAINER, "grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6")}>
        {ITEMS.map((i) => (
          <li key={i.title} className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-4 sm:flex-row sm:items-center sm:p-5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-pill bg-primary-tint text-primary-tint-ink">
              <Icon name={i.icon} />
            </span>
            <div className="flex min-w-0 flex-col">
              <p className="text-label">{i.title}</p>
              <p className="text-body-sm text-ink-muted">{i.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
