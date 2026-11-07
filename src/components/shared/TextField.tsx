"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { Field, CONTROL_HEIGHT, controlFrame, describedBy, type FieldSize } from "./Field";
import { Icon, type IconName } from "./Icon";
import { cx } from "./cx";

export type TextFieldProps = Omit<ComponentProps<"input">, "size" | "prefix"> & {
  label: string;
  /** Visually hide the label. Screen readers still read it. */
  labelHidden?: boolean;
  hint?: ReactNode;
  error?: string;
  icon?: IconName;
  prefix?: ReactNode;
  suffix?: ReactNode;
  size?: FieldSize;
  /** Show "(optional)" after the label. */
  optional?: boolean;
  fieldClassName?: string;
};

export function TextField({
  label, labelHidden, hint, error, icon, prefix, suffix, size = "md", optional, id, className, fieldClassName, ...rest
}: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <Field id={inputId} label={label} labelHidden={labelHidden} hint={hint} error={error} optional={optional} className={fieldClassName}>
      <div className={cx("flex items-center gap-2 px-3", CONTROL_HEIGHT[size], controlFrame(error), className)}>
        {icon && <Icon name={icon} size={20} className="text-ink-subtle" />}
        {prefix && <span className="text-body text-ink-muted">{prefix}</span>}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, hint, error)}
          className="h-full min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-subtle disabled:text-ink-disabled"
          {...rest}
        />
        {suffix}
      </div>
    </Field>
  );
}
