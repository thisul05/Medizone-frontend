import { Badge, type BadgeTone } from "@/components/shared";
import { SOURCE_LABELS } from "@/lib/orders";
import type { OrderSource } from "@/types/orders";

const SOURCE_TONE: Record<OrderSource, BadgeTone> = {
  online: "brand",
  whatsapp: "success",
  branch: "neutral",
  repeat: "warning",
};

/** Where the order came from: Online, WhatsApp, At branch or Repeat. */
export function SourceBadge({ source }: { source: OrderSource }) {
  return <Badge tone={SOURCE_TONE[source]}>{SOURCE_LABELS[source]}</Badge>;
}
