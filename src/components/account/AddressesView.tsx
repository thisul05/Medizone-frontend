"use client";

import { useState, type FormEvent } from "react";
import { Badge, Button, Checkbox, Icon, Select, TextField, cx, useToast } from "@/components/shared";
import { SRI_LANKA_DISTRICTS } from "@/data/account";
import { formatPhone } from "@/lib/format";
import { validateAddress, type FieldErrors } from "@/lib/account/rules";
import { deleteAddress, saveAddress, setDefaultAddress } from "@/lib/account/store";
import { useAccount, type AccountData } from "@/lib/account/use-account";
import type { AddressInput, AddressLabel, SavedAddress } from "@/types/account";
import { ConfirmDialog, EmptyState, Modal, PANEL, PageTitle } from "./ui";

const DISTRICTS = SRI_LANKA_DISTRICTS.map((d) => ({ value: d, label: d }));
const LABELS: { value: AddressLabel; label: string }[] = [
  { value: "Home", label: "Home" },
  { value: "Work", label: "Work" },
  { value: "Other", label: "Other" },
];

function AddressForm({ account, editing, onDone, onCancel }: { account: AccountData; editing: SavedAddress | null; onDone: (msg: string) => void; onCancel: () => void }) {
  const [form, setForm] = useState<AddressInput>(
    editing
      ? { label: editing.label, fullName: editing.fullName, phone: editing.phone ? formatPhone(editing.phone) : "", addressLine: editing.addressLine, city: editing.city, district: editing.district, postalCode: editing.postalCode }
      : { label: account.addresses.some((a) => a.label === "Home") ? "Work" : "Home", fullName: account.name, phone: account.profile.phone ? formatPhone(account.profile.phone) : "", addressLine: "", city: "", district: "", postalCode: "" },
  );
  const [makeDefault, setMakeDefault] = useState(editing?.isDefault ?? account.addresses.length === 0);
  const [errors, setErrors] = useState<FieldErrors<keyof AddressInput>>({});
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof AddressInput>(key: K, value: AddressInput[K]) => {
    const next = { ...form, [key]: value };
    setForm(next);
    if (submitted) setErrors(validateAddress(next));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const found = validateAddress(form);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    saveAddress(account.customerId, account.addresses, form, editing?.id, makeDefault);
    onDone(editing ? "Address updated" : "Address added");
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Address label" value={form.label} onChange={(e) => set("label", e.target.value as AddressLabel)} options={LABELS} />
        <TextField label="Full Name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} error={errors.fullName} autoComplete="name" required data-autofocus />
        <TextField label="Phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} error={errors.phone} autoComplete="tel" placeholder="077 123 4567" required />
        <TextField label="Postal Code" value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} error={errors.postalCode} inputMode="numeric" maxLength={5} autoComplete="postal-code" placeholder="10300" required />
        <TextField label="Address Line" value={form.addressLine} onChange={(e) => set("addressLine", e.target.value)} error={errors.addressLine} autoComplete="street-address" placeholder="45/2 Temple Road" required fieldClassName="sm:col-span-2" />
        <TextField label="City" value={form.city} onChange={(e) => set("city", e.target.value)} error={errors.city} autoComplete="address-level2" placeholder="Piliyandala" required />
        <Select label="District" value={form.district} onChange={(e) => set("district", e.target.value)} error={errors.district} options={DISTRICTS} placeholder="Choose a district" required />
      </div>
      <Checkbox
        label="Use as my default delivery address"
        checked={makeDefault}
        disabled={editing?.isDefault || account.addresses.length === 0}
        onChange={(e) => setMakeDefault(e.target.checked)}
      />
      <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" icon="check">{editing ? "Save Address" : "Add Address"}</Button>
      </div>
    </form>
  );
}

function AddressCard({ a, onEdit, onDelete, onDefault }: { a: SavedAddress; onEdit: () => void; onDelete: () => void; onDefault: () => void }) {
  return (
    <li className={cx(PANEL, "flex flex-col gap-3 p-4", a.isDefault && "border-primary ring-1 ring-primary")}>
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-2 mz-h3 text-primary-tint-ink">
          <Icon name={a.label === "Work" ? "building" : a.label === "Home" ? "home" : "map-pin"} size={18} />
          {a.label}
        </p>
        {a.isDefault && <Badge tone="brand" icon="check">Default Address</Badge>}
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <p className="mz-label">{a.fullName}</p>
        <p className="text-ink-muted">{a.phone ? formatPhone(a.phone) : "No phone number"}</p>
        <p>{a.addressLine}</p>
        <p>{a.city}{a.postalCode ? ` ${a.postalCode}` : ""}</p>
        <p className="text-ink-muted">{a.district ? `${a.district} District` : "District not set"}</p>
      </div>
      <div className="flex flex-wrap gap-1 border-t border-line pt-3">
        <Button size="sm" variant="ghost" onClick={onEdit}>Edit<span className="sr-only"> {a.label} address</span></Button>
        {!a.isDefault && <Button size="sm" variant="ghost" icon="check" onClick={onDefault}>Set as Default</Button>}
        <Button size="sm" variant="ghost" icon="trash" className="text-danger-ink hover:bg-danger-bg" onClick={onDelete}>Delete<span className="sr-only"> {a.label} address</span></Button>
      </div>
    </li>
  );
}

export function AddressesView() {
  const account = useAccount();
  const toast = useToast();
  const [modal, setModal] = useState<{ editing: SavedAddress | null } | null>(null);
  const [deleting, setDeleting] = useState<SavedAddress | null>(null);
  if (!account) return null;
  const list = account.addresses;

  return (
    <>
      <PageTitle
        title="My Addresses"
        description="Saved delivery addresses for your orders."
        actions={<Button icon="plus" onClick={() => setModal({ editing: null })}>Add Address</Button>}
      />

      {list.length === 0 ? (
        <div className={PANEL}>
          <EmptyState icon="map-pin" title="No saved addresses" action={<Button icon="plus" onClick={() => setModal({ editing: null })}>Add Address</Button>}>
            Save an address to make checkout faster.
          </EmptyState>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {list.map((a) => (
            <AddressCard
              key={a.id}
              a={a}
              onEdit={() => setModal({ editing: a })}
              onDelete={() => setDeleting(a)}
              onDefault={() => {
                setDefaultAddress(account.customerId, list, a.id);
                toast({ tone: "success", title: "Default address updated", description: `${a.label} is now your default delivery address.` });
              }}
            />
          ))}
        </ul>
      )}

      <p className="mz-body-sm text-ink-muted">Demo: addresses are saved in this browser only. Only one address can be the default.</p>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.editing ? "Edit Address" : "Add Address"}
        icon="map-pin"
        size="lg"
      >
        {modal && (
          <AddressForm
            key={modal.editing?.id ?? "new"}
            account={account}
            editing={modal.editing}
            onCancel={() => setModal(null)}
            onDone={(msg) => {
              setModal(null);
              toast({ tone: "success", title: msg });
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete this address?"
        confirmLabel="Delete Address"
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;
          deleteAddress(account.customerId, list, deleting.id);
          toast({ tone: "success", title: "Address deleted" });
          setDeleting(null);
        }}
      >
        {deleting && (
          <p>
            <strong className="font-semibold">{deleting.label}</strong>: {deleting.addressLine}, {deleting.city}.
            {deleting.isDefault && list.length > 1 ? " This is your default address, so your next saved address will become the default." : ""} This can&apos;t be undone.
          </p>
        )}
      </ConfirmDialog>
    </>
  );
}
