import { Icon, type IconName } from "@/components/shared";
import { site } from "@/data/site";
import { Section } from "./Section";

const STATS = [
  { value: String(site.established), label: "Serving Piliyandala since" },
  { value: "4", label: "Branches" },
  { value: "95%", label: "Medicines available", caption: "About 95% of medicines registered in Sri Lanka, in store" },
  { value: "15+", label: "Qualified staff" },
];

const REASONS: { icon: IconName; title: string; text: string }[] = [
  { icon: "stethoscope", title: "Pharmacist-operated", text: "Every branch is run by trained pharmacy staff who can advise you on what you buy." },
  { icon: "bag", title: "Easy online ordering", text: "Find what you need, add it to your cart and choose delivery or collection." },
  { icon: "truck", title: "Islandwide delivery", text: "We deliver across Sri Lanka and confirm the fee with you by phone." },
];

export function WhyMedizone() {
  return (
    <Section title="Why Medizone" subtitle="A local pharmacy chain you can rely on.">
      <dl className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="flex flex-col gap-1 border-l-0 border-t border-line pt-4">
            <dt className="order-2 mz-label text-ink">{s.label}</dt>
            <dd className="order-1 mz-kpi text-primary-tint-ink mz-num">{s.value}</dd>
            {s.caption && <dd className="order-3 mz-body-sm text-ink-muted">{s.caption}</dd>}
          </div>
        ))}
      </dl>
      <ul className="mt-10 grid gap-6 md:grid-cols-3">
        {REASONS.map((r) => (
          <li key={r.title} className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5 shadow-1">
            <span className="flex size-11 items-center justify-center rounded-pill bg-primary-tint text-primary-tint-ink">
              <Icon name={r.icon} />
            </span>
            <h3 className="mz-h3">{r.title}</h3>
            <p className="text-ink-muted">{r.text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
