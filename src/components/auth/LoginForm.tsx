"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { Alert, Button, Checkbox, PasswordField, TextField, useToast } from "@/components/shared";
import { site } from "@/data/site";
import { useAuth } from "@/lib/auth";
import { destinationFor } from "./useRedirectIfSignedIn";

interface LoginFormProps {
  next: string | null;
  handledRef: RefObject<boolean>;
}

type Errors = { identifier?: string; password?: string };

const MESSAGES = {
  identifier: "Enter your mobile number, email or username",
  password: "Enter your password",
};

/** One sign-in form for customers, staff and the owner. The account decides the role. */
export function LoginForm({ next, handledRef }: LoginFormProps) {
  const { signIn, lockedUntil } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [forgot, setForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(0);
  const idRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);

  const secondsLeft = lockedUntil ? Math.max(0, Math.ceil((lockedUntil - now) / 1000)) : 0;
  const locked = secondsLeft > 0;

  useEffect(() => {
    if (!lockedUntil) return;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [lockedUntil]);

  const validate = (field: keyof Errors, value: string) => (value.trim() ? undefined : MESSAGES[field]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (locked) return;
    const found: Errors = { identifier: validate("identifier", identifier), password: validate("password", password) };
    setErrors(found);
    setFormError(null);
    if (found.identifier || found.password) {
      (found.identifier ? idRef : pwRef).current?.focus();
      return;
    }
    setLoading(true);
    handledRef.current = true;
    const result = await signIn(identifier, password, remember);
    setLoading(false);
    if (result.ok) {
      toast({ tone: "success", title: `Signed in as ${result.user.name}` });
      router.replace(destinationFor(result.user.role, next));
      return;
    }
    handledRef.current = false;
    setNow(Date.now());
    setFormError(result.message);
    if (result.field) {
      setErrors({ [result.field]: result.message });
      (result.field === "identifier" ? idRef : pwRef).current?.focus();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1">Sign in</h1>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {formError && <Alert tone="danger">{formError}</Alert>}
        {locked && (
          <Alert tone="warning" title="Sign-in is paused">
            Too many attempts. Try again in {secondsLeft} second{secondsLeft === 1 ? "" : "s"}.
          </Alert>
        )}
        <TextField
          ref={idRef}
          label="Mobile number, email or username"
          size="lg"
          autoComplete="username"
          placeholder="077 123 4567"
          value={identifier}
          error={errors.identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          onBlur={() => setErrors((er) => ({ ...er, identifier: validate("identifier", identifier) }))}
        />
        <PasswordField
          ref={pwRef}
          label="Password"
          size="lg"
          autoComplete="current-password"
          value={password}
          error={errors.password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setErrors((er) => ({ ...er, password: validate("password", password) }))}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Checkbox label="Keep me signed in" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <button type="button" onClick={() => setForgot((f) => !f)} aria-expanded={forgot} className="rounded-sm text-label text-link hover:underline">
            Forgot password?
          </button>
        </div>
        {forgot && (
          <Alert tone="info" title="Reset your password">
            Call us on {site.phone} or visit any branch and we&apos;ll help you reset it.
          </Alert>
        )}
        <Button type="submit" size="lg" block loading={loading} disabled={locked}>
          Sign in
        </Button>
      </form>

      <p className="text-center text-body text-ink-muted">
        New to Medizone?{" "}
        <Link href="/register" className="font-semibold text-link hover:underline">
          Create account
        </Link>
      </p>
      <p className="text-center text-body-sm font-medium text-ink-muted">Prototype: demo accounts only, not real security.</p>
    </div>
  );
}
