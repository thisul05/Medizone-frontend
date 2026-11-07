"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { Field, CONTROL_HEIGHT, controlFrame, describedBy, type FieldSize } from "./Field";
import { Icon } from "./Icon";
import { cx } from "./cx";

export interface SelectOption {
  value: string;
  label: string;
}

export type SelectProps = Omit<ComponentProps<"select">, "size"> & {
  label: string;
  labelHidden?: boolean;
  options: SelectOption[];
  placeholder?: string;
  hint?: ReactNode;
  error?: string;
  size?: FieldSize;
  optional?: boolean;
  fieldClassName?: string;
  /** "nav" for navy surfaces such as the staff top bar. */
  tone?: "default" | "nav";
};

export function Select({
  label, labelHidden, options, placeholder, hint, error, size = "md", optional, id, className, fieldClassName, tone = "default", ...rest
}: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const nav = tone === "nav";
  return (
    <Field id={selectId} label={label} labelHidden={labelHidden} hint={hint} error={error} optional={optional} className={fieldClassName}>
      <div className={cx("relative", CONTROL_HEIGHT[size], nav ? "rounded-md border border-nav-muted bg-nav-active" : controlFrame(error), className)}>
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(selectId, hint, error)}
          className={cx(
            "h-full w-full cursor-pointer appearance-none rounded-md bg-transparent pl-3 pr-9 text-body outline-none",
            nav ? "text-nav-ink" : "text-ink",
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-surface-raised text-ink">
              {o.label}
            </option>
          ))}
        </select>
        <Icon
          name="chevron-down"
          size={20}
          className={cx("pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2", nav ? "text-nav-ink" : "text-ink-subtle")}
        />
      </div>
    </Field>
  );
}
