"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ButtonLink, Tabs, type TabItem } from "@/components/shared";
import { useAuth } from "@/lib/auth";
import { useOrders } from "@/lib/orders-store";
import { OrdersShell } from "./OrdersShell";
import { QueueTab } from "./QueueTab";

type Tab = "overview" | "queue" | "prescriptions" | "repeat" | "labels";

const SUBTITLES: Record<Tab, string> = {
  overview: "Summary of all orders: in-store (POS), online and prescription orders",
  queue: "Online orders, WhatsApp prescriptions and repeat orders waiting to be prepared",
  prescriptions: "Every prescription received, stored with the customer",
  repeat: "Regular customers who collect weekly or monthly",
  labels: "Print dispensing stickers instead of writing instructions by hand",
};

/** The staff Orders page: header, tabs and the open tab. The tab is kept in the URL (?tab=queue). */
export function StaffOrders() {
  const { user, activeBranchId } = useAuth();
  const { orders, advance, markNotified } = useOrders();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Overview is for the owner and the senior pharmacist assistant only.
  const seesOverview = user?.role === "owner" || user?.role === "senior_pharmacist";
  const tabs: TabItem[] = [
    ...(seesOverview ? [{ id: "overview", label: "Overview" }] : []),
    { id: "queue", label: "Order queue" },
    { id: "prescriptions", label: "Prescriptions" },
    { id: "repeat", label: "Repeat orders" },
    { id: "labels", label: "Labels" },
  ];
  const asked = params.get("tab") as Tab | null;
  const tab: Tab = asked && tabs.some((t) => t.id === asked) ? asked : "queue";

  // Staff at one branch see that branch; the owner can switch branches in the top bar.
  const branch = activeBranchId ?? user?.branchId ?? "all";
  const branchOrders = branch === "all" ? orders : orders.filter((o) => o.branchId === branch);
  const staffName = user?.name ?? "Staff";

  return (
    <OrdersShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mz-body-sm text-ink-muted">Dashboard / Orders</p>
          <h1 className="mz-h1">Orders</h1>
          <p className="text-ink-muted">{SUBTITLES[tab]}</p>
        </div>
        <ButtonLink href="/orders/new" icon="plus">
          New order
        </ButtonLink>
      </div>

      <Tabs tabs={tabs} value={tab} onChange={(id) => router.replace(`${pathname}?tab=${id}`, { scroll: false })} label="Orders sections" idBase="orders" className="mt-6 mb-6" />

      <div role="tabpanel" id={`orders-panel-${tab}`} aria-labelledby={`orders-tab-${tab}`}>
        {tab === "queue" && <QueueTab orders={branchOrders} staffName={staffName} onAdvance={(id) => advance(id, staffName)} onNotified={markNotified} />}
        {tab !== "queue" && <p className="rounded-lg border border-dashed border-line-strong p-10 text-center text-ink-muted">This tab is being built next.</p>}
      </div>
    </OrdersShell>
  );
}
