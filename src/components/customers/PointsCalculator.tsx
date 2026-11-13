"use client";

import { useState, type FormEvent } from "react";
import { calculateLoyaltyPoints, formatLKR, formatNumber, formatPhone } from "@/lib/customers";
import { useCustomers } from "./CustomersProvider";
import { Button } from "./ui/Button";
import { Card, CardHeader } from "./ui/Card";
import { SelectField, TextField } from "./ui/Field";

interface Errors {
  customerId?: string;
  amount?: string;
}

const MAX_BILL = 1_000_000;

/** Applies the earning rule live, and can add the points to a customer's balance. */
export function PointsCalculator() {
  const { customers, getCustomer, recordPurchasePoints, notify } = useCustomers();
  const [customerId, setCustomerId] = useState("");
  const [amountText, setAmountText] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const amount = Number(amountText.replace(/,/g, ""));
  const validAmount = amountText.trim() !== "" && Number.isFinite(amount) && amount > 0;
  const points = validAmount ? calculateLoyaltyPoints(amount) : 0;
  const customer = getCustomer(customerId);

  function validate(): Errors {
    const e: Errors = {};
    if (!customerId) e.customerId = "Choose a customer";
    if (!amountText.trim()) e.amount = "Enter the amount paid";
    else if (!Number.isFinite(amount) || amount <= 0) e.amount = "Amount must be above zero";
    else if (amount > MAX_BILL) e.amount = `Amount must be below ${formatLKR(MAX_BILL, { decimals: 0 })}`;
    else if (amount < 100) e.amount = "Bills under Rs. 100 earn no points";
    return e;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    window.setTimeout(() => {
      const txn = recordPurchasePoints(customerId, amount);
      setSaving(false);
      if (txn && customer) {
        notify({
          tone: "success",
          title: `${formatNumber(txn.points)} points added`,
          description: `${customer.name}'s balance is now ${formatNumber(customer.loyaltyPoints + txn.points)} points.`,
        });
        setAmountText("");
      }
    }, 300);
  }

  return (
    <Card as="section" aria-labelledby="points-calculator-title">
      <CardHeader id="points-calculator-title" title="Points Calculator" description="Record points for a counter bill paid outside the Billing module." />
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4 px-5 pb-5">
        <SelectField
          label="Customer"
          required
          placeholder="Choose a customer"
          value={customerId}
          error={errors.customerId}
          onChange={(e) => {
            setCustomerId(e.target.value);
            setErrors((x) => ({ ...x, customerId: undefined }));
          }}
          options={[...customers].sort((a, b) => a.name.localeCompare(b.name)).map((c) => ({ value: c.id, label: `${c.name} · ${formatPhone(c.phone)}` }))}
        />
        <TextField
          label="Amount paid"
          required
          prefix="Rs."
          inputMode="decimal"
          placeholder="2,450.00"
          value={amountText}
          error={errors.amount}
          hint="After any regular-customer discount"
          onChange={(e) => {
            setAmountText(e.target.value);
            setErrors((x) => ({ ...x, amount: undefined }));
          }}
        />
        <div className="rounded-md bg-(--loyalty-bg) p-4 text-(--loyalty-ink)" aria-live="polite">
          <p className="text-[11px] leading-[14px] font-bold tracking-[0.08em] uppercase">Points for this bill</p>
          <p className="mt-1 text-[30px] leading-9 font-semibold tabular-nums">
            {formatNumber(points)} <span className="text-[15px] font-medium">points</span>
          </p>
          <p className="mt-1 text-[13px] leading-[18px]">
            {validAmount
              ? `${formatLKR(amount)} ÷ 100 = ${(amount / 100).toFixed(2)}, rounded down to ${formatNumber(points)}`
              : "Enter an amount to see the points."}
          </p>
        </div>
        <Button type="submit" icon="plus" loading={saving} disabled={!validAmount || points === 0 || !customerId}>
          {points > 0 ? `Add ${formatNumber(points)} points` : "Add points"}
        </Button>
      </form>
    </Card>
  );
}
