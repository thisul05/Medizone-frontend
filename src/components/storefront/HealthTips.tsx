import { Badge } from "@/components/shared";
import { healthTips } from "@/data/storefront";
import { formatDate } from "@/lib/format";
import { Section } from "./Section";

export function HealthTips() {
  return (
    <Section id="tips" title="Health tips" subtitle="Short, practical advice from our pharmacists.">
      <ul className="grid gap-6 md:grid-cols-3">
        {healthTips.map((t) => (
          <li key={t.id}>
            <article className="flex h-full flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5 shadow-1">
              <div className="flex items-center justify-between gap-2">
                <Badge tone="brand">{t.category}</Badge>
                <time dateTime={t.date} className="text-body-sm text-ink-muted">{formatDate(t.date)}</time>
              </div>
              <h3 className="text-h3">{t.title}</h3>
              <p className="text-body text-ink-muted">{t.body}</p>
            </article>
          </li>
        ))}
      </ul>
    </Section>
  );
}
