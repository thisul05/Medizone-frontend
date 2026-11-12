"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "@/components/shared";

interface InventoryModalProps {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  size?: "md" | "lg";
}

/** Native dialogs keep keyboard focus inside the inventory task. */
export function InventoryModal({ title, description, children, onClose, size = "md" }: InventoryModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    const firstField = dialog.querySelector<HTMLElement>("form input:not([type='hidden']):not(:disabled), form select:not(:disabled), form button:not(:disabled)");
    firstField?.focus({ preventScroll: true });

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={headingId}
      aria-describedby={description ? descriptionId : undefined}
      className={`fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] ${size === "lg" ? "max-w-5xl" : "max-w-2xl"} overflow-y-auto rounded-lg border border-line bg-surface-raised p-0 text-ink shadow-3 backdrop:bg-(--scrim)`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
      }}
    >
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-surface-raised px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <h2 id={headingId} className="mz-h3">{title}</h2>
          {description && <p id={descriptionId} className="mt-1 mz-body-sm text-ink-muted">{description}</p>}
        </div>
        <Button variant="ghost" icon="x" aria-label={`Close ${title.toLowerCase()}`} className="shrink-0 px-2.5" onClick={onClose} />
      </div>
      {children}
    </dialog>
  );
}

export default InventoryModal;
