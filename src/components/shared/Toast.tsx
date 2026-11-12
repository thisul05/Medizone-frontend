"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { Icon } from "./Icon";
import { TONE_ICON, type Tone } from "./Alert";
import { cx } from "./cx";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastInput {
  tone?: Tone;
  title: string;
  description?: string;
  action?: ToastAction;
}

interface ToastItem extends ToastInput {
  id: number;
}

type ShowToast = (toast: ToastInput) => void;

const ToastContext = createContext<ShowToast | null>(null);

const ICON_INK: Record<Tone, string> = {
  info: "text-info-ink",
  success: "text-success-ink",
  warning: "text-warning-ink",
  danger: "text-danger-ink",
  neutral: "text-neutral-ink",
  transit: "text-transit-ink",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback<ShowToast>(
    (toast) => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-3), { ...toast, id }]);
      // Danger toasts stay until dismissed.
      if (toast.tone !== "danger") window.setTimeout(() => dismiss(id), 5000);
    },
    [dismiss],
  );

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 left-4 z-[60] flex flex-col items-end gap-2 sm:left-auto"
      >
        {toasts.map((t) => {
          const tone = t.tone ?? "success";
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-md border border-line bg-surface-raised p-4 shadow-2"
            >
              <Icon name={TONE_ICON[tone]} size={20} className={cx("mt-px", ICON_INK[tone])} />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="mz-label text-ink">{t.title}</p>
                {t.description && <p className="mz-body-sm text-ink-muted">{t.description}</p>}
                {t.action && (
                  <button
                    type="button"
                    onClick={() => {
                      t.action?.onClick();
                      dismiss(t.id);
                    }}
                    className="mt-1 self-start mz-label text-link underline-offset-2 hover:underline"
                  >
                    {t.action.label}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="-m-1 rounded-sm p-1 text-ink-subtle transition-colors duration-150 hover:bg-surface-hover hover:text-ink"
              >
                <Icon name="x" size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ShowToast {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
