import { formatMonth, formatNumber } from "@/lib/customers";
import type { LoyaltyTransaction } from "@/types/customers";
import { Card, CardHeader } from "./ui/Card";

function monthsBetween(start: string, end: string): string[] {
  const out: string[] = [];
  let [y, m] = start.split("-").map(Number);
  const [ey, em] = end.split("-").map(Number);
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

/** Points earned per month: a single series, so one hue, no legend, values labelled in ink. */
export function PointsEarnedChart({ transactions, today }: { transactions: LoyaltyTransaction[]; today: string }) {
  const earned = transactions.filter((t) => t.type === "earned");
  const currentMonth = today.slice(0, 7);
  const firstMonth = earned.reduce((min, t) => (t.date.slice(0, 7) < min ? t.date.slice(0, 7) : min), currentMonth);
  const months = monthsBetween(firstMonth, currentMonth).slice(-6);
  const data = months.map((month) => ({
    month,
    points: earned.filter((t) => t.date.startsWith(month)).reduce((s, t) => s + t.points, 0),
  }));
  const max = Math.max(1, ...data.map((d) => d.points));

  return (
    <Card as="section" aria-labelledby="points-chart-title">
      <CardHeader id="points-chart-title" title="Points Earned History" description="Points earned on purchases each month (opening balances excluded)." />
      <div className="px-5 pb-5">
        <div className="flex h-48 items-end gap-3 border-b border-(--border)" role="img" aria-label={data.map((d) => `${formatMonth(d.month)}: ${d.points} points`).join(", ")}>
          {data.map((d) => (
            <div key={d.month} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5" title={`${formatMonth(d.month)}: ${formatNumber(d.points)} points`}>
              <span className="text-[13px] font-semibold text-(--ink) tabular-nums">{formatNumber(d.points)}</span>
              <span
                className="w-full max-w-12 rounded-t-[4px] bg-(--primary) transition-opacity group-hover:opacity-80"
                style={{ height: `${Math.max(2, (d.points / max) * 100)}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-3">
          {data.map((d) => (
            <span key={d.month} className="flex-1 text-center text-xs text-(--ink-muted)">
              {formatMonth(d.month).split(" ")[0]}
              {d.month === currentMonth ? <span className="block text-[11px] text-(--ink-subtle)">to date</span> : null}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
