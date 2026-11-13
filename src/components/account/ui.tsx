"use client";

// Small building blocks shared by the customer account pages. Built on the shared design tokens.
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Button, Icon, cx, type IconName } from "@/components/shared";
import type { Rating } from "@/types/account";

/* ---------- Layout ---------- */

export const PANEL = "rounded-lg border border-line bg-surface-raised shadow-1";
export const TH = "whitespace-nowrap border-b border-line px-4 py-2.5 text-left mz-caption font-semibold text-ink-muted";
export const TD = "px-4 py-3 align-middle";
export const TABLE_HEAD = "bg-surface-sunken";

export function PageTitle({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="mz-h2 text-primary-tint-ink">{title}</h1>
        {description && <p className="text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, action, children, className, bodyClassName, id }: {
  title?: string; action?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string; id?: string;
}) {
  const titleId = useId();
  return (
    <section aria-labelledby={title ? titleId : undefined} id={id} className={cx(PANEL, className)}>
      {title && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3.5">
          <h2 id={titleId} className="mz-h3 text-primary-tint-ink">{title}</h2>
          {action}
        </div>
      )}
      <div className={cx("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatCard({ label, value, hint }: {
  icon?: IconName; label: string; value: ReactNode; hint?: ReactNode; tone?: "brand" | "loyalty" | "warning" | "success" | "danger" | "info";
}) {
  return (
    <div className={cx(PANEL, "flex flex-col p-5")}>
      <p className="text-xs font-semibold tracking-wider text-[#46566d] uppercase">{label}</p>
      <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#0e1b2e] tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-[#46566d]">{hint}</p>}
    </div>
  );
}

export function Avatar({ initials, size = 40, className }: { initials: string; size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      className={cx("flex shrink-0 items-center justify-center rounded-pill bg-primary font-bold text-primary-on", className)}
    >
      {initials}
    </span>
  );
}

export function EmptyState({ icon, title, children, action }: { icon: IconName; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-pill bg-surface-sunken text-ink-subtle">
        <Icon name={icon} size={24} />
      </span>
      <p className="mz-h3">{title}</p>
      {children && <p className="max-w-md text-ink-muted">{children}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Label / value rows. */
export function DetailList({ rows, className }: { rows: [string, ReactNode][]; className?: string }) {
  return (
    <dl className={cx("divide-y divide-line", className)}>
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-0.5 py-2.5 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-4">
          <dt className="mz-body-sm font-semibold text-ink-muted">{label}</dt>
          <dd className="min-w-0 break-words text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Filter chips (aria-pressed buttons). */
export function FilterChips<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: { id: T; label: string; count?: number }[]; onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.id)}
            className={cx(
              "h-control-sm rounded-pill border px-3 mz-label transition-colors duration-150",
              active ? "border-primary bg-primary text-primary-on" : "border-line-strong bg-surface-raised text-ink hover:bg-surface-hover",
            )}
          >
            {o.label}
            {o.count !== undefined && <span className="ml-1.5 opacity-80">{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Pagination ---------- */

export function usePaged<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, pages);
  return { page: current, pages, setPage, slice: items.slice((current - 1) * pageSize, current * pageSize), total: items.length, pageSize };
}

export function Pagination({ page, pages, total, pageSize, onChange, noun }: {
  page: number; pages: number; total: number; pageSize: number; onChange: (p: number) => void; noun: string;
}) {
  if (pages <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <nav aria-label={`${noun} pages`} className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3">
      <p className="mz-body-sm text-ink-muted">Showing {from}–{to} of {total} {noun}</p>
      <div className="flex items-center gap-1">
        <Button size="sm" variant="ghost" icon="chevron-left" disabled={page === 1} onClick={() => onChange(page - 1)}>Previous</Button>
        <span className="px-2 mz-body-sm text-ink-muted">Page {page} of {pages}</span>
        <Button size="sm" variant="ghost" iconRight="chevron-right" disabled={page === pages} onClick={() => onChange(page + 1)}>Next</Button>
      </div>
    </nav>
  );
}

/* ---------- Stars ---------- */

export function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24" aria-hidden className={n <= rating ? "text-warning-solid" : "text-line-strong"}>
          <path
            fill={n <= rating ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
            d="M12 2.8l2.84 5.76 6.36.92-4.6 4.48 1.08 6.33L12 17.3l-5.68 2.99 1.08-6.33-4.6-4.48 6.36-.92L12 2.8z"
          />
        </svg>
      ))}
    </span>
  );
}

const RATING_WORDS: Record<Rating, string> = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Very good", 5: "Excellent" };

/** Accessible 1–5 star picker: a radio group, arrow keys move between stars. */
export function StarInput({ value, onChange, error, label = "Your rating" }: { value: Rating | 0; onChange: (r: Rating) => void; error?: string; label?: string }) {
  const [hover, setHover] = useState(0);
  const name = useId();
  const shown = hover || value;
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 mz-label text-ink">{label}</legend>
      <div className="flex items-center gap-3" onMouseLeave={() => setHover(0)}>
        <div className="flex items-center gap-1">
          {([1, 2, 3, 4, 5] as Rating[]).map((n) => (
            <label key={n} className="cursor-pointer rounded-sm p-0.5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus" onMouseEnter={() => setHover(n)}>
              <input
                type="radio"
                name={name}
                value={n}
                checked={value === n}
                onChange={() => onChange(n)}
                className="sr-only"
                aria-label={`${n} star${n === 1 ? "" : "s"}, ${RATING_WORDS[n]}`}
              />
              <svg width={32} height={32} viewBox="0 0 24 24" aria-hidden className={n <= shown ? "text-warning-solid" : "text-line-strong"}>
                <path
                  fill={n <= shown ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  d="M12 2.8l2.84 5.76 6.36.92-4.6 4.48 1.08 6.33L12 17.3l-5.68 2.99 1.08-6.33-4.6-4.48 6.36-.92L12 2.8z"
                />
              </svg>
            </label>
          ))}
        </div>
        <span className="mz-label text-ink-muted" aria-hidden>{shown ? RATING_WORDS[shown as Rating] : "Choose 1 to 5 stars"}</span>
      </div>
      {error && (
        <p className="flex items-start gap-1.5 mz-body-sm text-danger-ink" role="alert">
          <Icon name="alert-circle" size={16} className="mt-px" />
          {error}
        </p>
      )}
    </fieldset>
  );
}

/* ---------- Dialogs ---------- */

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Keeps focus inside a dialog, closes on Escape and returns focus to the opener. */
export function useDialogFocus(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const box = ref.current;
    const first = box?.querySelector<HTMLElement>("[data-autofocus]") ?? box?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !box) return;
      const items = Array.from(box.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const a = items[0];
      const z = items[items.length - 1];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      opener?.focus?.();
    };
  }, [open]);
  return ref;
}

