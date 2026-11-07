"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Button, Icon, Select, cx, useToast } from "@/components/shared";
import { branches, branchName } from "@/data/branches";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import type { BranchId } from "@/types/roles";

type Method = "pickup" | "delivery";
type Pay = "cash" | "card" | "bank" | "cod";

const PAY_LABELS: Record<Pay, string> = { cash: "Cash", card: "Card", bank: "Bank transfer", cod: "Cash on delivery" };

function Choice({ name, checked, onChange, title, detail }: { name: string; checked: boolean; onChange: () => void; title: string; detail?: string }) {
  return (
    <label
      className={cx(
        "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors duration-150",
        checked ? "border-primary bg-primary-tint" : "border-line-strong hover:bg-surface-hover",
      )}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="mt-0.5 size-4 accent-primary" />
      <span className="flex flex-col">
        <span className="text-label">{title}</span>
        {detail && <span className="text-body-sm text-ink-muted">{detail}</span>}
      </span>
    </label>
  );
}

/** Mock checkout. Nothing is sent anywhere. */
export function CartCheckout() {
  const { user } = useAuth();
  const { clear, setOpen } = useCart();
  const toast = useToast();
  const router = useRouter();
  const [method, setMethod] = useState<Method>("pickup");
  const [branch, setBranch] = useState<BranchId>(user?.role === "customer" && user.branchId !== "all" ? user.branchId : "b1");
  const [pay, setPay] = useState<Pay>("cash");
  const [placing, setPlacing] = useState(false);

  const isStaffUser = !!user && user.role !== "customer";
  const payOptions: Pay[] = method === "delivery" ? ["cash", "card", "bank", "cod"] : ["cash", "card", "bank"];
  const effectivePay = payOptions.includes(pay) ? pay : "cash";

  async function placeOrder() {
    if (!user) {
      toast({ tone: "info", title: "Sign in to place your order" });
      setOpen(false);
      router.push("/login?next=" + encodeURIComponent("/"));
      return;
    }
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 400));
    setPlacing(false);
    toast({
      tone: "success",
      title: "Order placed. We'll call you to confirm.",
      description:
        method === "pickup"
          ? `It will be ready for collection at ${branchName(branch)}. Paying by ${PAY_LABELS[effectivePay].toLowerCase()}.`
          : `Home delivery. Paying by ${PAY_LABELS[effectivePay].toLowerCase()}.`,
    });
    clear();
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-4 border-t border-line px-5 py-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-label">How would you like to get it?</legend>
        <Choice name="method" checked={method === "pickup"} onChange={() => setMethod("pickup")} title="Collect from a branch" />
        {method === "pickup" && (
          <Select
            label="Branch to collect from"
            value={branch}
            onChange={(e) => setBranch(e.target.value as BranchId)}
            options={branches.map((b) => ({ value: b.id, label: b.confirmed ? `${b.name}, ${b.area}` : `${b.name} (details coming soon)` }))}
          />
        )}
        <Choice
          name="method"
          checked={method === "delivery"}
          onChange={() => setMethod("delivery")}
          title="Home delivery"
          detail="Islandwide delivery. Fee confirmed when we call you."
        />
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-label">Pay with</legend>
        <div className="grid grid-cols-2 gap-2">
          {payOptions.map((p) => (
            <Choice key={p} name="pay" checked={effectivePay === p} onChange={() => setPay(p)} title={PAY_LABELS[p]} />
          ))}
        </div>
      </fieldset>

      {isStaffUser ? (
        <>
          <Alert tone="info">Sign in as a customer to place an order.</Alert>
          <Button size="lg" block disabled>
            Place order
          </Button>
        </>
      ) : (
        <Button size="lg" block loading={placing} onClick={placeOrder}>
          Place order
        </Button>
      )}
      <p className="flex items-center gap-1.5 text-body-sm text-ink-muted">
        <Icon name="lock" size={16} />
        Prototype checkout. No payment is taken.
      </p>
    </div>
  );
}
