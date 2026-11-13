"use client";

import { useState } from "react";
import { Alert, Badge, Button, Icon, cx } from "@/components/shared";
import { branchName, getBranch } from "@/data/branches";
import { site } from "@/data/site";
import { formatDate } from "@/lib/format";
import { useAccount } from "@/lib/account/use-account";
import type { AccountPrescription, AccountPrescriptionStatus } from "@/types/account";
import { DetailList, EmptyState, Modal, PANEL, PageTitle, Pagination, TABLE_HEAD, TD, TH, usePaged } from "./ui";

const STATUS: Record<AccountPrescriptionStatus, { label: string; tone: "info" | "success" | "neutral" }> = {
  under_review: { label: "Under review", tone: "info" },
  dispensed: { label: "Dispensed", tone: "success" },
  expired: { label: "Expired", tone: "neutral" },
};

const VIA = { whatsapp: "Sent on WhatsApp", branch: "Handed in at branch", repeat: "Repeat prescription" };

/** No real files are stored in the prototype, so this is an illustration, clearly labelled. */
function SamplePreview({ p, customer }: { p: AccountPrescription; customer: string }) {
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="flex items-center gap-1.5 mz-body-sm font-semibold text-warning-ink">
        <Icon name="info" size={16} /> Sample preview only: no prescription image is stored on this demonstration site
      </figcaption>
      <div aria-hidden className="relative overflow-hidden rounded-md border border-dashed border-line-strong bg-surface-sunken p-4 font-mono text-[12px] leading-5 text-ink-muted">
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[40px] font-bold uppercase tracking-widest text-line-strong/40 [transform:rotate(-18deg)]">Sample</span>
        <p className="font-semibold text-ink">{p.doctor}</p>
        <p>{p.clinic}</p>
        <p className="mt-2">Patient: {customer} · Date: {formatDate(p.date)}</p>
        <p className="mt-2">Rx</p>
        {p.medicines.map((m) => (
          <p key={m.name}>• {m.name} — {m.dosage} ({m.quantity})</p>
        ))}
      </div>
    </figure>
  );
}

function PrescriptionDetails({ p, customer, onClose }: { p: AccountPrescription | null; customer: string; onClose: () => void }) {
  const branch = p ? getBranch(p.branchId) : undefined;
  return (
    <Modal open={!!p} onClose={onClose} title="Prescription Details" icon="file-text" size="lg" footer={<Button onClick={onClose}>Close</Button>}>
      {p && (
        <div className="flex flex-col gap-4">
          <DetailList
            className="-my-2.5"
            rows={[
              ["Prescription ID", <span key="id" className="mz-code">{p.id}</span>],
              ["Customer", customer],
              ["Date received", formatDate(p.date)],
              ["Prescribed by", `${p.doctor}, ${p.clinic}`],
              ["How we received it", VIA[p.via]],
              ["Status", <Badge key="s" tone={STATUS[p.status].tone} dot>{STATUS[p.status].label}</Badge>],
              ["Branch", branch ? `${branch.name}${branch.id === "b1" ? " (Main)" : ""}${branch.confirmed && branch.address ? ` · ${branch.address}` : ""}` : branchName(p.branchId)],
            ]}
          />
          <div className="flex flex-col gap-2">
            <h3 className="mz-label">Medicines</h3>
            {p.medicines.length ? (
              <ul className="divide-y divide-line rounded-md border border-line">
                {p.medicines.map((m) => (
                  <li key={m.name} className="flex flex-col gap-0.5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <span className="mz-label">{m.name}</span>
                    <span className="mz-body-sm text-ink-muted">{m.dosage} · {m.quantity}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-muted">A pharmacist will add the medicines after checking the prescription.</p>
            )}
          </div>
          {p.note && <Alert tone={p.status === "expired" ? "warning" : "info"}>{p.note}</Alert>}
          <SamplePreview p={p} customer={customer} />
        </div>
      )}
    </Modal>
  );
}

export function PrescriptionsView() {
  const account = useAccount();
  const [selected, setSelected] = useState<AccountPrescription | null>(null);
  const paged = usePaged(account?.prescriptions ?? [], 8);
  if (!account) return null;
  const list = account.prescriptions;

  return (
    <>
      <PageTitle title="My Prescriptions" description="Prescriptions you have sent to or handed in at Medizone Pharmacy." />

      <Alert tone="warning" title="Prescription medicines are not sold through online checkout">
        To fill a prescription, send a clear photo on WhatsApp or call {site.phone}, or bring it to any branch. A pharmacist checks every prescription before dispensing.
      </Alert>

      <section aria-labelledby="rx-title" className={cx(PANEL, "overflow-hidden")}>
        <h2 id="rx-title" className="border-b border-line px-5 py-3.5 mz-h3 text-primary-tint-ink">Prescription history</h2>
        {list.length === 0 ? (
          <EmptyState icon="file-text" title="No prescriptions yet">
            Prescriptions you send on WhatsApp or hand in at a branch will be listed here.
          </EmptyState>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className={TABLE_HEAD}>
                  <tr>
                    <th scope="col" className={TH}>Prescription ID</th>
                    <th scope="col" className={TH}>Date</th>
                    <th scope="col" className={TH}>Medicines</th>
                    <th scope="col" className={TH}>Status</th>
                    <th scope="col" className={TH}><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {paged.slice.map((p) => (
                    <tr key={p.id} className="border-b border-line last:border-0 hover:bg-surface-hover">
                      <td className={cx(TD, "whitespace-nowrap mz-code")}>{p.id}</td>
                      <td className={cx(TD, "whitespace-nowrap")}>{formatDate(p.date)}</td>
                      <td className={TD}>
                        <p className="max-w-80 truncate">{p.medicines.map((m) => m.name).join(", ") || "To be confirmed by a pharmacist"}</p>
                        <p className="mz-body-sm text-ink-muted">{p.doctor}</p>
                      </td>
                      <td className={TD}><Badge tone={STATUS[p.status].tone} dot>{STATUS[p.status].label}</Badge></td>
                      <td className={cx(TD, "text-right")}>
                        <Button size="sm" variant="ghost" iconRight="arrow-right" onClick={() => setSelected(p)}>
                          View Details<span className="sr-only"> for {p.id}</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination {...paged} onChange={paged.setPage} noun="prescriptions" />
          </>
        )}
      </section>

      <PrescriptionDetails p={selected} customer={account.name} onClose={() => setSelected(null)} />
    </>
  );
}