type DialogTone = "success" | "danger" | "warning" | "info" | "brand";
const TONE: Record<DialogTone, string> = {
  success: "bg-success-bg text-success-ink",
  danger: "bg-danger-bg text-danger-ink",
  warning: "bg-warning-bg text-warning-ink",
  info: "bg-info-bg text-info-ink",
  brand: "bg-primary-tint text-primary-tint-ink",
};

export function Modal({ open, title, description, onClose, children, footer, icon, tone = "brand", size = "md" }: {
  open: boolean; title: string; description?: ReactNode; onClose: () => void; children?: ReactNode; footer?: ReactNode;
  icon?: IconName; tone?: DialogTone; size?: "sm" | "md" | "lg";
}) {
  const ref = useDialogFocus(open, onClose);
  const titleId = useId();
  const descId = useId();
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-[var(--scrim)] p-0 sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={cx(
          "flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-lg bg-surface-raised text-ink shadow-3 sm:max-h-[calc(100dvh-32px)] sm:rounded-lg",
          size === "sm" ? "sm:max-w-[420px]" : size === "lg" ? "sm:max-w-[680px]" : "sm:max-w-[520px]",
        )}
      >
        <div className="flex items-start gap-3 border-b border-line px-5 py-4">
          {icon && (
            <span className={cx("flex size-10 shrink-0 items-center justify-center rounded-pill", TONE[tone])}>
              <Icon name={icon} />
            </span>
          )}
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 id={titleId} className="mz-h3 text-primary-tint-ink">{title}</h2>
            {description && <p id={descId} className="mt-0.5 mz-body-sm text-ink-muted">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-m-1 rounded-sm p-1.5 text-ink-subtle transition-colors duration-150 hover:bg-surface-hover hover:text-ink"
          >
            <Icon name="x" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-surface-sunken px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

/** Centered message with a big icon: used after a successful action. */
export function SuccessDialog({ open, title, children, onClose, action }: { open: boolean; title: string; children?: ReactNode; onClose: () => void; action?: ReactNode }) {
  const ref = useDialogFocus(open, onClose);
  const titleId = useId();
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[var(--scrim)] p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={ref} role="alertdialog" aria-modal="true" aria-labelledby={titleId} className="relative flex w-full max-w-[400px] flex-col items-center gap-3 rounded-lg bg-surface-raised px-6 pb-6 pt-8 text-center shadow-3">
        <button type="button" onClick={onClose} aria-label="Close dialog" className="absolute right-3 top-3 rounded-sm p-1.5 text-ink-subtle hover:bg-surface-hover hover:text-ink">
          <Icon name="x" />
        </button>
        <span className="flex size-16 items-center justify-center rounded-pill bg-success-bg text-success-ink">
          <Icon name="circle-check" size={36} />
        </span>
        <h2 id={titleId} className="mz-h2 text-primary-tint-ink">{title}</h2>
        {children && <div className="text-ink-muted">{children}</div>}
        <div className="mt-2 flex w-full flex-col gap-2">
          {action}
          <Button variant={action ? "secondary" : "primary"} block onClick={onClose} data-autofocus>Close</Button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title, children, confirmLabel, onConfirm, onClose, tone = "danger" }: {
  open: boolean; title: string; children?: ReactNode; confirmLabel: string; onConfirm: () => void; onClose: () => void; tone?: "danger" | "primary";
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      icon={tone === "danger" ? "trash" : "info"}
      tone={tone === "danger" ? "danger" : "brand"}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} data-autofocus>Cancel</Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}

/** Multi-line text input matching the shared TextField. */
export function TextArea({ label, value, onChange, error, hint, maxLength, rows = 4, placeholder, id }: {
  label: string; value: string; onChange: (v: string) => void; error?: string; hint?: string; maxLength?: number; rows?: number; placeholder?: string; id?: string;
}) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="mz-label text-ink">{label}</label>
      <textarea
        id={fieldId}
        rows={rows}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${fieldId}-msg`}
        className={cx(
          "w-full resize-y rounded-md border bg-surface-raised px-3 py-2 text-ink outline-none placeholder:text-ink-subtle transition-colors duration-150",
          error ? "border-danger-ink" : "border-line-strong focus:border-focus",
        )}
      />
      <div id={`${fieldId}-msg`} className="flex items-start justify-between gap-3 mz-body-sm">
        {error ? (
          <p className="flex items-start gap-1.5 text-danger-ink"><Icon name="alert-circle" size={16} className="mt-px" />{error}</p>
        ) : (
          <p className="text-ink-muted">{hint}</p>
        )}
        {maxLength && <p className="shrink-0 text-ink-muted mz-num">{value.length}/{maxLength}</p>}
      </div>
    </div>
  );
}
