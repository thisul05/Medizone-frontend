import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { cx } from "./cx";

export type FieldSize = "sm" | "md" | "lg";

export const CONTROL_HEIGHT: Record<FieldSize, string> = {
  sm: "h-control-sm",
  md: "h-control-md",
  lg: "h-control-lg",
};

export const controlFrame = (error?: string) =>
  cx(
    "rounded-md bg-surface-raised border transition-colors duration-150",
    error ? "border-danger-ink" : "border-line-strong focus-within:border-focus",
  );

interface FieldProps {
  id: string;
  label: string;
  labelHidden?: boolean;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}

/** Label, control and the hint or error below it. The error replaces the hint. */
export function Field({ id, label, labelHidden, hint, error, optional, children, className }: FieldProps) {
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className={cx("mz-label text-ink", labelHidden && "sr-only")}>
        {label}
        {optional && <span className="font-normal text-ink-muted"> (optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-msg`} className="flex items-start gap-1.5 mz-body-sm text-danger-ink">
          <Icon name="alert-circle" size={16} className="mt-px" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={`${id}-msg`} className="mz-body-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const describedBy = (id: string, hint?: ReactNode, error?: string) =>
  hint || error ? `${id}-msg` : undefined;
