import { Icon, type IconName } from "@/components/shared";

/** A KPI tile: label, number and a short line under it. */
export function StatCard({ label, value, hint, icon }: { label: string; value: number | string; hint: string; icon: IconName }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-line bg-surface-raised p-5 shadow-1">
      <span className="flex size-10 items-center justify-center rounded-md bg-primary-tint text-primary-tint-ink">
        <Icon name={icon} size={20} />
      </span>
      <div>
        <p className="mz-body-sm text-ink-muted">{label}</p>
        <p className="mz-kpi">{value}</p>
        <p className="mz-body-sm text-ink-muted">{hint}</p>
      </div>
    </div>
  );
}
