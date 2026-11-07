import { Badge, Icon } from "@/components/shared";
import { branches } from "@/data/branches";
import { site } from "@/data/site";
import { Section } from "./Section";

export function BranchesSection() {
  return (
    <Section id="branches" title="Our branches" subtitle="Four branches in and around Piliyandala.">
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {branches.map((b) => (
          <li key={b.id} className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5 shadow-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-h3">{b.name}</h3>
              <Icon name="store" className="text-ink-subtle" />
            </div>
            {b.confirmed ? (
              <>
                <p className="text-label text-ink">{b.area}</p>
                {b.address && (
                  <p className="flex items-start gap-1.5 text-body-sm text-ink-muted">
                    <Icon name="map-pin" size={16} className="mt-0.5" />
                    {b.address}
                  </p>
                )}
              </>
            ) : (
              <div>
                <Badge tone="neutral" icon="clock">Details coming soon</Badge>
              </div>
            )}
            {site.openingHours && (
              <p className="flex items-center gap-1.5 text-body-sm text-ink-muted">
                <Icon name="clock" size={16} />
                {site.openingHours}
              </p>
            )}
            <a href={site.phoneHref} className="mt-auto inline-flex items-center gap-1.5 self-start rounded-sm pt-2 text-label text-link hover:underline">
              <Icon name="phone" size={16} />
              Call<span className="sr-only"> {b.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
