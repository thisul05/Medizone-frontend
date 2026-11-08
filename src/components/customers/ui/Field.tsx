"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Icon, type IconName } from "./Icon";

const controlBox =
  "flex items-center gap-2 rounded-md border bg-(--surface-raised) px-3 text-(--ink) transition-[border-color,box-shadow] duration-150 hover:border-(--ink-subtle) focus-within:border-(--focus-ring) focus-within:shadow-[0_0_0_1px_var(--focus-ring)]";
const controlError =
  "border-(--danger-ink) hover:border-(--danger-ink) focus-within:border-(--danger-ink) focus-within:shadow-[0_0_0_1px_var(--danger-ink)]";
const innerInput =
  "h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] leading-[22px] text-inherit outline-none placeholder:text-(--ink-subtle) focus-visible:outline-none";

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
        <label htmlFor={id} className={labelHidden ? "sr-only" : "text-sm leading-[18px] font-semibold text-(--ink)"}>
          {label}
          {required ? (
            <span className="text-(--danger-ink)" aria-hidden>
              {" "}
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-msg`} className="flex items-center gap-1 text-[13px] leading-[18px] font-medium text-(--danger-ink)">
          <Icon name="alertCircle" size={14} />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-msg`} className="text-[13px] leading-[18px] text-(--ink-muted)">
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
  /** Fully rounded, like the search bar on medizone.lk. */
  pill?: boolean;
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
  pill,
  id: givenId,
  required,
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const id = givenId ?? autoId;
  const shape = pill ? "rounded-full px-4" : size === "sm" ? "rounded-sm" : "";
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} labelHidden={labelHidden} className={containerClassName}>
      <div className={`${controlBox} ${size === "sm" ? "h-8" : "h-10"} ${shape} ${error ? controlError : "border-(--border-strong)"}`}>
        {icon ? <Icon name={icon} size={18} className="text-(--ink-subtle)" /> : null}
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
  ...rest
}: SelectFieldProps) {
  const autoId = useId();
  const id = givenId ?? autoId;
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} labelHidden={labelHidden} className={containerClassName}>
      <div className={`relative ${controlBox} ${size === "sm" ? "h-8 rounded-sm" : "h-10"} ${error ? controlError : "border-(--border-strong)"}`}>
        <select
          id={id}
          required={required}
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
        <Icon name="chevronDown" size={18} className="pointer-events-none absolute right-3 text-(--ink-muted)" />
      </div>
    </FieldShell>
  );
}

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: ReactNode;
  error?: string;
}

export function TextareaField({ label, hint, error, id: givenId, required, ...rest }: TextareaFieldProps) {
  const autoId = useId();
  const id = givenId ?? autoId;
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error}>
      <div className={`${controlBox} items-stretch py-2 ${error ? controlError : "border-(--border-strong)"}`}>
        <textarea
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          className={`${innerInput} min-h-24 resize-y`}
          {...rest}
        />
      </div>
    </FieldShell>
  );
}

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  description?: ReactNode;
}

export function Checkbox({ label, description, id: givenId, ...rest }: CheckboxProps) {
  const autoId = useId();
  const id = givenId ?? autoId;
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-start gap-2.5">
      <input id={id} type="checkbox" className="mt-0.5 size-5 flex-none cursor-pointer accent-(--primary)" {...rest} />
      <span className="flex flex-col gap-0.5">
        <span className="font-medium text-(--ink)">{label}</span>
        {description ? <span className="text-[13px] leading-[18px] text-(--ink-muted)">{description}</span> : null}
      </span>
    </label>
  );
}

/** Search box with an icon, used above every list in the module. */
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
        pill
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
    </div>
  );
}
