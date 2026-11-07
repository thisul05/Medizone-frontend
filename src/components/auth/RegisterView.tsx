"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button, ButtonLink, Icon, cx, useToast } from "@/components/shared";
import { useAuth } from "@/lib/auth";
import { normalisePhone } from "@/lib/auth-store";
import type { BranchId } from "@/types/roles";
import { AuthShell } from "./AuthShell";
import { INITIAL_VALUES, STEPS, STEP_FIELDS, validateStep, type FieldName, type RegisterValues } from "./register-validation";
import { RegisterStepAddress } from "./RegisterStepAddress";
import { RegisterStepDetails } from "./RegisterStepDetails";
import { RegisterStepPassword } from "./RegisterStepPassword";
import { useRedirectIfSignedIn } from "./useRedirectIfSignedIn";

const POINTS = [
  { icon: "gift" as const, text: "Loyalty points on every bill" },
  { icon: "percent" as const, text: "3% or 5% off as a regular customer" },
  { icon: "bell" as const, text: "Order updates and restock reminders" },
];

function focusFirstInvalid(step: number, errors: Partial<Record<FieldName, string>>) {
  const first = STEP_FIELDS[step].find((f) => errors[f]);
  if (first) requestAnimationFrame(() => document.getElementById(`reg-${first}`)?.focus());
}

export function RegisterView() {
  const { register } = useAuth();
  const toast = useToast();
  const handledRef = useRedirectIfSignedIn();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<RegisterValues>(INITIAL_VALUES);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [shown, setShown] = useState<boolean[]>([false, false, false]);
  const [loading, setLoading] = useState(false);
  const [doneName, setDoneName] = useState<string | null>(null);

  const errors = validateStep(step, values);
  const stepProps = {
    values,
    set: <K extends FieldName>(field: K, value: RegisterValues[K]) => {
      setValues((v) => ({ ...v, [field]: value }));
    },
    err: (f: FieldName) => (touched[f] || shown[step] ? errors[f] : undefined),
    blur: (f: FieldName) => setTouched((t) => ({ ...t, [f]: true })),
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const current = validateStep(step, values);
    if (Object.values(current).some(Boolean)) {
      setShown((s) => s.map((x, i) => (i === step ? true : x)));
      focusFirstInvalid(step, current);
      return;
    }
    if (step < 2) {
      setStep(step + 1);
      window.scrollTo({ top: 0 });
      return;
    }
    setLoading(true);
    handledRef.current = true;
    const phone = normalisePhone(values.phone);
    const result = await register({
      ...values,
      phone,
      whatsapp: values.sameWhatsapp ? phone : values.whatsapp,
      gender: values.gender || undefined,
      preferredBranchId: values.preferredBranchId as BranchId,
    });
    setLoading(false);
    if (!result.ok) {
      handledRef.current = false;
      setShown([true, false, false]);
      setStep(0);
      focusFirstInvalid(0, result.errors);
      return;
    }
    setDoneName(values.fullName.trim().split(/\s+/)[0]);
    toast({ tone: "success", title: "Account created" });
  }

  if (doneName) {
    return (
      <AuthShell heading="Create your Medizone account" points={POINTS}>
        <div className="flex flex-col items-start gap-4" role="status">
          <span className="flex size-12 items-center justify-center rounded-pill bg-success-bg text-success-ink">
            <Icon name="circle-check" size={28} />
          </span>
          <h1 className="text-h1">Your account is ready, {doneName}</h1>
          <p className="text-body-lg text-ink-muted">
            Staff can mark you as a regular customer at your branch to get your 3% or 5% discount.
          </p>
          <div className="flex w-full flex-col gap-3 pt-2">
            <ButtonLink href="/shop" size="lg" block icon="bag">Start shopping</ButtonLink>
            <ButtonLink href="/home" size="lg" variant="secondary" block>Go to your account</ButtonLink>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell heading="Create your Medizone account" points={POINTS}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-h1">Create account</h1>
          <p className="text-label text-ink-muted" aria-live="polite">Step {step + 1} of 3: {STEPS[step]}</p>
          <ol className="grid grid-cols-3 gap-2" aria-label="Registration steps">
            {STEPS.map((name, i) => (
              <li key={name} aria-current={i === step ? "step" : undefined} className="flex flex-col gap-1.5">
                <span className={cx("h-1 rounded-pill", i <= step ? "bg-primary" : "bg-line")} />
                <span className={cx("text-body-sm", i === step ? "font-semibold text-ink" : "text-ink-muted")}>{name}</span>
              </li>
            ))}
          </ol>
        </div>

        {step === 0 && <RegisterStepDetails {...stepProps} />}
        {step === 1 && <RegisterStepAddress {...stepProps} />}
        {step === 2 && <RegisterStepPassword {...stepProps} />}

        <div className="flex gap-3">
          {step > 0 && (
            <Button size="lg" variant="secondary" icon="arrow-left" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button type="submit" size="lg" block loading={loading} iconRight={step < 2 ? "arrow-right" : undefined}>
            {step < 2 ? "Continue" : "Create account"}
          </Button>
        </div>
      </form>
      <p className="mt-6 text-center text-body text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-link hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}
