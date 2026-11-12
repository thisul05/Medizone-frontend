import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  eyebrow?: ReactNode;
  path?: string;
}

export function PageHeader({ title, description, action, eyebrow, path = "Pharmacy / Customers" }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="text-xs font-medium text-slate-500 mb-1">{path}</div>
        {eyebrow ? <div className="mb-2">{eyebrow}</div> : null}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description ? <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">{description}</p> : null}
      </div>
      {action ? <div className="flex flex-none flex-wrap gap-3">{action}</div> : null}
    </header>
  );
}
