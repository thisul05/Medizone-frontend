"use client";

import { formatDate, prescriptionStatus } from "@/lib/customers";
import type { Customer, StoredPrescription } from "@/types/customers";
import { useCustomers } from "./CustomersProvider";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Icon } from "./ui/Icon";
import { Modal } from "./ui/Modal";

interface PrescriptionPreviewModalProps {
  prescription?: StoredPrescription;
  customer: Customer;
  onClose: () => void;
}

/**
 * Preview of a stored prescription. This prototype stores no real files, so the document
 * is drawn from the prescription record and clearly labelled as a sample.
 */
export function PrescriptionPreviewModal({ prescription, customer, onClose }: PrescriptionPreviewModalProps) {
  const { today } = useCustomers();
  const open = Boolean(prescription);
  const status = prescription ? prescriptionStatus(prescription, today) : "active";

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      divider
      title="Prescription Preview"
      description={prescription ? `${prescription.id} · ${prescription.fileName ?? "Stored document"}` : undefined}
      footer={
        <Button variant="secondary" onClick={onClose} className="min-w-[100px]">
          Close
        </Button>
      }
    >
      {prescription ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-(--ink-muted)">
            <Icon name={prescription.fileType === "jpg" ? "image" : "file"} size={16} />
            {prescription.fileType === "jpg" ? "JPG image" : "PDF document"}
            <span aria-hidden>·</span>
            {status === "active" ? <Badge tone="success">Valid until {formatDate(prescription.validUntil)}</Badge> : <Badge tone="outline">Expired {formatDate(prescription.validUntil)}</Badge>}
          </div>

          {/* Sample rendering of the document */}
          <figure className="rounded-md border border-(--border) bg-(--surface-sunken) p-3 sm:p-4" aria-label={`Sample preview of prescription ${prescription.id}`}>
            <div className={`mx-auto max-w-[460px] bg-white p-5 text-[#1b2433] shadow-(--shadow-1) ${prescription.fileType === "jpg" ? "-rotate-1" : ""}`}>
              <div className="flex items-start justify-between gap-3 border-b border-[#c9d2de] pb-3">
                <div>
                  <p className="text-base font-bold">{prescription.doctorName}</p>
                  <p className="text-xs text-[#4b5a70]">{prescription.hospital}</p>
                </div>
                <p className="text-xs text-[#4b5a70]">{formatDate(prescription.issuedOn)}</p>
              </div>
              <p className="mt-3 text-xs text-[#4b5a70]">
                Patient: <span className="font-semibold text-[#1b2433]">{customer.name}</span>
              </p>
              <p className="mt-3 font-serif text-2xl leading-none font-bold italic">Rx</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                {prescription.medicines.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ol>
              {prescription.notes ? <p className="mt-3 border-t border-dashed border-[#c9d2de] pt-2 text-xs leading-5 text-[#4b5a70]">{prescription.notes}</p> : null}
              <p className="mt-5 text-right text-xs text-[#4b5a70]">Signature on original</p>
            </div>
            <figcaption className="mt-3 text-center text-xs text-(--ink-muted)">
              Sample preview generated from the stored record. Frontend prototype: no original file is stored.
            </figcaption>
          </figure>
        </div>
      ) : null}
    </Modal>
  );
}
