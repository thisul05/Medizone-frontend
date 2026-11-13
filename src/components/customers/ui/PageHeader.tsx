import Link from "next/link";
import { Fragment, type ReactNode } from "react";

export interface Crumb {
  label: string;
  href?: string;
}

/** "Dashboard / Customers" trail above the page title. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[13px] leading-[18px] text-(--ink-muted)">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <Fragment key={item.label}>
            {i > 0 ? <li aria-hidden>/</li> : null}
            <li>
              {item.href && i < items.length - 1 ? (
                <Link href={item.href} className="rounded-sm underline-offset-2 hover:text-(--heading) hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={i === items.length - 1 ? "page" : undefined}>{item.label}</span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

interface PageHeaderProps {
  title: string;
  breadcrumb: Crumb[];
  description?: ReactNode;
  /** Top-right slot: the page's main action or a label chip. */
  action?: ReactNode;
  /** Navy title, used on the customer profile. */
  navyTitle?: boolean;
}

export function PageHeader({ title, breadcrumb, description, action, navyTitle }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <Breadcrumb items={breadcrumb} />
        <h1 className={`mt-2.5 text-[28px] leading-[34px] font-bold ${navyTitle ? "text-(--heading)" : "text-(--ink)"}`}>{title}</h1>
        {description ? <p className="mt-1.5 text-[15px] leading-[22px] text-(--ink-muted)">{description}</p> : null}
      </div>
      {action ? <div className="flex flex-none flex-wrap items-center gap-3 sm:pt-4">{action}</div> : null}
    </header>
  );
}
