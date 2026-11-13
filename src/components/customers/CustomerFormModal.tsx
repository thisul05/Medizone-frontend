"use client";

import { useState, type FormEvent } from "react";
import { branches } from "@/data/customers";
import { formatNumber, isValidEmail, isValidSriLankanMobile } from "@/lib/customers";
import type { BranchId, Customer, CustomerInput, DiscountPercent } from "@/types/customers";
import { useCustomers } from "./CustomersProvider";
import { Button } from "./ui/Button";
import { SelectField, TextField, TextareaField } from "./ui/Field";
import { Modal } from "./ui/Modal";

interface FormValues {
  name: string;
  phone: string;
  email: string;
  address: string;
  branchId: BranchId;
  type: "regular" | "non_regular";
  /** "" until staff choose 3% or 5%; regular customers never get a discount by default. */
  discount: "" | "3" | "5";
}

type Errors = Partial<Record<"name" | "phone" | "email" | "discount", string>>;

const EMPTY: FormValues = { name: "", phone: "", email: "", address: "", branchId: "b2", type: "non_regular", discount: "" };

interface CustomerFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Pass a customer to edit it; leave out to add a new one. */
  customer?: Customer;
  onSaved: (customer: Customer) => void;
}

/** Add New Customer / Edit customer details. Remounts each time it opens, so the form always starts fresh. */
export function CustomerFormModal(props: CustomerFormModalProps) {
  if (!props.open) return null;
  return <CustomerForm {...props} />;
}

function toValues(customer: Customer): FormValues {
  return {
    name: customer.name,
    phone: customer.phone,
    email: customer.email ?? "",
    address: customer.address ?? "",
    branchId: customer.branchId,
    type: customer.isRegular ? "regular" : "non_regular",
    discount: customer.isRegular && customer.discountPercent ? (String(customer.discountPercent) as "3" | "5") : "",
  };
}

function CustomerForm({ onClose, customer, onSaved }: CustomerFormModalProps) {
  const { addCustomer, updateCustomer, isPhoneTaken } = useCustomers();
  const editing = Boolean(customer);
  const [values, setValues] = useState<FormValues>(customer ? toValues(customer) : EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  function validate(v: FormValues): Errors {
    const e: Errors = {};
    const name = v.name.trim();
    if (!name) e.name = "Full name is required.";
    else if (name.length < 3) e.name = "Full name must be at least 3 characters.";
    else if (!/^[\p{L} .'-]+$/u.test(name)) e.name = "Use letters, spaces, full stops and hyphens only.";
    if (!v.phone.trim()) e.phone = "Phone number is required.";
    else if (!isValidSriLankanMobile(v.phone)) e.phone = "Enter a valid 10-digit phone number.";
    else if (isPhoneTaken(v.phone, customer?.id)) e.phone = "This phone number is already registered to another customer.";
    if (v.email.trim() && !isValidEmail(v.email)) e.email = "Enter a valid email address.";
    if (v.type === "regular" && !v.discount) e.discount = "Select a 3% or 5% discount for a regular customer.";
    return e;
  }

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    const next = { ...values, [key]: value };
    // Non-regular customers always have 0%; switching to regular makes staff choose 3% or 5%.
    if (key === "type") next.discount = value === "regular" && customer?.isRegular ? toValues(customer).discount : "";
    setValues(next);
    if (submitted) setErrors(validate(next));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const found = validate(values);
    setErrors(found);
    const firstKey = Object.keys(found)[0];
    if (firstKey) {
      document.getElementById(`customer-${firstKey}`)?.focus();
      return;
    }
    const isRegular = values.type === "regular";
    const input: CustomerInput = {
      name: values.name,
      phone: values.phone,
      email: values.email,
      address: values.address,
      branchId: values.branchId,
      isRegular,
      discountPercent: (isRegular ? Number(values.discount) : 0) as DiscountPercent,
    };
    setSaving(true);
    // A short pause so the saving state is visible, like a real save.
    window.setTimeout(() => {
      if (customer) {
        updateCustomer(customer.id, input);
        onSaved({ ...customer, ...input, discountPercent: input.discountPercent });
      } else {
        onSaved(addCustomer(input));
      }
      setSaving(false);
    }, 350);
  }

  const isRegular = values.type === "regular";

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? "Edit Customer Details" : "Add New Customer"}
      description={editing ? `Changes apply to ${customer?.name}'s record across the module.` : "Register a customer through manual staff entry."}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="min-w-[104px]">
            Cancel
          </Button>
          <Button type="submit" form="customer-form" loading={saving} className="min-w-[128px]">
            {editing ? "Save Changes" : "Add Customer"}
          </Button>
        </>
      }
    >
      <form id="customer-form" noValidate onSubmit={onSubmit} className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
        <TextField
          id="customer-name"
          label="Full Name"
          required
          data-autofocus
          autoComplete="name"
          placeholder="Enter full name"
          value={values.name}
          error={errors.name}
          onChange={(e) => update("name", e.target.value)}
          containerClassName="sm:col-span-2"
        />
        <TextField
          id="customer-phone"
          label="Phone Number"
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="e.g. 077 234 5678"
          value={values.phone}
          error={errors.phone}
          onChange={(e) => update("phone", e.target.value)}
        />
        <TextField
          id="customer-email"
          label="Email (optional)"
          type="email"
          autoComplete="email"
          placeholder="Email address (optional)"
          value={values.email}
          error={errors.email}
          onChange={(e) => update("email", e.target.value)}
        />
        {editing ? (
          <TextareaField
            id="customer-address"
            label="Address (optional)"
            rows={2}
            placeholder="House number, street, town"
            value={values.address}
            onChange={(e) => update("address", e.target.value)}
            containerClassName="sm:col-span-2"
          />
        ) : null}
        <SelectField
          id="customer-branchId"
          label="Branch"
          value={values.branchId}
          onChange={(e) => update("branchId", e.target.value as BranchId)}
          options={branches.map((b) => ({ value: b.id, label: b.name }))}
          containerClassName="sm:col-span-2"
        />
        <SelectField
          id="customer-type"
          label="Customer Type"
          value={values.type}
          onChange={(e) => update("type", e.target.value as FormValues["type"])}
          options={[
            { value: "non_regular", label: "Non-Regular" },
            { value: "regular", label: "Regular" },
          ]}
        />
        {isRegular ? (
          <SelectField
            id="customer-discount"
            label="Discount"
            required
            placeholder="Select discount"
            value={values.discount}
            error={errors.discount}
            onChange={(e) => update("discount", e.target.value as FormValues["discount"])}
            options={[
              { value: "3", label: "3%" },
              { value: "5", label: "5%" },
            ]}
          />
        ) : (
          <SelectField
            id="customer-discount"
            label="Discount"
            value="0"
            disabled
            hint="Non-regular customers have no discount."
            options={[{ value: "0", label: "0%" }]}
          />
        )}
        <div className="flex items-center justify-between gap-4 rounded-md bg-(--surface-sunken) px-3 py-3 sm:col-span-2">
          <div>
            <p className="text-[13px] font-medium text-(--ink)">{editing ? "Current Loyalty Points" : "Initial Loyalty Points"}</p>
            <p className="text-[11px] leading-4 text-(--ink-muted)">Read-only · earned automatically from purchases</p>
          </div>
          <output className="text-xl font-bold text-(--heading) tabular-nums" aria-label="Loyalty points">
            {formatNumber(customer?.loyaltyPoints ?? 0)}
          </output>
        </div>
      </form>
    </Modal>
  );
}
