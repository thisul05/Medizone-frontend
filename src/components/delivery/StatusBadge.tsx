interface Props {
  value: string;
  variant: "delivery" | "return" | "warranty" | "method";
}

const colorMap: Record<string, Record<string, string>> = {
  delivery: {
    pending: "bg-amber-100 text-amber-800",
    out: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
  },
  return: {
    requested: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  },
  warranty: {
    received: "bg-gray-100 text-gray-700",
    sent_to_supplier: "bg-blue-100 text-blue-800",
    under_repair: "bg-amber-100 text-amber-800",
    replaced: "bg-green-100 text-green-800",
    returned: "bg-purple-100 text-purple-800",
  },
  method: {
    own_driver: "bg-indigo-100 text-indigo-800",
    pickme_flash: "bg-orange-100 text-orange-800",
  },
};

const labels: Record<string, string> = {
  pending: "Pending",
  out: "Out for Delivery",
  delivered: "Delivered",
  requested: "Requested",
  approved: "Approved",
  rejected: "Rejected",
  received: "Received",
  sent_to_supplier: "Sent to Supplier",
  under_repair: "Under repair",
  replaced: "Replaced",
  returned: "Returned",
  own_driver: "Own Driver",
  pickme_flash: "PickMe Flash",
};

export default function StatusBadge({ value, variant }: Props) {
  const cls = colorMap[variant]?.[value] ?? "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {labels[value] ?? value}
    </span>
  );
}
