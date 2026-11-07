"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

type ModalTone = "danger" | "warning" | "success" | "info";

const toneStyles: Record<ModalTone, { className: string; icon: IconName }> = {
  danger: { className: "bg-(--danger-bg) text-(--danger-ink)", icon: "alertCircle" },
  warning: { className: "bg-(--warning-bg) text-(--warning-ink)", icon: "alert" },
  success: { className: "bg-(--success-bg) text-(--success-ink)", icon: "checkCircle" },
  info: { className: "bg-(--info-bg) text-(--info-ink)", icon: "info" },
};

interface ModalProps {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  tone?: ModalTone;
  icon?: IconName;
  size?: "md" | "lg";
  children?: ReactNode;
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Dialog per the design system: closes on Escape and on the scrim, keeps focus inside,
 * and returns focus to the button that opened it.
 */
export function Modal({ open, title, description, onClose, footer, tone, icon, size = "md", children }: ModalProps) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const first = dialog?.querySelector<HTMLElement>("[data-autofocus]") ?? dialog?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) return null;
  const toneStyle = tone ? toneStyles[tone] : null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-(--scrim) p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={`flex max-h-[calc(100vh-32px)] w-full flex-col overflow-hidden rounded-lg bg-(--surface-raised) text-(--ink) shadow-(--shadow-3) ${size === "lg" ? "max-w-[640px]" : "max-w-[460px]"}`}
      >
        <div className="flex items-start gap-3 px-6 pt-6">
          {toneStyle ? (
            <span className={`grid size-10 flex-none place-items-center rounded-full ${toneStyle.className}`}>
              <Icon name={icon ?? toneStyle.icon} size={20} />
            </span>
          ) : null}
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 id={titleId} className="text-lg leading-6 font-semibold">
              {title}
            </h2>
            {description ? (
              <p id={descId} className="mt-1 text-sm leading-5 text-(--ink-muted)">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded-sm p-1.5 text-(--ink-subtle) hover:bg-(--surface-hover) hover:text-(--ink)"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-6 pt-4 pb-6">{children}</div>
        {footer ? (
          <div className="flex flex-wrap justify-end gap-3 border-t border-(--border) bg-(--surface-sunken) px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
