"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { Icon } from "./Icon";
import { cx } from "./cx";

export type CheckboxProps = Omit<ComponentProps<"input">, "type"> & {
  label: ReactNode;
  description?: ReactNode;
  error?: string;
};

export function Checkbox({ label, description, error, id, className, ...rest }: CheckboxProps) {
  const autoId = useId();
  const boxId = id ?? autoId;
  const msgId = description || error ? `${boxId}-msg` : undefined;
  return (
    <div className={cx("flex flex-col gap-1", className)}>
      <div className="flex items-start gap-3">
        <span className="relative mt-px flex size-5 shrink-0">
          <input
            id={boxId}
            type="checkbox"
            aria-invalid={error ? true : undefined}
            aria-describedby={msgId}
            className={cx(
              "peer size-5 cursor-pointer appearance-none rounded-sm border bg-surface-raised transition-colors duration-150",
              "checked:border-primary checked:bg-primary disabled:bg-surface-sunken",
              error ? "border-danger-ink" : "border-line-strong",
            )}
            {...rest}
          />
          <Icon
            name="check"
            size={16}
            strokeWidth={2.5}
            className="pointer-events-none absolute left-0.5 top-0.5 hidden text-primary-on peer-checked:block"
          />
        </span>
        <label htmlFor={boxId} className="cursor-pointer text-body text-ink">
          {label}
        </label>
      </div>
      {error ? (
        <p id={msgId} className="ml-8 flex items-start gap-1.5 text-body-sm text-danger-ink">
          <Icon name="alert-circle" size={16} className="mt-px" />
          {error}
        </p>
      ) : description ? (
        <p id={msgId} className="ml-8 text-body-sm text-ink-muted">
          {description}
        </p>
      ) : null}
    </div>
  );
}
