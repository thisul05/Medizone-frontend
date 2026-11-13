"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Icon, type IconName } from "./Icon";

const controlBox =
  "flex items-center gap-2 rounded-md border bg-(--surface-raised) px-3 text-(--ink) transition-[border-color,box-shadow] duration-150 hover:border-(--border-strong) focus-within:border-(--focus-ring) focus-within:shadow-[0_0_0_1px_var(--focus-ring)]";
const controlError =
  "border-(--danger-ink) hover:border-(--danger-ink) focus-within:border-(--danger-ink) focus-within:shadow-[0_0_0_1px_var(--danger-ink)]";
const innerInput =
  "h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm leading-5 text-inherit outline-none placeholder:text-(--ink-muted) focus-visible:outline-none disabled:cursor-not-allowed";

interface FieldShellProps {
  id: string;
  label?: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
  labelHidden?: boolean;
}

function FieldShell({ id, label, required, hint, error, children, className = "", labelHidden }: FieldShellProps) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      {label ? (
        <label htmlFor={id} className={labelHidden ? "sr-only" : "text-[13px] leading-[18px] font-medium text-(--ink)"}>
          {label}
          {required ? <span aria-hidden>*</span> : null}
          {required ? <span className="sr-only"> (required)</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-msg`} className="text-xs leading-4 text-(--danger-ink)">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-msg`} className="text-xs leading-4 text-(--ink-muted)">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  label?: string;
  hint?: ReactNode;
  error?: string;
  icon?: IconName;
  prefix?: ReactNode;
  suffix?: ReactNode;
  size?: "sm" | "md";
  labelHidden?: boolean;
  containerClassName?: string;
}

export function TextField({
  label,
  hint,
  error,
  icon,
  prefix,
  suffix,
  size = "md",
  labelHidden,
  containerClassName,
  id: givenId,
  required,
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const id = givenId ?? autoId;
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} labelHidden={labelHidden} className={containerClassName}>
      <div className={`${controlBox} ${size === "sm" ? "h-8" : "h-10"} ${error ? controlError : "border-(--border)"}`}>
        {icon ? <Icon name={icon} size={18} className="text-(--ink-muted)" /> : null}
        {prefix ? <span className="text-sm font-medium text-(--ink-muted)">{prefix}</span> : null}
        <input
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          className={innerInput}
          {...rest}
        />
        {suffix ? <span className="text-sm font-medium text-(--ink-muted)">{suffix}</span> : null}
      </div>
    </FieldShell>
  );
}

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  hint?: ReactNode;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  size?: "sm" | "md";
  labelHidden?: boolean;
  containerClassName?: string;
}

export function SelectField({
  label,
  hint,
  error,
  options,
  placeholder,
  size = "md",
  labelHidden,
  containerClassName,
  id: givenId,
  required,
  disabled,
  ...rest
}: SelectFieldProps) {
  const autoId = useId();
  const id = givenId ?? autoId;
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} labelHidden={labelHidden} className={containerClassName}>
      <div
        className={`relative ${controlBox} ${size === "sm" ? "h-8" : "h-10"} ${error ? controlError : "border-(--border)"} ${disabled ? "bg-(--surface-sunken) hover:border-(--border)" : ""}`}
      >
        <select
          id={id}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          className={`${innerInput} cursor-pointer appearance-none pr-6 [&>option]:bg-(--surface-raised) [&>option]:text-(--ink)`}
          {...rest}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon name="chevronDown" size={18} className="pointer-events-none absolute right-3 text-(--ink)" />
      </div>
    </FieldShell>
  );
}

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: ReactNode;
  error?: string;
  containerClassName?: string;
}

export function TextareaField({ label, hint, error, id: givenId, required, containerClassName, ...rest }: TextareaFieldProps) {
  const autoId = useId();
  const id = givenId ?? autoId;
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} className={containerClassName}>
      <div className={`${controlBox} items-stretch py-2 ${error ? controlError : "border-(--border)"}`}>
        <textarea
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          className={`${innerInput} min-h-16 resize-y`}
          {...rest}
        />
      </div>
    </FieldShell>
  );
}

/** Label beside a select, as in "Customer Type [All ▾]" in the design. */
export function InlineSelect({
  label,
  value,
  onChange,
  options,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  const id = useId();
  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`}>
      <label htmlFor={id} className="flex-none text-sm font-medium text-(--ink)">
        {label}
      </label>
      <SelectField id={id} value={value} onChange={(e) => onChange(e.target.value)} options={options} containerClassName="min-w-0 flex-1" />
    </div>
  );
}

/** Search box with a magnifier icon, used above every list in the module. */
export function SearchInput({
  label,
  value,
  onChange,
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative min-w-0 ${className}`}>
      <TextField
        type="search"
        icon="search"
        label={label}
        labelHidden
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
    </div>
  );
}
