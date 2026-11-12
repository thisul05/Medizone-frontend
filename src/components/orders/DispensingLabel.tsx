import { Icon, cx } from "@/components/shared";
import { formatDate } from "@/lib/format";
import { WHEN_LABELS, doseTimes, labelText } from "@/lib/orders";
import type { OrderItem } from "@/types/orders";

interface Props {
  item: OrderItem;
  patient: string;
  date: string;
  reference: string;
  branch: string;
  warning?: string;
  /** Plain black-on-white version for printing. */
  print?: boolean;
}

/** The sticker that replaces handwritten instructions: medicine, dose, times a day, days and when. */
export function DispensingLabel({ item, patient, date, reference, branch, warning, print }: Props) {
  const times = doseTimes(item);
  return (
    <div className={cx("flex w-[330px] flex-col gap-1.5 rounded-md border border-ink bg-white p-3 text-black", print && "break-inside-avoid")}>
      <div className="flex items-center justify-between border-b-2 border-black pb-1">
        <span className="text-[15px] font-bold">medizone.lk</span>
        <span className="text-[9px]">{branch} · +94 70 185 5855</span>
      </div>
      <div className="flex justify-between text-[11px]">
        <span>Patient: <b>{patient}</b></span>
        <span>{formatDate(date)}</span>
      </div>
      <p className="text-[15px] font-bold uppercase leading-5">{item.name}</p>
      <p className="text-[13px] font-semibold">{labelText(item)}</p>
      <p className="text-[12px]">{WHEN_LABELS[item.when ?? "any_time"]}</p>
      <div className="flex gap-1.5">
        {["Morning", "Afternoon", "Night"].map((t) => (
          <span key={t} className={cx("rounded-sm border border-black px-1.5 py-0.5 text-[10px] font-semibold", times.includes(t) ? "bg-black text-white" : "text-black opacity-40")}>
            {t}
          </span>
        ))}
      </div>
      {warning && (
        <p className="flex items-center gap-1 text-[10px] font-semibold">
          <Icon name="alert" size={12} />
          {warning}
        </p>
      )}
      <div className="flex justify-between border-t border-black/30 pt-1 text-[10px]">
        <span>Qty: {item.qty}</span>
        <span>Ref: {reference}</span>
      </div>
    </div>
  );
}
