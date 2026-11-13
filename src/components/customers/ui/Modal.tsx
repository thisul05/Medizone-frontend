"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Icon } from "./Icon";

interface ModalProps {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  size?: "md" | "lg";
  /** Draw a line under the header (Reminder Preview in the design). */
  divider?: boolean;
  children?: ReactNode;
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Centered dialog (Figma): navy title, muted subtitle, square close button.
 * Closes on Escape, the close button and the backdrop; keeps focus inside and returns it afterwards.
 */
export function Modal({ open, title, description, onClose, footer, size = "md", divider, children }: ModalProps) {
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
        className={`flex max-h-[calc(100dvh-32px)] w-full flex-col overflow-hidden rounded-[12px] bg-(--surface-raised) text-(--ink) shadow-(--shadow-3) ${size === "lg" ? "max-w-[600px]" : "max-w-[560px]"}`}
      >
        <div className={`flex items-start gap-3 px-6 pt-6 ${divider ? "border-b border-(--border) pb-4" : ""}`}>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-[22px] leading-7 font-bold text-(--heading)">
              {title}
            </h2>
            {description ? (
              <p id={descId} className="mt-2 text-[13px] leading-[18px] text-(--ink-muted)">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 flex-none cursor-pointer place-items-center rounded-[6px] bg-(--soft-bg) text-(--ink) hover:bg-(--soft-bg-hover)"
          >
            <Icon name="x" size={16} />
          </button>
        </div>
        <div className={`overflow-y-auto px-6 ${divider ? "pt-5" : "pt-4"} pb-2`}>{children}</div>
        {footer ? <div className="flex flex-wrap justify-end gap-3 px-6 pt-4 pb-6">{footer}</div> : <div className="pb-4" />}
      </div>
    </div>
  );
}
