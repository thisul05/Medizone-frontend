"use client";

import { useState, type FormEvent } from "react";
import { branches, getBranchName } from "@/data/customers";
import { isValidEmail, isValidSriLankanMobile } from "@/lib/customers";
import type { BranchId, Customer, CustomerInput, DiscountPercent } from "@/types/customers";
import { useCustomers } from "./CustomersProvider";
import { Button } from "./ui/Button";
import { Checkbox, SelectField, TextField, TextareaField } from "./ui/Field";
import { Modal } from "./ui/Modal";

type Errors = Partial<Record<keyof CustomerInput, string>>;

const EMPTY: CustomerInput = {
  name: "",
  phone: "",
  email: "",
  address: "",
  branchId: "b1",
  isRegular: false,
  discountPercent: 0,
};

interface CustomerFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Pass a customer to edit it; leave out to add a new one. */
  customer?: Customer;
  onSaved: (customer: Customer) => void;
}

/** Add customer / Edit details. Remounts each time it opens so the form starts fresh. */
export function CustomerFormModal(props: CustomerFormModalProps) {
  if (!props.open) return null;
  return <CustomerForm {...props} />;
}

function CustomerForm({ onClose, customer, onSaved }: CustomerFormModalProps) {
  const { addCustomer, updateCustomer, isPhoneTaken } = useCustomers();
  const editing = Boolean(customer);
  const [values, setValues] = useState<CustomerInput>(
    customer
      ? {
          name: customer.name,
          phone: customer.phone,
          email: customer.email ?? "",
          address: customer.address,
          branchId: customer.branchId,
          isRegular: customer.isRegular,
          discountPercent: customer.discountPercent,
        }
      : EMPTY,
  );
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  function validate(v: CustomerInput): Errors {
    const e: Errors = {};
    const name = v.name.trim();
    if (!name) e.name = "Enter the customer's full name";
    else if (name.length < 3) e.name = "Name must be at least 3 characters";
    else if (!/^[\p{L} .'-]+$/u.test(name)) e.name = "Use letters, spaces, full stops and hyphens only";
    if (!v.phone.trim()) e.phone = "Enter a mobile number";
    else if (!isValidSriLankanMobile(v.phone)) e.phone = "Enter a 10-digit mobile number starting with 07";
    else if (isPhoneTaken(v.phone, customer?.id)) e.phone = "This number already belongs to another customer";
    if (v.email && !isValidEmail(v.email)) e.email = "Enter an email like name@example.com, or leave it blank";
    if (!v.address.trim()) e.address = "Enter the customer's address";
    if (v.isRegular && v.discountPercent !== 3 && v.discountPercent !== 5) e.discountPercent = "Choose a 3% or 5% discount";
    return e;
  }

  function update<K extends keyof CustomerInput>(key: K, value: CustomerInput[K]) {
    const next = { ...values, [key]: value };
    if (key === "isRegular") next.discountPercent = value ? 3 : 0;
    setValues(next);
    if (submitted) setErrors(validate(next));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const firstKey = Object.keys(found)[0];
      document.getElementById(`customer-${firstKey}`)?.focus();
      return;
    }
    setSaving(true);
    // Short pause so the saving state is visible, like a real save.
    window.setTimeout(() => {
      if (customer) {
        updateCustomer(customer.id, values);
        onSaved({ ...customer, ...values, discountPercent: values.isRegular ? values.discountPercent : 0 });
      } else {
        onSaved(addCustomer(values));
      }
      setSaving(false);
    }, 400);
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={editing ? "Edit customer details" : "Add customer"}
      description={editing ? `Changes apply to ${customer?.name}'s record in every module.` : "New customers start with 0 loyalty points."}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="customer-form" loading={saving} icon={editing ? "check" : "plus"}>
            {editing ? "Save changes" : "Add customer"}
          </Button>
        </>
      }
    >
      <form id="customer-form" noValidate onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          id="customer-name"
          label="Full name"
          required
          data-autofocus
          autoComplete="name"
          placeholder="e.g. Nimal Perera"
          value={values.name}
          error={errors.name}
          onChange={(e) => update("name", e.target.value)}
          containerClassName="sm:col-span-2"
        />
        <TextField
          id="customer-phone"
          label="Mobile number"
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="077 123 4567"
          value={values.phone}
          error={errors.phone}
          hint="Used for refill reminders"
          onChange={(e) => update("phone", e.target.value)}
        />
        <TextField
          id="customer-email"
          label="Email (optional)"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={values.email}
          error={errors.email}
          onChange={(e) => update("email", e.target.value)}
        />
        <TextareaField
          id="customer-address"
          label="Address"
          required
          rows={2}
          placeholder="House number, street, town"
          value={values.address}
          error={errors.address}
          onChange={(e) => update("address", e.target.value)}
          className="min-h-16"
        />
        <SelectField
          id="customer-branchId"
          label="Home branch"
          required
          value={values.branchId}
          onChange={(e) => update("branchId", e.target.value as BranchId)}
          options={branches.map((b) => ({ value: b.id, label: getBranchName(b.id) }))}
        />
        <fieldset className="flex flex-col gap-3 rounded-md border border-(--border) bg-(--surface-sunken) p-4 sm:col-span-2">
          <legend className="sr-only">Regular customer</legend>
          <Checkbox
            label="Regular customer"
            description="Regular customers get a 3% or 5% discount on every bill. This is separate from loyalty points."
            checked={values.isRegular}
            onChange={(e) => update("isRegular", e.target.checked)}
          />
          {values.isRegular ? (
            <SelectField
              id="customer-discountPercent"
              label="Discount"
              required
              value={String(values.discountPercent)}
              error={errors.discountPercent}
              onChange={(e) => update("discountPercent", Number(e.target.value) as DiscountPercent)}
              options={[
                { value: "3", label: "3% discount" },
                { value: "5", label: "5% discount" },
              ]}
              containerClassName="sm:max-w-60"
            />
          ) : null}
        </fieldset>
      </form>
    </Modal>
  );
}
