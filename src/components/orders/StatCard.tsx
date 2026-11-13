import type { IconName } from "@/components/shared";

/** A KPI tile: label, number and a short line under it (clean design without icon in card). */
export function StatCard({ label, value, hint }: { label: string; value: number | string; hint: string; icon?: IconName }) {
  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs">
      <p className="text-xs font-semibold tracking-wider text-[#46566d] uppercase">{label}</p>
      <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#0e1b2e] tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-[#46566d]">{hint}</p>
    </div>
  );
}
